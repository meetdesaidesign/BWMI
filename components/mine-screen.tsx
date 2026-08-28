"use client";

import { ClipboardList, MapPin, SlidersHorizontal } from "lucide-react";
import { useEffect, useId, useMemo, useRef, useState, type RefObject } from "react";
import { OverlaySheet } from "./overlay-sheet";
import { ProblemCard } from "./problem-card";
import { ProfileAvatar } from "./profile-avatar";
import { ALL_CATEGORIES, ALL_STATUS_GROUPS } from "@/lib/filters";
import { toStatusGroup } from "@/lib/public-status";
import { getCategoryLabel, getStatusGroupLabel, type getCopy } from "@/lib/i18n";
import type { Category, Issue, Locale, StatusGroup } from "@/lib/types";

type MineTab = "raised" | "supported";
type MineSort = "newest" | "oldest";

interface MineFilters {
  categories: Category[];
  statusGroups: StatusGroup[];
  sort: MineSort;
}

const defaultMineFilters: MineFilters = {
  categories: [],
  statusGroups: [],
  sort: "newest",
};

function filtersAreDefault(filters: MineFilters) {
  return filters.categories.length === 0 && filters.statusGroups.length === 0 && filters.sort === "newest";
}

function filterCount(filters: MineFilters) {
  return filters.categories.length + filters.statusGroups.length + (filters.sort !== "newest" ? 1 : 0);
}

function applyMineFilters(issues: Issue[], filters: MineFilters) {
  const filtered = issues.filter((issue) => {
    if (filters.categories.length > 0 && !filters.categories.includes(issue.category)) return false;
    if (filters.statusGroups.length > 0 && !filters.statusGroups.includes(toStatusGroup(issue.status))) return false;
    return true;
  });

  return [...filtered].sort((a, b) => {
    const delta = +new Date(b.updatedAt) - +new Date(a.updatedAt);
    return filters.sort === "oldest" ? -delta : delta;
  });
}

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

function MineFilterSheet({
  open,
  locale,
  t,
  applied,
  onClose,
  onApply,
}: {
  open: boolean;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  applied: MineFilters;
  onClose: () => void;
  onApply: (next: MineFilters) => void;
}) {
  const [draft, setDraft] = useState(applied);
  const typeLabelId = useId();
  const statusLabelId = useId();
  const sortLabelId = useId();

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  const toggleCategory = (category: Category) => {
    setDraft((current) => ({
      ...current,
      categories: current.categories.includes(category)
        ? current.categories.filter((item) => item !== category)
        : [...current.categories, category],
    }));
  };

  const toggleStatus = (group: StatusGroup) => {
    setDraft((current) => ({
      ...current,
      statusGroups: current.statusGroups.includes(group)
        ? current.statusGroups.filter((item) => item !== group)
        : [...current.statusGroups, group],
    }));
  };

  return (
    <OverlaySheet
      open={open}
      title={t.filterIssues}
      className="mine-filter-sheet"
      showHandle
      onClose={onClose}
      closeLabel={t.close}
      footer={(
        <>
          <button type="button" className="filter-reset" disabled={filtersAreDefault(draft)} onClick={() => setDraft(defaultMineFilters)}>
            {t.clearAll}
          </button>
          <button type="button" className="primary-button filter-apply" onClick={() => onApply(draft)}>
            {t.showIssues}
          </button>
        </>
      )}
    >
      <div className="filter-advanced">
        <section>
          <h3 id={typeLabelId} className="type-label-md">{t.filterAllTypes}</h3>
          <div className="choice-grid" aria-labelledby={typeLabelId}>
            {ALL_CATEGORIES.map((category) => (
              <ToggleChip
                key={category}
                selected={draft.categories.includes(category)}
                label={getCategoryLabel(category, locale)}
                onClick={() => toggleCategory(category)}
              />
            ))}
          </div>
        </section>
        <section>
          <h3 id={statusLabelId} className="type-label-md">{t.filterStatus}</h3>
          <div className="choice-grid" aria-labelledby={statusLabelId}>
            {ALL_STATUS_GROUPS.map((group) => (
              <ToggleChip
                key={group}
                selected={draft.statusGroups.includes(group)}
                label={getStatusGroupLabel(group, locale)}
                onClick={() => toggleStatus(group)}
              />
            ))}
          </div>
        </section>
        <section>
          <h3 id={sortLabelId} className="type-label-md">{t.filterSort}</h3>
          <div className="choice-grid" role="radiogroup" aria-labelledby={sortLabelId}>
            <ToggleChip selected={draft.sort === "newest"} label={t.sortNewest} onClick={() => setDraft({ ...draft, sort: "newest" })} />
            <ToggleChip selected={draft.sort === "oldest"} label={t.sortOldest} onClick={() => setDraft({ ...draft, sort: "oldest" })} />
          </div>
        </section>
      </div>
    </OverlaySheet>
  );
}

export function MineScreen({
  visible,
  raised,
  supported,
  locale,
  t,
  identityVerified,
  onOpenProfile,
  onOpenIssue,
  onReport,
  onExploreNearby,
  scrollRef,
}: {
  visible: boolean;
  raised: Issue[];
  supported: Issue[];
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  identityVerified: boolean;
  onOpenProfile: () => void;
  onOpenIssue: (issue: Issue) => void;
  onReport: () => void;
  onExploreNearby: () => void;
  scrollRef: RefObject<HTMLDivElement | null>;
}) {
  const [tab, setTab] = useState<MineTab>("raised");
  const [renderedTab, setRenderedTab] = useState<MineTab>("raised");
  const [listMotion, setListMotion] = useState<"idle" | "out-left" | "out-right" | "in-left" | "in-right">("idle");
  const [filters, setFilters] = useState<MineFilters>(defaultMineFilters);
  const [filterOpen, setFilterOpen] = useState(false);
  const [applyingFilters, setApplyingFilters] = useState(false);
  const [firstEntrance, setFirstEntrance] = useState(true);
  const switching = useRef(false);
  const scrollPositions = useRef<Record<MineTab, number>>({ raised: 0, supported: 0 });
  const raisedTabId = useId();
  const supportedTabId = useId();
  const panelId = useId();
  const activeCount = filterCount(filters);

  useEffect(() => {
    if (!visible || !firstEntrance) return;
    const timer = window.setTimeout(() => setFirstEntrance(false), 360);
    return () => window.clearTimeout(timer);
  }, [visible, firstEntrance]);

  const raisedFiltered = useMemo(() => applyMineFilters(raised, filters), [raised, filters]);
  const supportedFiltered = useMemo(() => applyMineFilters(supported, filters), [supported, filters]);
  const items = renderedTab === "raised" ? raisedFiltered : supportedFiltered;
  const sourceEmpty = (renderedTab === "raised" ? raised : supported).length === 0;
  const filteredEmpty = !sourceEmpty && items.length === 0;

  const selectTab = (next: MineTab) => {
    if (next === tab || switching.current) return;
    switching.current = true;
    scrollPositions.current[tab] = scrollRef.current?.scrollTop ?? 0;
    const forward = next === "supported";
    setTab(next);
    setListMotion(forward ? "out-left" : "out-right");
    window.setTimeout(() => {
      setRenderedTab(next);
      setListMotion(forward ? "in-right" : "in-left");
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollPositions.current[next], behavior: "auto" });
        requestAnimationFrame(() => setListMotion("idle"));
      });
      window.setTimeout(() => { switching.current = false; }, 170);
    }, 90);
  };

  return (
    <div className={`screen-scroll mine-page${visible ? " is-visible" : ""}${firstEntrance ? " is-first-view" : ""}`} ref={scrollRef}>
      <header className="mine-header">
        <div className="mine-heading">
          <h1 className="type-heading-md">{t.reports}</h1>
          <p className="type-body-md">{t.mineIntro}</p>
        </div>
        <button
          type="button"
          className="page-profile"
          onClick={onOpenProfile}
          aria-label={identityVerified ? t.profileAriaVerified : t.profileAria}
        >
          <ProfileAvatar size={32} alt="" />
        </button>
      </header>

      <div className="mine-toolbar">
        <div className={`mine-segments is-${tab}`} role="tablist" aria-label={t.mineTabsAria}>
          <span className="mine-segment-selection" aria-hidden />
          <button
            type="button"
            role="tab"
            id={raisedTabId}
            aria-controls={panelId}
            aria-selected={tab === "raised"}
            className={`mine-segment${tab === "raised" ? " is-active" : ""}`}
            onClick={() => selectTab("raised")}
          >
            <span>{t.mineRaised}</span>
            <span key={raised.length} className="mine-segment-count">{raised.length}</span>
          </button>
          <button
            type="button"
            role="tab"
            id={supportedTabId}
            aria-controls={panelId}
            aria-selected={tab === "supported"}
            className={`mine-segment${tab === "supported" ? " is-active" : ""}`}
            onClick={() => selectTab("supported")}
          >
            <span>{t.mineSupported}</span>
            <span key={supported.length} className="mine-segment-count">{supported.length}</span>
          </button>
        </div>
        <button
          type="button"
          className={`mine-filter${activeCount ? " is-active" : ""}`}
          aria-label={t.mineFilterAria}
          aria-pressed={activeCount > 0}
          onClick={() => { if (!filterOpen) setFilterOpen(true); }}
        >
          <SlidersHorizontal size={16} strokeWidth={2} aria-hidden />
          {activeCount > 0 ? <span className="mine-filter-badge">{activeCount}</span> : null}
        </button>
      </div>

      <section
        className="mine-feed"
        id={panelId}
        role="tabpanel"
        aria-labelledby={renderedTab === "raised" ? raisedTabId : supportedTabId}
        aria-busy={applyingFilters || undefined}
      >
        <div className={`mine-list-transition is-${listMotion}${applyingFilters ? " is-applying" : ""}`}>
        {sourceEmpty ? (
          <div className="empty-state is-compact">
            <span className="empty-state-icon" aria-hidden>
              {renderedTab === "raised" ? <ClipboardList size={28} strokeWidth={1.75} /> : <MapPin size={28} strokeWidth={1.75} />}
            </span>
            <h2 className="type-heading-sm">{renderedTab === "raised" ? t.empty : t.emptySupported}</h2>
            <p className="type-body-md">{renderedTab === "raised" ? t.emptyRaisedHelp : t.emptySupportedHelp}</p>
            <button type="button" className="primary-button empty-state-cta" onClick={renderedTab === "raised" ? onReport : onExploreNearby}>
              {renderedTab === "raised" ? t.reportIssue : t.emptySupportedCta}
            </button>
          </div>
        ) : filteredEmpty ? (
          <div className="empty-state is-compact">
            <p className="type-body-md">{t.noMineFilterResults}</p>
            <button type="button" className="secondary-button empty-state-cta" onClick={() => setFilters(defaultMineFilters)}>
              {t.clearFilters}
            </button>
          </div>
        ) : (
          <div className="issue-list">
            {items.map((issue) => (
              <ProblemCard
                key={`${tab}-${issue.id}`}
                issue={issue}
                locale={locale}
                t={t}
                onClick={() => onOpenIssue(issue)}
              />
            ))}
          </div>
        )}
        </div>
      </section>

      <MineFilterSheet
        open={filterOpen}
        locale={locale}
        t={t}
        applied={filters}
        onClose={() => setFilterOpen(false)}
        onApply={(next) => {
          setApplyingFilters(true);
          setFilters(next);
          setFilterOpen(false);
          window.setTimeout(() => {
            scrollRef.current?.scrollTo({ top: 0, behavior: "auto" });
            scrollPositions.current[renderedTab] = 0;
            setApplyingFilters(false);
          }, 160);
        }}
      />
    </div>
  );
}
