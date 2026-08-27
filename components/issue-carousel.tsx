"use client";

/* eslint-disable @next/next/no-img-element -- issue evidence thumbnails include local SVGs and data URLs */

import { X } from "lucide-react";
import { useCallback, useEffect, useLayoutEffect, useRef, type KeyboardEvent } from "react";
import { track } from "@/lib/analytics";
import { distanceMeters, formatDistance } from "@/lib/geo";
import { formatCopy, getCategoryLabel, type getCopy } from "@/lib/i18n";
import type { Issue, Locale } from "@/lib/types";
import { CategoryIcon, categoryColor } from "./category-icon";
import { ProblemFacts } from "./problem-card";

function titleOf(issue: Issue, locale: Locale) {
  return locale === "hi" ? issue.titleHi : locale === "kn" ? issue.titleKn : issue.titleEn;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * The deck only exists once a pin is chosen, so it never competes with the map
 * on arrival. Swiping it is the same gesture as walking down the street: the
 * centred card is the pin the map is looking at, and its neighbours sit smaller
 * on either side to show there is more without pretending to be readable.
 */
export function IssueCarousel({
  issues,
  selectedId,
  locale,
  t,
  origin,
  onSelect,
  onOpen,
  onClose,
  onHeight,
}: {
  issues: Issue[];
  selectedId: string;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  origin: [number, number];
  onSelect: (issue: Issue) => void;
  onOpen: (issue: Issue) => void;
  onClose: () => void;
  onHeight?: (px: number) => void;
}) {
  const dockRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const settleTimer = useRef(0);
  // Programmatic scrolls fire the same events as a swipe, so the settle handler
  // has to know which one it is watching or selection would fight the scroller.
  const programmatic = useRef(true);
  const committed = useRef(selectedId);

  const index = issues.findIndex((issue) => issue.id === selectedId);
  const localeTag = locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "kn-IN";

  const centerOn = useCallback((id: string, behavior: ScrollBehavior) => {
    const root = scrollerRef.current;
    const card = root?.querySelector<HTMLElement>(`[data-issue-id="${CSS.escape(id)}"]`);
    if (!root || !card) return;
    const rootBox = root.getBoundingClientRect();
    const cardBox = card.getBoundingClientRect();
    const delta = (cardBox.left + cardBox.width / 2) - (rootBox.left + rootBox.width / 2);
    if (Math.abs(delta) < 1) return;
    programmatic.current = true;
    root.scrollTo({ left: root.scrollLeft + delta, behavior });
  }, []);

  // Centre the opening card before paint so the deck never slides in off-target.
  useLayoutEffect(() => {
    centerOn(selectedId, "auto");
    // Runs once: later selection changes are handled by the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A marker tap or an arrow key arrives as a changed selectedId.
  useEffect(() => {
    if (committed.current === selectedId) return;
    committed.current = selectedId;
    centerOn(selectedId, prefersReducedMotion() ? "auto" : "smooth");
  }, [selectedId, centerOn]);

  useEffect(() => {
    const dock = dockRef.current;
    if (!dock || !onHeight) return;
    const observer = new ResizeObserver(() => onHeight(dock.offsetHeight));
    observer.observe(dock);
    onHeight(dock.offsetHeight);
    return () => observer.disconnect();
  }, [onHeight]);

  useEffect(() => () => window.clearTimeout(settleTimer.current), []);

  const settle = () => {
    const root = scrollerRef.current;
    if (!root) return;
    if (programmatic.current) {
      programmatic.current = false;
      return;
    }
    const middle = root.getBoundingClientRect().left + root.clientWidth / 2;
    let nearestId = selectedId;
    let nearest = Infinity;
    root.querySelectorAll<HTMLElement>("[data-issue-id]").forEach((card) => {
      const box = card.getBoundingClientRect();
      const gap = Math.abs(box.left + box.width / 2 - middle);
      if (gap < nearest) {
        nearest = gap;
        nearestId = card.dataset.issueId ?? selectedId;
      }
    });
    if (nearestId === selectedId) return;
    const next = issues.find((issue) => issue.id === nearestId);
    if (!next) return;
    const to = issues.indexOf(next);
    committed.current = next.id;
    track("map_card_swiped", { direction: to > index ? "next" : "previous", position: to + 1, count: issues.length });
    onSelect(next);
  };

  const step = (delta: number) => {
    const next = issues[index + delta];
    if (next) onSelect(next);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      onClose();
      return;
    }
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    step(event.key === "ArrowRight" ? 1 : -1);
  };

  return (
    <div ref={dockRef} className="carousel-dock">
      <div className="carousel-meta">
        <span className="carousel-position type-caption" aria-live="polite">
          {formatCopy(t.cardPosition, { index: index + 1, count: issues.length })}
        </span>
        <button type="button" className="carousel-close" onClick={onClose} aria-label={t.closeCard}>
          <X size={16} aria-hidden />
        </button>
      </div>
      <div
        ref={scrollerRef}
        className="issue-carousel"
        role="group"
        tabIndex={0}
        aria-label={`${t.nearbyIssues}. ${t.swipeCards}`}
        onScroll={() => {
          window.clearTimeout(settleTimer.current);
          settleTimer.current = window.setTimeout(settle, 120);
        }}
        onKeyDown={onKeyDown}
      >
        {issues.map((issue) => {
          const selected = issue.id === selectedId;
          const distance = formatDistance(distanceMeters(origin[0], origin[1], issue.lat, issue.lng), localeTag);
          return (
            <button
              key={issue.id}
              type="button"
              data-issue-id={issue.id}
              className={`carousel-card ${selected ? "is-selected" : ""}`}
              style={{ ["--marker-tint" as string]: categoryColor(issue.category) }}
              aria-current={selected ? "true" : undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => (selected ? onOpen(issue) : onSelect(issue))}
            >
              <span className="carousel-card-media">
                {issue.image
                  ? <img src={issue.image} alt="" loading={selected ? "eager" : "lazy"} />
                  : <span className="carousel-card-fallback"><CategoryIcon category={issue.category} size={32} /></span>}
              </span>
              <span className="carousel-card-body problem-card-body">
                <strong className="problem-card-title">{titleOf(issue, locale)}</strong>
                <span className="visually-hidden">{getCategoryLabel(issue.category, locale)}</span>
                <ProblemFacts issue={issue} locale={locale} t={t} distance={distance} compact />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
