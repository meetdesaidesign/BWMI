"use client";

/* eslint-disable @next/next/no-img-element -- report evidence uses local files and data URLs */

import { Lock, MapPin, Share2, X } from "lucide-react";
import { assetPath } from "@/lib/assets";
import { getPublicStatusLabel, localizedField, type getCopy } from "@/lib/i18n";
import { toPublicStatus } from "@/lib/public-status";
import type { Issue, Locale } from "@/lib/types";
import { CategoryIcon } from "./category-icon";

function field(issue: Issue, locale: Locale, name: "title") {
  return localizedField(issue as unknown as Record<string, unknown>, locale, name);
}

function mediaSrc(src: string) {
  if (src.startsWith("data:") || src.startsWith("blob:") || /^https?:/i.test(src)) return src;
  return assetPath(src);
}

function SuccessCheck() {
  return (
    <span className="confirmed-mark" aria-hidden>
      <span className="confirmed-ring" />
      <svg className="confirmed-badge" viewBox="0 0 48 48" width="48" height="48">
        <circle cx="24" cy="24" r="22" />
        <path
          className="confirmed-check"
          pathLength="1"
          d="M15 24.2 21.2 30.5 33.5 17.5"
        />
      </svg>
    </span>
  );
}

export function ConfirmedScreen({
  issue,
  locale,
  t,
  onClose,
  onViewReport,
  onShare,
}: {
  issue: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  onClose: () => void;
  onViewReport: () => void;
  onShare: () => void;
}) {
  const title = field(issue, locale, "title");
  const statusLabel = getPublicStatusLabel(toPublicStatus(issue.status), locale);

  return (
    <div className="confirmed-screen">
      <header className="confirmed-nav">
        <button type="button" className="confirmed-nav-close" onClick={onClose} aria-label={t.close}>
          <X size={22} strokeWidth={2} />
        </button>
        <button type="button" className="confirmed-nav-action" onClick={onViewReport}>
          {t.viewReport}
        </button>
      </header>

      <div className="confirmed-scroll">
        <div className="confirmed-main">
          <div className="confirmed-hero">
            <SuccessCheck />
            <h1 className="type-heading-lg">{t.confirmedTitle}</h1>
            <p className="type-body-md">{t.confirmedHelp}</p>
          </div>

          <div className="confirmed-context">
            <button type="button" className="confirmed-report" onClick={onViewReport}>
              {issue.image
                ? <img className="confirmed-thumb" src={mediaSrc(issue.image)} alt="" />
                : (
                  <span className="confirmed-thumb is-icon" aria-hidden>
                    <CategoryIcon category={issue.category} size={22} />
                  </span>
                )}
              <div className="confirmed-report-copy">
                <div className="confirmed-report-top">
                  <strong className="confirmed-report-title">{title}</strong>
                  <span className="status-pill green">{statusLabel}</span>
                </div>
                <p className="confirmed-report-meta">{issue.address}</p>
                <p className="confirmed-report-note">{t.confirmedByYouToday}</p>
              </div>
            </button>

            <p className="confirmed-impact">
              <MapPin size={15} strokeWidth={2} aria-hidden />
              <span>{t.confirmedImpact}</span>
            </p>
          </div>
        </div>
      </div>

      <div className="confirmed-actions">
        <button type="button" className="primary-button" onClick={onShare}>
          <Share2 size={18} strokeWidth={2.25} aria-hidden />
          {t.shareUpdate}
        </button>
        <p className="confirmed-privacy">
          <Lock size={13} strokeWidth={2.25} aria-hidden />
          <span>{t.sharePrivacyNote}</span>
        </p>
        <button type="button" className="confirmed-done" onClick={onClose}>
          {t.done}
        </button>
      </div>
    </div>
  );
}
