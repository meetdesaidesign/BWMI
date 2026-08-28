"use client";

/* eslint-disable @next/next/no-img-element -- issue evidence thumbnails include local SVGs and data URLs */

import { X } from "lucide-react";
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { track } from "@/lib/analytics";
import { distanceMeters, formatDistance } from "@/lib/geo";
import {
  countCopy,
  formatCopy,
  getCategoryLabel,
  getStatusLabel,
  type getCopy,
} from "@/lib/i18n";
import type { Issue, Locale } from "@/lib/types";
import { CategoryIcon, categoryColor } from "./category-icon";
import { ProblemFacts, statusTone } from "./problem-card";

function titleOf(issue: Issue, locale: Locale) {
  return locale === "hi" ? issue.titleHi : locale === "kn" ? issue.titleKn : issue.titleEn;
}

function ageOf(issue: Issue, locale: Locale) {
  return locale === "hi" ? issue.reportedAgoHi : locale === "kn" ? issue.reportedAgoKn : issue.reportedAgoEn;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function supportsScrollEnd() {
  return typeof window !== "undefined" && "onscrollend" in window;
}

/** Desktop mouse drag: past this, the pointer is a swipe. */
const DRAG_THRESHOLD_PX = 6;
/** Native touch: movement beyond this is a swipe, not a tap that opens the card. */
const TAP_THRESHOLD_PX = 8;
const SETTLE_FALLBACK_MS = 100;
const CARD_IMAGE_WIDTH = 340;
const CARD_IMAGE_HEIGHT = 152;

/**
 * The deck only exists once a pin is chosen, so it never competes with the map
 * on arrival. On a fine pointer the cursor carries the deck; on a phone the
 * browser's own scroll + snap is the gesture, so the card stays under the thumb.
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
  const snapTimer = useRef(0);
  // Programmatic scrolls fire the same events as a swipe, so the settle handler
  // has to know which one it is watching or selection would fight the scroller.
  const programmatic = useRef(true);
  const committed = useRef(selectedId);
  // A mouse cannot flick a scroller, so on the desktop demo the drag is hand-run:
  // the pointer carries the deck, and letting go picks the card it landed on.
  const dragRef = useRef<{
    id: number;
    startX: number;
    startScroll: number;
    startIndex: number;
    lastX: number;
    lastT: number;
    velocity: number;
    moved: number;
  } | null>(null);
  const touchOrigin = useRef<{ x: number; y: number } | null>(null);
  const suppressClick = useRef(false);

  const index = issues.findIndex((issue) => issue.id === selectedId);
  const indexRef = useRef(index);
  indexRef.current = index;
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

  useEffect(() => () => {
    window.clearTimeout(settleTimer.current);
    window.clearTimeout(snapTimer.current);
  }, []);

  // Whichever card sits closest to the centre line is the one the deck points at,
  // whether it got there by scroll, by keyboard, or by being dragged.
  const nearestIndex = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return -1;
    const middle = root.getBoundingClientRect().left + root.clientWidth / 2;
    let best = -1;
    let nearest = Infinity;
    root.querySelectorAll<HTMLElement>("[data-issue-id]").forEach((card, position) => {
      const box = card.getBoundingClientRect();
      const gap = Math.abs(box.left + box.width / 2 - middle);
      if (gap < nearest) {
        nearest = gap;
        best = position;
      }
    });
    return best;
  }, []);

  const commit = useCallback((to: number, from: number) => {
    const next = issues[to];
    if (!next || next.id === committed.current) return;
    committed.current = next.id;
    track("map_card_swiped", { direction: to > from ? "next" : "previous", position: to + 1, count: issues.length });
    onSelect(next);
  }, [issues, onSelect]);

  const settle = useCallback(() => {
    const root = scrollerRef.current;
    if (!root) return;
    if (programmatic.current) {
      programmatic.current = false;
      return;
    }
    if (dragRef.current) return;
    const to = nearestIndex();
    if (to >= 0) commit(to, indexRef.current);
  }, [commit, nearestIndex]);

  // Native snap: wait until the scroller is actually at rest before touching
  // React state or the map. IntersectionObserver tracks coverage without
  // setState; scrollend (or a short idle timer) commits the centred card.
  useEffect(() => {
    const root = scrollerRef.current;
    if (!root) return;

    const ratios = new Map<string, number>();
    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const id = (entry.target as HTMLElement).dataset.issueId;
        if (!id) continue;
        if (entry.intersectionRatio > 0) ratios.set(id, entry.intersectionRatio);
        else ratios.delete(id);
      }
    }, { root, threshold: [0.25, 0.4, 0.55, 0.7, 0.85, 1] });
    root.querySelectorAll<HTMLElement>("[data-issue-id]").forEach((card) => io.observe(card));

    const commitVisible = () => {
      if (programmatic.current || dragRef.current) {
        settle();
        return;
      }
      let bestId = "";
      let best = -1;
      ratios.forEach((ratio, id) => {
        if (ratio > best) {
          best = ratio;
          bestId = id;
        }
      });
      const observed = bestId ? issues.findIndex((issue) => issue.id === bestId) : -1;
      const to = observed >= 0 ? observed : nearestIndex();
      if (to >= 0) commit(to, indexRef.current);
    };

    root.addEventListener("scrollend", commitVisible);
    const onScroll = supportsScrollEnd()
      ? undefined
      : () => {
        if (dragRef.current) return;
        window.clearTimeout(settleTimer.current);
        settleTimer.current = window.setTimeout(commitVisible, SETTLE_FALLBACK_MS);
      };
    if (onScroll) root.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      io.disconnect();
      root.removeEventListener("scrollend", commitVisible);
      if (onScroll) root.removeEventListener("scroll", onScroll);
    };
  }, [commit, issues, nearestIndex, settle]);

  const endDrag = useCallback((timeStamp: number) => {
    const root = scrollerRef.current;
    const drag = dragRef.current;
    if (!root || !drag) return;
    dragRef.current = null;
    root.classList.remove("is-dragging");
    if (root.hasPointerCapture(drag.id)) root.releasePointerCapture(drag.id);

    // A tap is not a swipe. Leave the click for the card so it can open.
    if (drag.moved <= DRAG_THRESHOLD_PX) return;

    // A short flick should still advance: without this a quick nudge would land
    // back on the card it started from and read as the deck refusing to move.
    const stale = timeStamp - drag.lastT > 100;
    const flick = !stale && Math.abs(drag.velocity) > 0.35;
    let to = nearestIndex();
    if (to < 0) to = drag.startIndex;
    if (flick && to === drag.startIndex) to += drag.velocity < 0 ? 1 : -1;
    to = Math.max(0, Math.min(issues.length - 1, to));

    const target = issues[to];
    if (target) {
      commit(to, drag.startIndex);
      centerOn(target.id, prefersReducedMotion() ? "auto" : "smooth");
    }
    // Snapping stays off until the glide finishes, or re-arming it mid-scroll
    // would yank the deck to the nearest card instead of the chosen one.
    window.clearTimeout(snapTimer.current);
    snapTimer.current = window.setTimeout(() => root.classList.remove("is-settling"), 420);
  }, [centerOn, commit, issues, nearestIndex]);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    suppressClick.current = false;
    // Touch keeps native scrolling. Record the origin so a swipe cannot open
    // the card, then leave the pointer alone — no drag, no move listeners.
    if (event.pointerType === "touch") {
      touchOrigin.current = { x: event.clientX, y: event.clientY };
      return;
    }
    if (event.button !== 0) return;
    const root = scrollerRef.current;
    if (!root) return;
    window.clearTimeout(settleTimer.current);
    window.clearTimeout(snapTimer.current);
    // Do not capture yet. A mouse cannot flick a scroller, but capturing on
    // mousedown steals the click from the card. Capture starts once this
    // pointer has actually moved far enough to be a swipe.
    dragRef.current = {
      id: event.pointerId,
      startX: event.clientX,
      startScroll: root.scrollLeft,
      startIndex: Math.max(0, nearestIndex()),
      lastX: event.clientX,
      lastT: event.timeStamp,
      velocity: 0,
      moved: 0,
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    const root = scrollerRef.current;
    if (!drag || !root || event.pointerId !== drag.id) return;
    const dx = event.clientX - drag.startX;
    drag.moved = Math.max(drag.moved, Math.abs(dx));
    const elapsed = event.timeStamp - drag.lastT;
    if (elapsed > 0) drag.velocity = (event.clientX - drag.lastX) / elapsed;
    drag.lastX = event.clientX;
    drag.lastT = event.timeStamp;
    if (drag.moved <= DRAG_THRESHOLD_PX) return;
    // Past a few pixels the gesture is a swipe, so the click it ends with is not
    // a tap on whichever card happens to be under the cursor.
    suppressClick.current = true;
    if (!root.hasPointerCapture(event.pointerId)) {
      root.setPointerCapture(event.pointerId);
      root.classList.add("is-dragging", "is-settling");
    }
    root.scrollLeft = drag.startScroll - dx;
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const origin = touchOrigin.current;
    if (origin && event.pointerType === "touch") {
      const moved = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
      if (moved > TAP_THRESHOLD_PX) suppressClick.current = true;
      touchOrigin.current = null;
    }
    endDrag(event.timeStamp);
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
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onLostPointerCapture={(event) => endDrag(event.timeStamp)}
        onDragStart={(event) => event.preventDefault()}
        onClickCapture={(event) => {
          if (!suppressClick.current) return;
          suppressClick.current = false;
          event.preventDefault();
          event.stopPropagation();
        }}
        onKeyDown={onKeyDown}
      >
        {issues.map((issue, position) => {
          const selected = issue.id === selectedId;
          const distance = formatDistance(distanceMeters(origin[0], origin[1], issue.lat, issue.lng), localeTag);
          const near = Math.abs(position - Math.max(0, index)) <= 1;
          const age = ageOf(issue, locale);
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
                  ? (
                    <img
                      src={issue.image}
                      alt=""
                      width={CARD_IMAGE_WIDTH}
                      height={CARD_IMAGE_HEIGHT}
                      draggable={false}
                      decoding="async"
                      fetchPriority={selected ? "high" : near ? "low" : "auto"}
                      loading={near ? "eager" : "lazy"}
                    />
                  )
                  : <span className="carousel-card-fallback"><CategoryIcon category={issue.category} size={32} /></span>}
                <span className={`carousel-card-status status-pill ${statusTone[issue.status]}`}>
                  {getStatusLabel(issue.status, locale)}
                </span>
              </span>
              <span className="carousel-card-body problem-card-body">
                <strong className="problem-card-title">{titleOf(issue, locale)}</strong>
                <span className="visually-hidden">{getCategoryLabel(issue.category, locale)}</span>
                <span className="carousel-overlay-facts">
                  <ProblemFacts issue={issue} locale={locale} t={t} distance={distance} compact />
                </span>
                <span className="carousel-stack-facts">
                  <span className="carousel-card-where">
                    <span className="carousel-card-address">{issue.address}</span>
                    <span className="carousel-card-distance">{formatCopy(t.distanceAway, { distance })}</span>
                  </span>
                  <span className="carousel-card-foot">
                    <span className="carousel-card-confirmed">
                      {countCopy(issue.supporters, t.peopleConfirmedOne, t.peopleConfirmed)}
                    </span>
                    {age ? <time className="carousel-card-age">{age}</time> : null}
                  </span>
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
