"use client";

import { SlidersHorizontal } from "lucide-react";
import { getCategoryLabel, getStatusGroupLabel, type getCopy } from "@/lib/i18n";
import { advancedFilterCount } from "@/lib/filters";
import type { FilterState, Locale } from "@/lib/types";

export type FilterPanel = "type" | "status" | "distance" | "more";

function locationChipLabel(filters: FilterState, t: ReturnType<typeof getCopy>) {
  if (filters.locationScope === "ward") return t.distanceWard;
  if (filters.locationScope === "near_me") {
    if (filters.distanceKm === 1) return t.distance1k;
    if (filters.distanceKm === 2) return t.distance2k;
    return t.distance5k;
  }
  return t.distanceMap;
}

export function FilterBar({
  locale,
  t,
  filters,
  onOpen,
}: {
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  filters: FilterState;
  onOpen: (panel: FilterPanel) => void;
}) {
  const typeLabel = filters.categories.length === 0
    ? t.filterAllTypes
    : filters.categories.length === 1
      ? getCategoryLabel(filters.categories[0], locale)
      : `${filters.categories.length}`;
  const statusLabel = filters.statusGroups.length === 0
    ? t.filterStatus
    : filters.statusGroups.map((group) => getStatusGroupLabel(group, locale)).join(", ");
  const distanceLabel = locationChipLabel(filters, t);
  const moreCount = advancedFilterCount(filters);
  const locationActive = filters.locationScope !== "visible_map";

  return (
    <div className="filter-row" role="toolbar" aria-label={t.filterMore}>
      <button type="button" className={`filter-chip ${filters.categories.length ? "is-active" : ""}`} aria-pressed={filters.categories.length > 0} onClick={() => onOpen("type")}>
        {typeLabel}
      </button>
      <button type="button" className={`filter-chip ${filters.statusGroups.length !== 1 || filters.statusGroups[0] !== "open" ? "is-active" : ""}`} aria-pressed={filters.statusGroups.length !== 1 || filters.statusGroups[0] !== "open"} onClick={() => onOpen("status")}>
        {statusLabel}
      </button>
      <button type="button" className={`filter-chip ${locationActive ? "is-active" : ""}`} aria-pressed={locationActive} onClick={() => onOpen("distance")}>
        {distanceLabel}
      </button>
      <button
        type="button"
        className={`filter-chip is-icon ${moreCount ? "is-active" : ""}`}
        aria-pressed={moreCount > 0}
        aria-label={t.filterMore}
        title={t.filterMore}
        onClick={() => onOpen("more")}
      >
        <SlidersHorizontal size={17} strokeWidth={2} aria-hidden />
        {moreCount > 0 ? <span className="filter-badge">{moreCount}</span> : null}
      </button>
    </div>
  );
}
