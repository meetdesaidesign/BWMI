"use client";

/* eslint-disable @next/next/no-img-element -- report evidence uses local files and data URLs */

import { Check, Clock3 } from "lucide-react";
import { useState } from "react";
import { Button } from "antd-mobile";
import { areaContext, officerDisplayName, resolveIssueAuthority } from "@/lib/authority";
import { formatCopy, localizedField, type getCopy } from "@/lib/i18n";
import { composeIssuePost } from "@/lib/share";
import type { Issue, Locale } from "@/lib/types";
import { CategoryIcon } from "./category-icon";
import { ShareSheet } from "./share-sheet";

function field(issue: Issue, locale: Locale, name: "title") {
  return localizedField(issue as unknown as Record<string, unknown>, locale, name);
}

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join("");
}

export function SubmittedScreen({
  issue,
  locale,
  t,
  onTrackReport,
}: {
  issue: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  onTrackReport: () => void;
}) {
  const [shareOpen, setShareOpen] = useState(false);
  const authority = resolveIssueAuthority(issue);
  const officer = officerDisplayName(authority, locale);
  const department = authority.departmentName[locale];
  const post = composeIssuePost(issue, locale, t.postTemplate, t.postHashtags);
  const locationLine = `${areaContext.areaName[locale]} · ${areaContext.ward[locale]}`;
  const authorityPlace = `${areaContext.ward[locale]}, ${areaContext.areaName[locale]}`;

  return (
    <div className="submitted-screen">
      <div className="submitted-scroll">
        <header className="submitted-header">
          <span className="submitted-mark" aria-hidden>
            <Check size={34} strokeWidth={2.75} />
          </span>
          <h1 className="type-heading-md">{t.submitted}</h1>
          <p className="type-body-md">{formatCopy(t.submittedHelp, { department })}</p>
        </header>

        <article className="submitted-card submitted-summary">
          {issue.image
            ? <img className="submitted-thumb" src={issue.image} alt="" />
            : (
              <span className="submitted-thumb is-icon" aria-hidden>
                <CategoryIcon category={issue.category} size={22} />
              </span>
            )}
          <div className="submitted-summary-copy">
            <h2 className="submitted-summary-title">{field(issue, locale, "title")}</h2>
            <p className="submitted-summary-meta">{locationLine}</p>
            <p className="submitted-summary-id">{issue.id}</p>
          </div>
        </article>

        <section className="submitted-card submitted-next" aria-label={t.nextStepsAria}>
          <ol className="submitted-steps">
            <li className="is-done">
              <span className="submitted-step-node" aria-hidden><Check size={11} strokeWidth={3} /></span>
              <span>{t.statusSubmitted}</span>
            </li>
            <li>
              <span className="submitted-step-node" aria-hidden />
              <span>{t.nextStepReviewing}</span>
            </li>
            <li>
              <span className="submitted-step-node" aria-hidden />
              <span>{t.nextStepScheduled}</span>
            </li>
          </ol>
          <p className="submitted-expected">
            <Clock3 size={15} strokeWidth={2} aria-hidden />
            <span>{t.expectedResponse}</span>
          </p>
        </section>

        <section className="submitted-card submitted-authority">
          <h2 className="submitted-section-label">{t.responsibleAuthority}</h2>
          <p className="submitted-dept">{department}</p>
          <p className="submitted-dept-place">{authorityPlace}</p>
          <div className="submitted-authority-divider" aria-hidden />
          {officer ? (
            <div className="submitted-officer">
              <span className="submitted-officer-avatar" aria-hidden>{initialsOf(officer)}</span>
              <span className="submitted-officer-copy">
                <strong>{officer}</strong>
                <span>{authority.roleName[locale]}</span>
              </span>
            </div>
          ) : (
            <p className="submitted-officer-pending">{t.officerAssignmentInProgress}</p>
          )}
        </section>
      </div>

      <div className="submitted-actions">
        <Button block color="primary" size="large" className="primary-button" onClick={onTrackReport}>
          {t.trackReport}
        </Button>
        <button type="button" className="submitted-share" onClick={() => setShareOpen(true)}>
          {t.shareOnX}
        </button>
      </div>

      <ShareSheet
        open={shareOpen}
        title={t.shareOnX}
        post={post}
        t={t}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}
