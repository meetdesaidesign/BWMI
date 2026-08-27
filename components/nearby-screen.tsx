"use client";

/* eslint-disable @next/next/no-img-element -- issue evidence thumbnails include local SVGs and data URLs */

import { ChevronDown, ChevronRight, Globe2, LocateFixed, MapPin } from "lucide-react";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useState } from "react";
import { LocationSheet } from "./location-sheet";
import { FilterBar, type FilterPanel } from "./filter-bar";
import { FilterSheet, type LocationStatus } from "./filter-sheet";
import { LanguageSheet } from "./language-sheet";
import { MapLoader } from "./map-loader";
import { ResultsSheet, type SheetSnap } from "./results-sheet";
import { ProfileAvatar } from "./profile-avatar";
import { CategoryIcon } from "./category-icon";
import { areaContext } from "@/lib/authority";
import { track } from "@/lib/analytics";
import { applyFilters, defaultFilters, previewCount, readStoredFilters, writeStoredFilters } from "@/lib/filters";
import { WARD_CENTER, distanceMeters, formatDistance, locateInWard, type MapViewport } from "@/lib/geo";
import { formatCopy, getCategoryLabel, getPublicStatusLabel, getStatusLabel, type getCopy } from "@/lib/i18n";
import { LOCALE_META } from "@/lib/locale";
import { publicStatusOf } from "@/lib/public-status";
import type { FilterState, Issue, Locale, MapViewMode } from "@/lib/types";

const statusClass: Record<Issue["status"], string> = {
  reported: "slate", acknowledged: "slate", in_progress: "amber", awaiting_confirmation: "violet", confirmed: "green", contested: "red",
};

function titleOf(issue: Issue, locale: Locale) {
  return locale === "hi" ? issue.titleHi : locale === "kn" ? issue.titleKn : issue.titleEn;
}

function lastUpdateOf(issue: Issue) {
  return issue.timeline[issue.timeline.length - 1]?.date ?? issue.reportedAgoEn;
}

function IssueSummary({
  issue,
  locale,
  t,
  origin,
  compact,
  selected,
  onClick,
}: {
  issue: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  origin: [number, number];
  compact?: boolean;
  selected?: boolean;
  onClick: () => void;
}) {
  const distance = formatDistance(distanceMeters(origin[0], origin[1], issue.lat, issue.lng), locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "kn-IN");
  return (
    <button type="button" className={`issue-summary ${compact ? "is-compact" : ""} ${selected ? "is-selected" : ""}`} onClick={onClick}>
      <span className="issue-summary-media">
        {issue.image ? <img src={issue.image} alt="" loading={compact || selected ? "eager" : "lazy"} /> : <CategoryIcon category={issue.category} size={28} />}
      </span>
      <span className="issue-summary-body">
        <span className="issue-summary-meta">
          <span className="issue-summary-category"><CategoryIcon category={issue.category} size={14} />{getCategoryLabel(issue.category, locale)}</span>
          <span className={`status-pill ${statusClass[issue.status]}`}>{getStatusLabel(issue.status, locale)}</span>
        </span>
        <strong className={compact ? "type-heading-sm" : "type-heading-sm"}>{titleOf(issue, locale)}</strong>
        <span className="type-caption"><MapPin size={12} />{issue.address} · {distance}</span>
        <span className="type-caption">{formatCopy(t.confirmations, { count: issue.supporters })}</span>
        {issue.mergedCount ? <span className="type-caption">{formatCopy(t.reportsMerged, { count: issue.mergedCount })}</span> : null}
        <span className="type-caption">{formatCopy(t.lastUpdate, { time: lastUpdateOf(issue) })}</span>
      </span>
      <ChevronRight size={16} aria-hidden />
    </button>
  );
}

export type NearbyScreenHandle = {
  resetPeek: () => void;
};

export const NearbyScreen = forwardRef<NearbyScreenHandle, {
  issues: Issue[];
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  offline: boolean;
  onChangeLocale: (locale: Locale) => void;
  onOpenIssue: (issue: Issue) => void;
  onReport: () => void;
  onOpenProfile: () => void;
  phoneVerified: boolean;
}>(function NearbyScreen({
  issues,
  locale,
  t,
  offline,
  onChangeLocale,
  onOpenIssue,
  onReport,
  onOpenProfile,
  phoneVerified,
}, ref) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [highlightedId, setHighlightedId] = useState<string | null>(null);
  const [snap, setSnap] = useState<SheetSnap>("collapsed");
  const [view, setView] = useState<MapViewMode>("map");
  const [recenterNonce, setRecenterNonce] = useState(0);
  const [here, setHere] = useState<[number, number]>(WARD_CENTER);
  const [gps, setGps] = useState<[number, number] | null>(null);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>("idle");
  const [viewport, setViewport] = useState<MapViewport | null>(null);
  const [sheetPeek, setSheetPeek] = useState(84);
  const [filterPanel, setFilterPanel] = useState<FilterPanel | null>(null);
  const [locationOpen, setLocationOpen] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);

  useImperativeHandle(ref, () => ({
    resetPeek: () => {
      setHighlightedId(null);
      setSnap("collapsed");
    },
  }));

  useEffect(() => {
    const stored = readStoredFilters();
    if (stored) setFilters(stored);
  }, []);

  const flyToHere = useCallback((coords?: [number, number]) => {
    if (coords) setHere(coords);
    setRecenterNonce((n) => n + 1);
  }, []);

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
    () => ({ bounds: viewport?.bounds ?? null, origin, userCoordinates: gps, wardAvailable: true }),
    [viewport, origin, gps],
  );
  const countDraft = useCallback((draft: FilterState) => previewCount(issues, draft, filterContext), [issues, filterContext]);
  const mapIssues = useMemo(
    () => applyFilters(issues, filters, filters.locationScope === "visible_map" ? { ...filterContext, bounds: null } : filterContext),
    [issues, filters, filterContext],
  );
  const listIssues = useMemo(() => applyFilters(issues, filters, filterContext), [issues, filters, filterContext]);
  const highlighted = issues.find((issue) => issue.id === highlightedId) ?? null;
  // Authority stays secondary to the location, and drops out entirely when unknown.
  const authorityLine = areaContext.corporation[locale] || areaContext.authority.organizationName[locale] || "";
  const localeTag = locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "kn-IN";

  const applyFiltersAndStore = (next: FilterState) => {
    setFilters(next);
    writeStoredFilters(next);
    if (next.locationScope === "near_me" && gps) flyToHere(gps);
    if (highlightedId && !applyFilters(issues, next, { ...filterContext, userCoordinates: gps }).some((issue) => issue.id === highlightedId)) {
      setHighlightedId(null);
      setSnap("collapsed");
    }
  };

  const selectIssue = (issue: Issue) => {
    if (highlightedId === issue.id) {
      onOpenIssue(issue);
      return;
    }
    setHighlightedId(issue.id);
    setSnap("selected");
    setView("map");
  };

  const clearSelection = () => {
    setHighlightedId(null);
    if (view === "map") setSnap("collapsed");
  };

  const switchView = (next: MapViewMode) => {
    setView(next);
    if (next === "list") setSnap(snap === "collapsed" || snap === "selected" ? "half" : snap);
    if (next === "map" && !highlightedId) setSnap("collapsed");
    if (next === "map" && highlightedId) setSnap("selected");
  };

  const markerLabel = useCallback((issue: Issue) => {
    const publicStatus = getPublicStatusLabel(publicStatusOf(issue), locale);
    return `${titleOf(issue, locale)}, ${publicStatus}, ${issue.address}, ${formatCopy(t.confirmations, { count: issue.supporters })}`;
  }, [locale, t]);

  const clusterLabel = useCallback((count: number) => formatCopy(t.clusterAria, { count }), [t]);

  const empty = listIssues.length === 0;
  const inViewUnfiltered = applyFilters(issues, { ...defaultFilters, statusGroups: [], categories: [] }, filterContext);
  const emptyCopy = inViewUnfiltered.length === 0 ? t.noIssuesYet : t.noFilterResults;

  return (
    <div className="nearby-stage" style={{ ["--sheet-peek" as string]: `${sheetPeek}px` }}>
      <MapLoader
        issues={mapIssues}
        selected={highlighted ?? undefined}
        onSelect={selectIssue}
        onDeselect={clearSelection}
        onViewportChange={setViewport}
        onReport={onReport}
        here={here}
        recenterNonce={recenterNonce}
        locale={locale}
        sheetPeek={sheetPeek}
        reportLabel={t.reportProblem}
        reportAria={t.reportHereAria}
        getMarkerLabel={markerLabel}
        getClusterLabel={clusterLabel}
      />

      <div className="map-overlays">
        <header className="map-header">
          <button
            type="button"
            className="map-profile"
            onClick={onOpenProfile}
            aria-label={phoneVerified ? t.profileAriaVerified : t.profileAria}
          >
            <ProfileAvatar size={38} verified={phoneVerified} alt="" />
          </button>
          <button
            type="button"
            className="area-selector"
            onClick={() => setLocationOpen(true)}
            aria-haspopup="dialog"
            aria-label={`${areaContext.areaName[locale]}${authorityLine ? `, ${authorityLine}` : ""}. ${t.areaDetails}`}
          >
            <span className="area-selector-text">
              <span>{areaContext.areaName[locale]}</span>
              {authorityLine ? <small>{authorityLine}</small> : null}
            </span>
            <ChevronDown size={16} aria-hidden />
          </button>
          <button type="button" className="language-button" onClick={() => setLanguageOpen(true)} aria-label={t.languageAria}>
            <Globe2 size={16} />{LOCALE_META[locale].shortLabel}
          </button>
        </header>
        <FilterBar locale={locale} t={t} filters={filters} onOpen={setFilterPanel} />
      </div>

      {offline && (
        <p className="offline-map-label">{formatCopy(t.offlineUpdated, { time: new Intl.DateTimeFormat(localeTag, { hour: "numeric", minute: "2-digit" }).format(new Date()) })}</p>
      )}

      <button type="button" className="map-recenter" onClick={() => requestHere(true)} aria-label={t.locateAria}>
        <LocateFixed size={18} />
      </button>

      <ResultsSheet
        snap={snap}
        onSnap={setSnap}
        selected={Boolean(highlighted)}
        onPeek={setSheetPeek}
        ariaLabel={t.nearbyIssues}
        handleLabel={t.resizeResults}
        header={snap === "selected" ? null : (
          <div className="sheet-header sheet-header-map">
            <div>
              <h2 className="type-heading-sm">{formatCopy(t.resultsNearby, { count: listIssues.length })}</h2>
              {offline ? <p className="type-caption">{formatCopy(t.offlineUpdated, { time: new Intl.DateTimeFormat(localeTag, { hour: "numeric", minute: "2-digit" }).format(new Date()) })}</p> : null}
            </div>
            <div className="view-toggle" role="group" aria-label={`${t.mapView} / ${t.listView}`}>
              <button type="button" className={view === "map" ? "is-active" : ""} aria-pressed={view === "map"} onClick={() => switchView("map")}>{t.mapView}</button>
              <button type="button" className={view === "list" ? "is-active" : ""} aria-pressed={view === "list"} onClick={() => switchView("list")}>{t.listView}</button>
            </div>
          </div>
        )}
        selectedCard={highlighted ? (
          <div className="sheet-selected">
            <IssueSummary issue={highlighted} locale={locale} t={t} origin={origin} selected compact onClick={() => onOpenIssue(highlighted)} />
          </div>
        ) : null}
      >
        {empty ? (
          <div className="empty-state">
            <span className="asset-empty-state" aria-hidden><MapPin size={48} /></span>
            <p className="type-body-md">{emptyCopy}</p>
            {listIssues.length === 0 && inViewUnfiltered.length > 0 ? (
              <button type="button" className="text-button" onClick={() => applyFiltersAndStore(defaultFilters)}>{t.clearFilters}</button>
            ) : null}
          </div>
        ) : (
          <div className="issue-list">
            {listIssues.map((issue) => (
              <IssueSummary
                key={issue.id}
                issue={issue}
                locale={locale}
                t={t}
                origin={origin}
                selected={issue.id === highlightedId}
                onClick={() => (issue.id === highlightedId ? onOpenIssue(issue) : selectIssue(issue))}
              />
            ))}
          </div>
        )}
      </ResultsSheet>

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
      <LanguageSheet open={languageOpen} locale={locale} t={t} onClose={() => setLanguageOpen(false)} onChange={onChangeLocale} />
    </div>
  );
});
