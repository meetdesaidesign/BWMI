"use client";

/* eslint-disable @next/next/no-img-element -- issue evidence thumbnails include local SVGs and data URLs */

import { ChevronRight, MapPin } from "lucide-react";
import { CategoryIcon, categoryColor } from "./category-icon";
import { countCopy, formatCopy, getCategoryLabel, getStatusLabel, type getCopy } from "@/lib/i18n";
import type { Issue, Locale } from "@/lib/types";

/** Status tone, shared by every card so one state always looks the same. */
export const statusTone: Record<Issue["status"], string> = {
  reported: "slate",
  acknowledged: "blue",
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
 * Shared so the sheet list, "My Reports" and the map deck can never drift out
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
  const confirmationTemplate = issue.supporters === 1 ? t.confirmationCountOne : t.confirmationCount;

  return (
    <>
      <span className="problem-card-where">
        <MapPin size={13} aria-hidden />
        <span className="problem-card-address">{issue.address}</span>
        {distance ? <span className="problem-card-distance">{formatCopy(t.distanceAway, { distance })}</span> : null}
      </span>

      <span className="problem-card-foot">
        <span className="problem-card-confirmed">
          <span>
            <ConfirmedCount template={confirmationTemplate} count={issue.supporters} />
          </span>
          {!compact && issue.mergedCount
            ? <em>{countCopy(issue.mergedCount, t.reportsMergedOne, t.reportsMerged)}</em>
            : null}
        </span>

        <span className={`problem-card-status ${statusTone[issue.status]}`}>
          <span className="problem-card-status-dot" aria-hidden />
          {getStatusLabel(issue.status, locale)}
          {compact ? null : <time className="problem-card-updated">{lastUpdateOf(issue)}</time>}
        </span>
      </span>
    </>
  );
}

export function ProblemCardSkeleton() {
  return (
    <div className="problem-card is-skeleton" aria-hidden>
      <span className="problem-card-main">
        <span className="problem-card-media skeleton-block" />
        <span className="problem-card-body">
          <span className="skeleton-line skeleton-line-title" />
          <span className="skeleton-line skeleton-line-meta" />
          <span className="skeleton-pill" />
        </span>
      </span>
      <span className="problem-card-foot">
        <span className="skeleton-line skeleton-line-foot" />
        <span className="skeleton-line skeleton-line-time" />
      </span>
    </div>
  );
}

/**
 * One report in a list: evidence on the left, the facts a resident scans on
 * the right, and a quiet footer for confirmations and the last update.
 */
export function ProblemCard({
  issue,
  locale,
  t,
  distance,
  onClick,
}: {
  issue: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  /** Pre-formatted distance from the reader; omitted where there is no origin. */
  distance?: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      data-issue-id={issue.id}
      className="problem-card"
      onClick={onClick}
    >
      <span className="problem-card-main">
        <span className="problem-card-media" style={{ ["--category-tint" as string]: categoryColor(issue.category) }}>
          {issue.image
            ? <img src={issue.image} alt="" loading="lazy" />
            : <CategoryIcon category={issue.category} size={28} />}
        </span>

        <span className="problem-card-body">
          <strong className="problem-card-title">{titleOf(issue, locale)}</strong>
          <span className="visually-hidden">{getCategoryLabel(issue.category, locale)}</span>
          <span className="problem-card-where">
            <MapPin size={13} aria-hidden />
            <span className="problem-card-address">{issue.address}</span>
            {distance ? <span className="problem-card-distance">{formatCopy(t.distanceAway, { distance })}</span> : null}
          </span>
          <span className={`status-pill ${statusTone[issue.status]}`}>{getStatusLabel(issue.status, locale)}</span>
        </span>

        <ChevronRight className="problem-card-chevron" size={18} strokeWidth={2} aria-hidden />
      </span>

      <span className="problem-card-foot">
        <span className="problem-card-stat">
          {countCopy(issue.supporters, t.confirmationCountOne, t.confirmationCount)}
        </span>
        {issue.mergedCount
          ? <span className="problem-card-stat">{countCopy(issue.mergedCount, t.reportsMergedOne, t.reportsMerged)}</span>
          : null}
        <time className="problem-card-updated">{lastUpdateOf(issue)}</time>
      </span>
    </button>
  );
}
