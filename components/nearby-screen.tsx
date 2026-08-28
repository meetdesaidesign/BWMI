"use client";

import { ChevronDown, LocateFixed, Search, X } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import { LocationSheet } from "./location-sheet";
import { FilterBar, type FilterPanel } from "./filter-bar";
import { FilterSheet, type LocationStatus } from "./filter-sheet";
import { IssueCarousel } from "./issue-carousel";
import { MapLoader } from "./map-loader";
import { ProfileAvatar } from "./profile-avatar";
import { areaContext } from "@/lib/authority";
import { track } from "@/lib/analytics";
import { applyFilters, defaultFilters, previewCount, readStoredFilters, writeStoredFilters } from "@/lib/filters";
import { WARD_CENTER, boundsMovedAway, locateInWard, type MapBounds, type MapViewport } from "@/lib/geo";
import { formatCopy, getPublicStatusLabel, type getCopy } from "@/lib/i18n";
import { publicStatusOf } from "@/lib/public-status";
import type { FilterState, Issue, Locale } from "@/lib/types";

/** Height the map assumes for the deck before it has been measured once. */
const DECK_PEEK_ESTIMATE = 268;

function titleOf(issue: Issue, locale: Locale) {
  return locale === "hi" ? issue.titleHi : locale === "kn" ? issue.titleKn : issue.titleEn;
}

export type NearbyScreenHandle = {
  resetPeek: () => void;
  focusIssue: (id: string) => void;
};

export const NearbyScreen = forwardRef<NearbyScreenHandle, {
  issues: Issue[];
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  offline: boolean;
  onOpenIssue: (issue: Issue) => void;
  onOpenProfile: () => void;
  identityVerified: boolean;
}>(function NearbyScreen({
  issues,
  locale,
  t,
  offline,
  onOpenIssue,
  onOpenProfile,
  identityVerified,
}, ref) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [recenterNonce, setRecenterNonce] = useState(0);
  const [here, setHere] = useState<[number, number]>(WARD_CENTER);
  const [gps, setGps] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  // "Search this area" is a one-off narrowing of the results to what the resident
  // panned to — deliberately not part of the saved filters, so it never outlives
  // the session or hides issues on the next visit.
  const [searchArea, setSearchArea] = useState<MapBounds | null>(null);
  const [areaStale, setAreaStale] = useState(false);
  // The view the current results describe. Only a pan away from it earns the button.
  const resultBounds = useRef<MapBounds | null>(null);
  const viewportRef = useRef<MapViewport | null>(null);
  // Snapshot of the ids the deck opened with. The map recentres on every swipe,
  // which reorders the distance-sorted results — the deck must not reshuffle
  // under the thumb that is swiping it.
  const [deckIds, setDeckIds] = useState<string[] | null>(null);
  const [deckPeek, setDeckPeek] = useState(DECK_PEEK_ESTIMATE);
  const [filterPanel, setFilterPanel] = useState<FilterPanel | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);

  useEffect(() => {
    const stored = readStoredFilters();
    if (stored) setFilters(stored);
  }, []);

  const flyToHere = useCallback((coords?: [number, number]) => {
    if (coords) setHere(coords);
    setRecenterNonce((n) => n + 1);
  }, []);

  const clearSearchArea = useCallback(() => {
    setSearchArea(null);
    setAreaStale(false);
    // Results now describe the whole area again, as seen from where the map sits.
    resultBounds.current = viewportRef.current?.bounds ?? null;
  }, []);

  const handleViewport = useCallback((next: MapViewport, meta: { userDriven: boolean }) => {
    setViewport(next);
    viewportRef.current = next;
    if (!meta.userDriven) {
      // Recentres and marker zooms are ours: the results follow the map, so the
      // view they describe moves with it and nothing has gone stale.
      resultBounds.current = next.bounds;
      return;
    }
    const anchor = resultBounds.current;
    if (!anchor) {
      resultBounds.current = next.bounds;
      return;
    }
    if (boundsMovedAway(anchor, next.bounds)) setAreaStale(true);
  }, []);

  const searchThisArea = useCallback(() => {
    if (!viewport) return;
    setSearchArea(viewport.bounds);
    resultBounds.current = viewport.bounds;
    setAreaStale(false);
    track("map_search_area", { source: "map_pan" });
  }, [viewport]);

  const requestHere = useCallback((recenter: boolean, source: "map" | "filter" = "map") => {
    const finish = (coords: [number, number]) => {
      setGps(coords);
      setLocationStatus("ready");
      if (recenter) flyToHere(coords);
      else setHere(coords);
    };
    if (!navigator.geolocation) {
      setLocationStatus("unsupported");
      if (source === "filter") {
        track("map_filter_location_error", { errorType: "unsupported", permissionState: "unavailable" });
      }
      if (recenter) flyToHere();
      return;
    }
    setLocationStatus("prompting");
    navigator.geolocation.getCurrentPosition(
      (pos) => finish(locateInWard(pos.coords.latitude, pos.coords.longitude)),
      (error) => {
        const denied = error.code === error.PERMISSION_DENIED;
        setLocationStatus(denied ? "denied" : "error");
        if (source === "filter") {
          track("map_filter_location_error", {
            errorType: denied ? "permission_denied" : "lookup_failed",
            permissionState: denied ? "denied" : "prompt",
          });
        }
        if (recenter) flyToHere();
      },
      { timeout: 8000, enableHighAccuracy: true, maximumAge: 30_000 },
    );
  }, [flyToHere]);

  const requestFilterLocation = useCallback(() => {
    if (locationStatus === "prompting" || locationStatus === "ready") return;
    requestHere(false, "filter");
  }, [locationStatus, requestHere]);

  const origin = gps ?? viewport?.center ?? here;
  const filterContext = useMemo(
    () => ({ bounds: searchArea, origin, userCoordinates: gps, wardAvailable: true }),
    [searchArea, origin, gps],
  );
  const countDraft = useCallback((draft: FilterState) => previewCount(issues, draft, filterContext), [issues, filterContext]);
  const mapIssues = useMemo(
    () => applyFilters(issues, filters, filterContext),
    [issues, filters, filterContext],
  );

  useImperativeHandle(ref, () => ({
    resetPeek: () => {
      setHighlightedId(null);
      setDeckIds(null);
    },
    focusIssue: (id: string) => {
      if (!issues.some((issue) => issue.id === id)) return;
      setHighlightedId(id);
      setDeckIds((current) => {
        if (current?.includes(id)) return current;
        const ids = mapIssues.map((item) => item.id);
        return ids.includes(id) ? ids : [id, ...ids];
      });
    },
  }), [issues, mapIssues]);

  const highlighted = issues.find((issue) => issue.id === highlightedId) ?? null;
  const deckIssues = useMemo(() => {
    if (!deckIds) return [];
    const byId = new Map(issues.map((issue) => [issue.id, issue]));
    return deckIds.map((id) => byId.get(id)).filter((issue): issue is Issue => issue != null);
  }, [deckIds, issues]);
  const deckOpen = highlighted != null && deckIssues.some((issue) => issue.id === highlighted.id);
  const dockPeek = deckOpen ? deckPeek : 0;
  // Authority stays secondary to the location, and drops out entirely when unknown.
  const authorityLine = areaContext.corporation[locale] || areaContext.authority.organizationName[locale] || "";
  const localeTag = locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "kn-IN";

  // Filters (or a fresh sync) can retire a card mid-deck. Drop it, keep the order.
  useEffect(() => {
    if (!deckIds) return;
    const live = new Set(mapIssues.map((issue) => issue.id));
    const pruned = deckIds.filter((id) => live.has(id));
    if (pruned.length !== deckIds.length) setDeckIds(pruned.length > 0 ? pruned : null);
  }, [mapIssues, deckIds]);

  const applyFiltersAndStore = (next: FilterState) => {
    setFilters(next);
    writeStoredFilters(next);
    // Picking a ward or a radius is a geography of its own — intersecting it with
    // a leftover map area would quietly hide issues the resident just asked for.
    if (next.locationScope !== "all") clearSearchArea();
    if (next.locationScope === "near_me" && gps) flyToHere(gps);
    if (highlightedId && !applyFilters(issues, next, { ...filterContext, userCoordinates: gps }).some((issue) => issue.id === highlightedId)) {
      clearSelection();
    }
  };

  const selectIssue = (issue: Issue) => {
    if (highlightedId === issue.id && deckOpen) {
      onOpenIssue(issue);
      return;
    }
    setHighlightedId(issue.id);
    setDeckIds((current) => {
      if (current?.includes(issue.id)) return current;
      const ids = mapIssues.map((item) => item.id);
      return ids.includes(issue.id) ? ids : [issue.id, ...ids];
    });
  };

  const clearSelection = () => {
    setHighlightedId(null);
    setDeckIds(null);
  };

  const markerLabel = useCallback((issue: Issue) => {
    const publicStatus = getPublicStatusLabel(publicStatusOf(issue), locale);
    return `${titleOf(issue, locale)}, ${publicStatus}, ${issue.address}, ${formatCopy(t.confirmations, { count: issue.supporters })}`;
  }, [locale, t]);

  const clusterLabel = useCallback((count: number) => formatCopy(t.clusterAria, { count }), [t]);

  const empty = mapIssues.length === 0;
  const unfiltered = applyFilters(
    issues,
    { ...defaultFilters, statusGroups: [], categories: [] },
    filterContext,
  );
  const emptyCopy = unfiltered.length === 0 ? t.noIssuesYet : t.noFilterResults;

  return (
    <div className="nearby-stage" style={{ ["--sheet-peek" as string]: `${dockPeek}px` }}>
      <MapLoader
        issues={mapIssues}
        selected={highlighted ?? undefined}
        onSelect={selectIssue}
        onDeselect={clearSelection}
        onViewportChange={handleViewport}
        here={here}
        recenterNonce={recenterNonce}
        locale={locale}
        sheetPeek={dockPeek}
        hereAria={t.youAreHereAria}
        getMarkerLabel={markerLabel}
        getClusterLabel={clusterLabel}
      />

      <div className="map-overlays">
        <header className="top-surface">
          <button
            type="button"
            className="top-surface-place"
            onClick={() => setLocationOpen(true)}
            aria-haspopup="dialog"
            aria-label={`${areaContext.areaName[locale]}${authorityLine ? `, ${authorityLine}` : ""}. ${t.areaDetails}`}
          >
            <span className="top-surface-text">
              <span className="top-surface-name">{areaContext.areaName[locale]}</span>
              {authorityLine ? <small>{authorityLine}</small> : null}
            </span>
            <ChevronDown size={16} aria-hidden />
          </button>
          <button
            type="button"
            className="top-surface-profile"
            onClick={onOpenProfile}
            aria-label={identityVerified ? t.profileAriaVerified : t.profileAria}
          >
            <ProfileAvatar size={32} alt="" />
          </button>
        </header>
        <FilterBar locale={locale} t={t} filters={filters} onOpen={setFilterPanel} />
        {areaStale ? (
          <button type="button" className="map-area-action" onClick={searchThisArea}>
            <Search size={15} strokeWidth={2.25} aria-hidden />
            {t.searchThisArea}
          </button>
        ) : searchArea ? (
          <button type="button" className="map-area-action is-applied" onClick={clearSearchArea} aria-label={t.clearAreaSearch}>
            {t.searchingThisArea}
            <X size={15} strokeWidth={2.25} aria-hidden />
          </button>
        ) : null}
      </div>

      {offline && (
        <p className="offline-map-label">{formatCopy(t.offlineUpdated, { time: new Intl.DateTimeFormat(localeTag, { hour: "numeric", minute: "2-digit" }).format(new Date()) })}</p>
      )}

      <button type="button" className="map-recenter" onClick={() => { clearSearchArea(); requestHere(true); }} aria-label={t.locateAria}>
        <LocateFixed size={18} />
      </button>

      {empty && !deckOpen ? (
        <div className="map-empty" role="status">
          <p className="type-caption">{emptyCopy}</p>
          {unfiltered.length > 0 ? (
            <button type="button" className="text-button" onClick={() => { clearSearchArea(); applyFiltersAndStore(defaultFilters); }}>{t.clearFilters}</button>
          ) : null}
        </div>
      ) : null}

      {deckOpen && highlighted ? (
        <IssueCarousel
          issues={deckIssues}
          selectedId={highlighted.id}
          locale={locale}
          t={t}
          origin={origin}
          onSelect={selectIssue}
          onOpen={onOpenIssue}
          onClose={clearSelection}
          onHeight={setDeckPeek}
        />
      ) : null}

      <FilterSheet
        open={filterPanel !== null}
        panel={filterPanel}
        locale={locale}
        t={t}
        applied={filters}
        resultCount={countDraft}
        locationStatus={locationStatus}
        wardAvailable
        offline={offline}
        hasCachedIssues={issues.length > 0}
        onNeedLocation={requestFilterLocation}
        onRetryLocation={() => requestHere(false, "filter")}
        onClose={() => setFilterPanel(null)}
        onApply={applyFiltersAndStore}
      />
      <LocationSheet open={locationOpen} locale={locale} t={t} area={areaContext} onClose={() => setLocationOpen(false)} />
    </div>
  );
});
