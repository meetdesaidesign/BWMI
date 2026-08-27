"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { OverlaySheet, type OverlayDismissMethod } from "./overlay-sheet";
import { track } from "@/lib/analytics";
import { ALL_CATEGORIES, ALL_STATUS_GROUPS, DISTANCE_KM_OPTIONS, advancedFilterCount, defaultFilters, filtersAreDefault, locationFiltersAreDefault, locationReset } from "@/lib/filters";
import { formatCopy, getCategoryLabel, getStatusGroupLabel, type getCopy } from "@/lib/i18n";
import type { Category, DateFilter, DistanceKm, FilterState, Locale, LocationScope, SortKey, StatusGroup, TrustFilter } from "@/lib/types";
import type { FilterPanel } from "./filter-bar";

export type LocationStatus = "idle" | "prompting" | "ready" | "denied" | "error" | "unsupported";

function ToggleChip({
  selected,
  label,
  onClick,
}: {
  selected: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button type="button" className={`choice-chip ${selected ? "is-selected" : ""}`} aria-pressed={selected} onClick={onClick}>
      {label}
    </button>
  );
}

function RadioChip({
  selected,
  label,
  disabled,
  onClick,
}: {
  selected: boolean;
  label: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      className={`choice-chip ${selected ? "is-selected" : ""}`}
      aria-checked={selected}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

function applyLabel(t: ReturnType<typeof getCopy>, count: number | null, loading: boolean) {
  if (loading && count == null) return t.checkingIssues;
  if (count == null) return t.showIssues;
  if (count === 1) return t.showIssueOne;
  return formatCopy(t.showResults, { count });
}

function distanceLabel(t: ReturnType<typeof getCopy>, km: DistanceKm) {
  if (km === 1) return t.distance1k;
  if (km === 2) return t.distance2k;
  return t.distance5k;
}

function filtersDiffer(a: FilterState, b: FilterState) {
  return JSON.stringify(a) !== JSON.stringify(b);
}

export function FilterSheet({
  open,
  panel,
  locale,
  t,
  applied,
  resultCount,
  locationStatus,
  wardAvailable = true,
  offline = false,
  hasCachedIssues = true,
  onNeedLocation,
  onRetryLocation,
  onClose,
  onApply,
}: {
  open: boolean;
  panel: FilterPanel | null;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  applied: FilterState;
  resultCount: (draft: FilterState) => number | null;
  locationStatus?: LocationStatus;
  wardAvailable?: boolean;
  offline?: boolean;
  hasCachedIssues?: boolean;
  onNeedLocation?: () => void;
  onRetryLocation?: () => void;
  onClose: () => void;
  onApply: (next: FilterState) => void;
}) {
  const [draft, setDraft] = useState(applied);
  const [count, setCount] = useState<number | null>(null);
  const [countLoading, setCountLoading] = useState(false);
  const [applying, setApplying] = useState(false);
  const appliedThisOpen = useRef(false);
  const lastDistanceKm = useRef<DistanceKm>(applied.distanceKm);
  const scopeLabelId = useId();
  const distanceLabelId = useId();
  const countLiveId = useId();
  const isLocationPanel = panel === "distance";

  useEffect(() => {
    if (!open) return;
    setDraft(applied);
    lastDistanceKm.current = applied.distanceKm;
    appliedThisOpen.current = false;
    setApplying(false);
    if (isLocationPanel) {
      track("map_filter_opened", {
        appliedScope: applied.locationScope,
        appliedDistance: applied.distanceKm,
      });
    }
  }, [open, panel, applied, isLocationPanel]);

  useEffect(() => {
    if (!open) return;
    setCountLoading(true);
    const timer = window.setTimeout(() => {
      setCount(resultCount(draft));
      setCountLoading(false);
    }, 320);
    return () => window.clearTimeout(timer);
  }, [draft, open, resultCount]);

  useEffect(() => {
    if (!open || !isLocationPanel) return;
    if (draft.locationScope !== "near_me") return;
    if (locationStatus === "ready" || locationStatus === "prompting") return;
    if (locationStatus === "denied" || locationStatus === "error" || locationStatus === "unsupported") return;
    onNeedLocation?.();
  }, [open, isLocationPanel, draft.locationScope, locationStatus, onNeedLocation]);

  const title = panel === "type" ? t.filterAllTypes
    : panel === "status" ? t.filterStatus
      : panel === "distance" ? t.filterIssues
        : t.filterMore;

  const toggleCategory = (category: Category) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  const toggleStatus = (group: StatusGroup) => {
    setDraft((current) => {
      const next = current.statusGroups.includes(group)
        ? current.statusGroups.filter((item) => item !== group)
        : [...current.statusGroups, group];
      return { ...current, statusGroups: next };
    });
  };

  const setScope = (locationScope: LocationScope) => {
    if (draft.locationScope === locationScope) return;
    if (isLocationPanel) {
      track("map_filter_option_changed", {
        field: "locationScope",
        previousValue: draft.locationScope,
        newValue: locationScope,
      });
    }
    setDraft((current) => ({
      ...current,
      locationScope,
      distanceKm: locationScope === "near_me" ? lastDistanceKm.current : current.distanceKm,
    }));
  };

  const setDistance = (distanceKm: DistanceKm) => {
    if (draft.distanceKm === distanceKm) return;
    lastDistanceKm.current = distanceKm;
    if (isLocationPanel) {
      track("map_filter_option_changed", {
        field: "distanceKm",
        previousValue: draft.distanceKm,
        newValue: distanceKm,
      });
    }
    setDraft((current) => ({ ...current, distanceKm }));
  };

  const dismiss = (method: OverlayDismissMethod = "close") => {
    if (isLocationPanel && !appliedThisOpen.current) {
      track("map_filter_dismissed", {
        method,
        draftDiffered: filtersDiffer(draft, applied),
      });
    }
    setDraft(applied);
    onClose();
  };

  const apply = () => {
    setApplying(true);
    appliedThisOpen.current = true;
    if (isLocationPanel) {
      track("map_filter_applied", {
        scope: draft.locationScope,
        distance: draft.locationScope === "near_me" ? draft.distanceKm : null,
        resultCount: count,
      });
    }
    onApply(draft);
    onClose();
  };

  const reset = () => {
    if (isLocationPanel) {
      track("map_filter_reset", {
        previousScope: draft.locationScope,
        previousDistance: draft.distanceKm,
      });
      setDraft((current) => locationReset(current));
      return;
    }
    setDraft(defaultFilters);
  };

  const nearMeSelected = draft.locationScope === "near_me";
  const locationInvalid = nearMeSelected && locationStatus !== "ready";
  const locationBusy = nearMeSelected && locationStatus === "prompting";
  const canApply = !applying && !locationInvalid && (wardAvailable || draft.locationScope !== "ward");
  const canReset = isLocationPanel ? !locationFiltersAreDefault(draft) : !filtersAreDefault(draft) || advancedFilterCount(draft) > 0;
  const ctaLabel = applyLabel(t, count, countLoading || locationBusy);
  const showCountSpinner = (countLoading || locationBusy || applying) && (count != null || locationBusy || applying);

  const locationHint = useMemo(() => {
    if (!nearMeSelected) return null;
    if (locationStatus === "prompting") {
      return (
        <p className="filter-hint" role="status">
          <span className="spinner" aria-hidden />
          {t.locating}
        </p>
      );
    }
    if (locationStatus === "denied" || locationStatus === "unsupported") {
      return (
        <div className="filter-hint-block">
          <p className="filter-hint">{t.locationAllowNear}</p>
          <button type="button" className="filter-inline-action" onClick={onRetryLocation}>{t.openSettings}</button>
        </div>
      );
    }
    if (locationStatus === "error") {
      return (
        <div className="filter-hint-block">
          <p className="filter-hint">{t.locationFindFailed}</p>
          <button type="button" className="filter-inline-action" onClick={onRetryLocation}>{t.retry}</button>
        </div>
      );
    }
    return null;
  }, [nearMeSelected, locationStatus, onRetryLocation, t]);

  return (
    <OverlaySheet
      open={open}
      title={title}
      onClose={dismiss}
      closeLabel={isLocationPanel ? t.closeFilters : t.close}
      footer={(
        <>
          <button type="button" className="filter-reset" disabled={!canReset} onClick={reset}>{isLocationPanel ? t.filterReset : t.clearAll}</button>
          <button
            type="button"
            className="primary-button filter-apply"
            disabled={!canApply}
            aria-busy={applying || countLoading || locationBusy}
            onClick={apply}
          >
            {showCountSpinner ? <span className="spinner" aria-hidden /> : null}
            <span>{ctaLabel}</span>
          </button>
        </>
      )}
    >
      <div aria-live="polite" aria-atomic="true" className="visually-hidden" id={countLiveId}>
        {count == null ? t.checkingIssues : applyLabel(t, count, false)}
      </div>

      {offline ? (
        <p className="filter-hint">{hasCachedIssues ? t.offlineCached : t.offline}</p>
      ) : null}

      {panel === "type" && (
        <div className="choice-grid">
          {ALL_CATEGORIES.map((category) => (
            <ToggleChip key={category} selected={draft.categories.includes(category)} label={getCategoryLabel(category, locale)} onClick={() => toggleCategory(category)} />
          ))}
        </div>
      )}
      {panel === "status" && (
        <div className="choice-grid">
          {ALL_STATUS_GROUPS.map((group) => (
            <ToggleChip key={group} selected={draft.statusGroups.includes(group)} label={getStatusGroupLabel(group, locale)} onClick={() => toggleStatus(group)} />
          ))}
        </div>
      )}
      {panel === "distance" && (
        <div className="filter-sections">
          <section className="filter-section">
            <h3 id={scopeLabelId} className="filter-section-label">{t.filterShowFrom}</h3>
            <div className="choice-grid" role="radiogroup" aria-labelledby={scopeLabelId}>
              <RadioChip selected={draft.locationScope === "visible_map"} label={t.distanceMap} onClick={() => setScope("visible_map")} />
              <RadioChip
                selected={draft.locationScope === "ward"}
                label={t.distanceWard}
                disabled={!wardAvailable}
                onClick={() => setScope("ward")}
              />
              <RadioChip selected={draft.locationScope === "near_me"} label={t.scopeNearMe} onClick={() => setScope("near_me")} />
            </div>
            {!wardAvailable ? <p className="filter-hint">{t.wardUnavailable}</p> : null}
            {locationHint}
          </section>
          {nearMeSelected ? (
            <section className="filter-section">
              <h3 id={distanceLabelId} className="filter-section-label">{t.filterDistanceFromMe}</h3>
              <div className="choice-grid" role="radiogroup" aria-labelledby={distanceLabelId}>
                {DISTANCE_KM_OPTIONS.map((km) => (
                  <RadioChip key={km} selected={draft.distanceKm === km} label={distanceLabel(t, km)} onClick={() => setDistance(km)} />
                ))}
              </div>
            </section>
          ) : null}
        </div>
      )}
      {panel === "more" && (
        <div className="filter-advanced">
          <section>
            <h3 className="type-label-md">{t.filterReported}</h3>
            <div className="choice-grid">
              {([
                ["any", t.reportedAny],
                ["today", t.reportedToday],
                ["7d", t.reported7d],
                ["30d", t.reported30d],
              ] as [DateFilter, string][]).map(([value, label]) => (
                <ToggleChip key={value} selected={draft.reported === value} label={label} onClick={() => setDraft({ ...draft, reported: value })} />
              ))}
            </div>
          </section>
          <section>
            <h3 className="type-label-md">{t.filterTrust}</h3>
            <div className="choice-grid">
              {([
                ["gov", t.trustGov],
                ["community", t.trustCommunity],
              ] as [TrustFilter, string][]).map(([value, label]) => (
                <ToggleChip
                  key={value}
                  selected={draft.trust.includes(value)}
                  label={label}
                  onClick={() => setDraft((current) => ({
                    ...current,
                    trust: current.trust.includes(value) ? current.trust.filter((item) => item !== value) : [...current.trust, value],
                  }))}
                />
              ))}
            </div>
          </section>
          <section>
            <h3 className="type-label-md">{t.filterSort}</h3>
            <div className="choice-grid">
              {([
                ["nearest", t.sortNearest],
                ["recent", t.sortRecent],
                ["confirmed", t.sortConfirmed],
                ["unresolved", t.sortUnresolved],
              ] as [SortKey, string][]).map(([value, label]) => (
                <ToggleChip key={value} selected={draft.sort === value} label={label} onClick={() => setDraft({ ...draft, sort: value })} />
              ))}
            </div>
          </section>
        </div>
      )}
    </OverlaySheet>
  );
}
