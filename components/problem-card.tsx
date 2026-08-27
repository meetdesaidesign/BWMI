"use client";

/* eslint-disable @next/next/no-img-element -- issue evidence thumbnails include local SVGs and data URLs */

import { MapPin, Users } from "lucide-react";
import { CategoryIcon, categoryColor } from "./category-icon";
import { formatCopy, getCategoryLabel, getStatusLabel, type getCopy } from "@/lib/i18n";
import type { Issue, Locale } from "@/lib/types";

/** Status tone, shared by every card so one state always looks the same. */
export const statusTone: Record<Issue["status"], string> = {
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

function lastUpdateOf(issue: Issue) {
  return issue.timeline[issue.timeline.length - 1]?.date ?? issue.reportedAgoEn;
}

/**
 * The count is what people scan for, not the sentence around it, so the
 * template is split on its placeholder and only the number takes the weight.
 * Every locale leads with {count}, so the split reads correctly in all three.
 */
function ConfirmedCount({ template, count }: { template: string; count: number }) {
  const [before, after = ""] = template.split("{count}");
  return (
    <>
      {before}
      <b>{count}</b>
      {after}
    </>
  );
}

/**
 * Levels 2 to 4 of the card: where it is, how many agree, what state it is in.
 * Shared so the sheet list, "My Fixes" and the map deck can never drift out
 * of order — only their skin differs.
 */
export function ProblemFacts({
  issue,
  locale,
  t,
  distance,
  compact,
}: {
  issue: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  distance?: string;
  compact?: boolean;
}) {
  return (
    <>
      {/* 2 — where */}
      <span className="problem-card-where">
        <MapPin size={13} aria-hidden />
        <span className="problem-card-address">{issue.address}</span>
        {distance ? <span className="problem-card-distance">{formatCopy(t.distanceAway, { distance })}</span> : null}
      </span>

      <span className="problem-card-foot">
        {/* 3 — how many agree */}
        <span className="problem-card-confirmed">
          <Users size={13} aria-hidden />
          <span>
            <ConfirmedCount template={t.confirmedCount} count={issue.supporters} />
          </span>
          {!compact && issue.mergedCount
            ? <em>{formatCopy(t.reportsMerged, { count: issue.mergedCount })}</em>
            : null}
        </span>

        {/* 4 — what state */}
        <span className={`problem-card-status ${statusTone[issue.status]}`}>
          <span className="problem-card-status-dot" aria-hidden />
          {getStatusLabel(issue.status, locale)}
          {compact ? null : <time className="problem-card-updated">{lastUpdateOf(issue)}</time>}
        </span>
      </span>
    </>
  );
}

/**
 * One card, one reading order, everywhere a problem is listed:
 *
 *   1. what it is      — the title, the only line at heading size
 *   2. where it is     — address and distance, one line, never wrapped
 *   3. how many agree  — the confirmation count, its number carrying the weight
 *   4. what state      — a coloured dot and a quiet label, under a hairline
 *
 * Category stays on the thumbnail only when there is no photo, and `compact`
 * drops the two quietest facts for cards read at a glance rather than compared.
 */
export function ProblemCard({
  issue,
  locale,
  t,
  distance,
  compact,
  selected,
  onClick,
}: {
  issue: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  /** Pre-formatted distance from the reader; omitted where there is no origin. */
  distance?: string;
  compact?: boolean;
  selected?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-issue-id={issue.id}
      className={`problem-card ${compact ? "is-compact" : ""} ${selected ? "is-selected" : ""}`}
      aria-current={selected ? "true" : undefined}
      onClick={onClick}
    >
      <span className="problem-card-media" style={{ ["--category-tint" as string]: categoryColor(issue.category) }}>
        {issue.image
          ? <img src={issue.image} alt="" loading={compact || selected ? "eager" : "lazy"} />
          : <CategoryIcon category={issue.category} size={24} />}
      </span>

      <span className="problem-card-body">
        {/* 1 — what */}
        <strong className="problem-card-title">{titleOf(issue, locale)}</strong>
        <span className="visually-hidden">{getCategoryLabel(issue.category, locale)}</span>
        <ProblemFacts issue={issue} locale={locale} t={t} distance={distance} compact={compact} />
      </span>
    </button>
  );
}
