"use client";

import { SlidersHorizontal } from "lucide-react";
import { formatCopy, type getCopy } from "@/lib/i18n";
import { advancedFilterCount } from "@/lib/filters";
import type { FilterState, Locale } from "@/lib/types";

export type FilterPanel = "type" | "status" | "distance" | "more";

/**
 * Compact chips. The labels stay fixed — "Issue type", never the categories
 * chosen — so the row keeps one short line however much is filtered, and the
 * map behind it keeps its width. A tint carries the "this one is narrowing
 * results" signal that a spelled-out value used to carry.
 */
export function FilterBar({
  t,
  filters,
  onOpen,
}: {
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  filters: FilterState;
  onOpen: (panel: FilterPanel) => void;
}) {
  const typeCount = filters.categories.length;
  const statusActive = filters.statusGroups.length !== 1 || filters.statusGroups[0] !== "open";
  const distanceActive = filters.locationScope !== "all";
  const moreCount = advancedFilterCount(filters);

  return (
    <div className="filter-row" role="toolbar" aria-label={t.filterIssues}>
      <button
        type="button"
        className={`filter-chip ${typeCount ? "is-active" : ""}`}
        aria-pressed={typeCount > 0}
        aria-label={typeCount ? formatCopy(t.filterTypeActive, { count: typeCount }) : t.filterAllTypes}
        onClick={() => onOpen("type")}
      >
        {t.filterAllTypes}
      </button>
      <button
        type="button"
        className={`filter-chip ${statusActive ? "is-active" : ""}`}
        aria-pressed={statusActive}
        aria-label={statusActive ? formatCopy(t.filterStatusActive, { count: filters.statusGroups.length }) : t.filterStatus}
        onClick={() => onOpen("status")}
      >
        {t.filterStatus}
      </button>
      <button
        type="button"
        className={`filter-chip ${distanceActive ? "is-active" : ""}`}
        aria-pressed={distanceActive}
        onClick={() => onOpen("distance")}
      >
        {t.filterDistance}
      </button>
      <button
        type="button"
        className={`filter-chip is-icon ${moreCount ? "is-active" : ""}`}
        aria-pressed={moreCount > 0}
        aria-label={moreCount ? formatCopy(t.filterMoreActive, { count: moreCount }) : t.filterMore}
        title={t.filterMore}
        onClick={() => onOpen("more")}
      >
        <SlidersHorizontal size={15} strokeWidth={2} aria-hidden />
        {moreCount > 0 ? <span className="filter-badge">{moreCount}</span> : null}
      </button>
    </div>
  );
}
