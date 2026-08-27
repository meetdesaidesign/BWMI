"use client";

/* eslint-disable @next/next/no-img-element -- issue evidence thumbnails include local SVGs and data URLs */

import { useEffect, useRef, type KeyboardEvent } from "react";
import { getStatusLabel, type getCopy } from "@/lib/i18n";
import type { Issue, Locale } from "@/lib/types";
import { CategoryIcon } from "./category-icon";

const statusClass: Record<Issue["status"], string> = {
  reported: "slate",
  acknowledged: "slate",
  in_progress: "amber",
  awaiting_confirmation: "violet",
  confirmed: "green",
  contested: "red",
};

function titleOf(issue: Issue, locale: Locale) {
  return locale === "hi" ? issue.titleHi : locale === "kn" ? issue.titleKn : issue.titleEn;
}

export function IssueCarousel({
  issues,
  selectedId,
  locale,
  t,
  onSelect,
  onOpen,
}: {
  issues: Issue[];
  selectedId: string;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  onSelect: (issue: Issue) => void;
  onOpen: (issue: Issue) => void;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const ignoreUntil = useRef(0);
  const scrollTimer = useRef<number>(0);

  useEffect(() => {
    const root = scrollerRef.current;
    const card = root?.querySelector<HTMLElement>(`[data-issue-id="${selectedId}"]`);
    if (!root || !card) return;
    ignoreUntil.current = Date.now() + 420;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = card.offsetLeft - (root.clientWidth - card.offsetWidth) / 2;
    root.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  }, [selectedId]);

  const commit = () => {
    if (Date.now() < ignoreUntil.current) return;
    const root = scrollerRef.current;
    if (!root) return;
    const center = root.scrollLeft + root.clientWidth / 2;
    let nearestId = selectedId;
    let distance = Infinity;
    root.querySelectorAll<HTMLElement>("[data-issue-id]").forEach((card) => {
      const mid = card.offsetLeft + card.offsetWidth / 2;
      const next = Math.abs(mid - center);
      if (next < distance) {
        distance = next;
        nearestId = card.dataset.issueId ?? selectedId;
      }
    });
    const issue = issues.find((item) => item.id === nearestId);
    if (issue && issue.id !== selectedId) onSelect(issue);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const index = issues.findIndex((issue) => issue.id === selectedId);
    const next = event.key === "ArrowRight" ? Math.min(issues.length - 1, index + 1) : Math.max(0, index - 1);
    const issue = issues[next];
    if (issue) onSelect(issue);
  };

  return (
    <div className="carousel-dock">
      <div className="carousel-meta">
        <strong className="type-label-md">{t.nearby}</strong>
        <span className="type-caption">{issues.filter((issue) => issue.status !== "confirmed").length} {t.openNearby}</span>
      </div>
      <div
        ref={scrollerRef}
        className="issue-carousel"
        tabIndex={0}
        aria-label={t.nearby}
        onScroll={() => {
          window.clearTimeout(scrollTimer.current);
          scrollTimer.current = window.setTimeout(commit, 90);
        }}
        onKeyDown={onKeyDown}
      >
        {issues.map((issue) => {
          const selected = issue.id === selectedId;
          return (
            <button
              key={issue.id}
              type="button"
              data-issue-id={issue.id}
              className={`carousel-card ${selected ? "is-selected" : ""}`}
              aria-pressed={selected}
              onClick={() => (selected ? onOpen(issue) : onSelect(issue))}
            >
              {issue.image ? <img src={issue.image} alt="" /> : <span className="carousel-card-fallback"><CategoryIcon category={issue.category} size={32} /></span>}
              <span className="carousel-card-body">
                <span className="carousel-card-meta">
                  <span className="carousel-card-category"><CategoryIcon category={issue.category} size={14} />{issue.category}</span>
                  <span className={`status-pill ${statusClass[issue.status]}`}>{getStatusLabel(issue.status, locale)}</span>
                </span>
                <strong className="type-heading-sm">{titleOf(issue, locale)}</strong>
                <span className="type-caption">{issue.supporters} {t.supporters}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
