"use client";

/* eslint-disable @next/next/no-img-element -- issue evidence includes local files and data URLs */

import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Copy,
  Flag,
  ImageOff,
  MapPin,
  MoreVertical,
  RotateCcw,
  Share2,
} from "lucide-react";
import { Toast } from "antd-mobile";
import { useEffect, useId, useRef, useState } from "react";
import { areaContext, officerDisplayName, resolveIssueAuthority } from "@/lib/authority";
import { distanceMeters, formatDistance } from "@/lib/geo";
import {
  countCopy,
  formatCopy,
  getCategoryLabel,
  getStatusLabel,
  localizedField,
  type getCopy,
} from "@/lib/i18n";
import { composeIssuePost, isResponseOverdue } from "@/lib/share";
import type { Authority, Issue, IssueStatus, Locale, StatusEvent } from "@/lib/types";
import { OverlaySheet } from "./overlay-sheet";
import { ShareSheet, XLogo } from "./share-sheet";

const statusTone: Record<Issue["status"], string> = {
  reported: "slate",
  acknowledged: "slate",
  in_progress: "amber",
  awaiting_confirmation: "violet",
  confirmed: "green",
  contested: "red",
};

type ProgressState = "done" | "current" | "upcoming";

type ProgressStage = {
  key: string;
  label: string;
  date?: string;
  note?: string;
  state: ProgressState;
};

function field(issue: Issue, locale: Locale, name: "title" | "description") {
  return localizedField(issue as unknown as Record<string, unknown>, locale, name);
}

function eventByStatus(timeline: StatusEvent[], status: IssueStatus) {
  return [...timeline].reverse().find((event) => event.status === status);
}

function eventCopy(event: StatusEvent | undefined, locale: Locale) {
  if (!event) return { date: undefined as string | undefined, note: undefined as string | undefined };
  const note = locale === "hi" ? event.noteHi : locale === "kn" ? event.noteKn : event.noteEn;
  return { date: event.date, note };
}

function currentIndex(issue: Issue) {
  if (issue.status === "reported") return issue.routingPending ? 0 : 1;
  if (issue.status === "acknowledged") return 2;
  if (issue.status === "in_progress") return 3;
  if (issue.status === "awaiting_confirmation") return 4;
  if (issue.status === "confirmed") return 5;
  return 6;
}

function stageState(index: number, current: number, complete: boolean): ProgressState {
  if (complete || index < current) return "done";
  if (index === current) return "current";
  return "upcoming";
}

function progressStages(issue: Issue, locale: Locale, t: ReturnType<typeof getCopy>, authorityName: string): ProgressStage[] {
  const current = currentIndex(issue);
  const complete = issue.status === "confirmed";
  const submitted = eventCopy(eventByStatus(issue.timeline, "reported"), locale);
  const acknowledged = eventCopy(eventByStatus(issue.timeline, "acknowledged"), locale);
  const started = eventCopy(eventByStatus(issue.timeline, "in_progress"), locale);
  const resolved = eventCopy(
    eventByStatus(issue.timeline, "awaiting_confirmation") ?? eventByStatus(issue.timeline, "confirmed"),
    locale,
  );
  const reopened = eventCopy(eventByStatus(issue.timeline, "contested"), locale);

  const stages: ProgressStage[] = [
    { key: "submitted", label: t.statusSubmitted, ...submitted, state: stageState(0, current, complete) },
    {
      key: "sent",
      label: formatCopy(t.stageSent, { authority: authorityName }),
      state: stageState(1, current, complete),
    },
    { key: "acknowledged", label: t.stageAcknowledged, ...acknowledged, state: stageState(2, current, complete) },
    { key: "started", label: t.stageWorkStarted, ...started, state: stageState(3, current, complete) },
    { key: "resolved", label: t.statusResolved, ...resolved, state: stageState(4, current, complete) },
  ];

  if (issue.status === "contested") {
    stages.push({ key: "reopened", label: t.statusReopened, ...reopened, state: "current" });
  }

  return stages;
}

function initialsOf(name: string) {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]).join("");
}

function reportShareUrl(id: string) {
  const url = new URL(window.location.href);
  url.hash = `report/${id}`;
  return url.toString();
}

export function IssueDetail({
  issue,
  locale,
  t,
  backed,
  offline,
  origin,
  onBack,
  onBackIssue,
  onUndoConfirm,
  onConfirm,
  onContest,
  onViewMap,
}: {
  issue: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  backed: boolean;
  offline: boolean;
  origin?: [number, number] | null;
  onBack: () => void;
  onBackIssue: () => void;
  onUndoConfirm: () => void;
  onConfirm: () => void;
  onContest: () => void;
  onViewMap: () => void;
}) {
  const authority = resolveIssueAuthority(issue);
  const officer = officerDisplayName(authority, locale);
  const photos = issue.image ? [issue.image] : [];
  const title = field(issue, locale, "title");
  const description = field(issue, locale, "description");
  const stages = progressStages(issue, locale, t, authority.organizationName[locale]);
  const localeTag = locale === "en" ? "en-IN" : locale === "hi" ? "hi-IN" : "kn-IN";
  const distance = origin
    ? formatCopy(t.distanceAway, { distance: formatDistance(distanceMeters(origin[0], origin[1], issue.lat, issue.lng), localeTag) })
    : null;

  const [menuOpen, setMenuOpen] = useState(false);
  const [authorityOpen, setAuthorityOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [shareKind, setShareKind] = useState<"share" | "escalate">("share");
  const [confirming, setConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const moreId = useId();
  const menuId = useId();

  useEffect(() => {
    if (!menuOpen) return;
    const onPointer = (event: PointerEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setMenuOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  useEffect(() => {
    setConfirmError(false);
    setConfirming(false);
  }, [issue.id, backed]);

  const shareReport = async () => {
    const url = reportShareUrl(issue.id);
    if (navigator.share) {
      try {
        await navigator.share({ title, text: title, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      Toast.show({ content: t.copied, position: "bottom" });
    } catch {
      Toast.show({ content: t.shareFailed, position: "bottom" });
    }
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(reportShareUrl(issue.id));
      Toast.show({ content: t.copied, position: "bottom" });
    } catch {
      Toast.show({ content: t.shareFailed, position: "bottom" });
    }
  };

  const confirmSeen = async () => {
    if (issue.mine || backed || confirming) return;
    setConfirming(true);
    setConfirmError(false);
    try {
      if (offline) throw new Error("offline");
      await new Promise((resolve) => window.setTimeout(resolve, 320));
      onBackIssue();
      setConfirming(false);
    } catch {
      setConfirming(false);
      setConfirmError(true);
    }
  };

  const overdue = isResponseOverdue(issue);
  const confirmedOther = backed && !issue.mine;
  const postTemplate = confirmedOther ? t.postTemplateConfirmed : t.postTemplate;
  const publicPost = composeIssuePost(issue, locale, postTemplate, t.postHashtags);
  const neighbours = backed
    ? countCopy(issue.supporters, t.neighboursConfirmedNowOne, t.neighboursConfirmedNow)
    : countCopy(issue.supporters, t.neighboursConfirmedOne, t.neighboursConfirmed);
  const updates = countCopy(issue.timeline.length, t.updatesCountOne, t.updatesCount);
  const stickyPrimary = issue.mine
    ? t.youReportedThis
    : confirmedOther
      ? t.shareOnX
      : confirming
        ? t.confirming
        : t.seeToo;
  const stickyDisabled = issue.mine || confirming;

  const openShareSheet = (kind: "share" | "escalate") => {
    setShareKind(kind);
    setShareOpen(true);
  };

  const onStickyPrimary = () => {
    if (issue.mine || confirming) return;
    if (confirmedOther) {
      openShareSheet("share");
      return;
    }
    void confirmSeen();
  };

  return (
    <div className="full-page issue-detail">
      <header className="issue-header">
        <button type="button" className="issue-icon-btn" onClick={onBack} aria-label={t.back}>
          <ArrowLeft size={22} />
        </button>
        <p className="issue-ref">{formatCopy(t.reportRef, { id: issue.id })}</p>
        <div className="issue-more" ref={menuRef}>
          <button
            type="button"
            className="issue-icon-btn"
            aria-label={t.moreActions}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? menuId : undefined}
            id={moreId}
            onClick={() => setMenuOpen((open) => !open)}
          >
            <MoreVertical size={22} />
          </button>
          {menuOpen && (
            <div className="issue-menu" id={menuId} role="menu" aria-labelledby={moreId}>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); void shareReport(); }}>
                <Share2 size={18} aria-hidden />{t.shareReport}
              </button>
              {confirmedOther ? (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); openShareSheet("share"); }}>
                  <XLogo size={16} />{t.shareOnX}
                </button>
              ) : null}
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); Toast.show({ content: t.reportIncorrectThanks, position: "bottom" }); }}>
                <Flag size={18} aria-hidden />{t.reportIncorrect}
              </button>
              <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); void copyLink(); }}>
                <Copy size={18} aria-hidden />{t.copyReportLink}
              </button>
              {confirmedOther ? (
                <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onUndoConfirm(); }}>
                  {t.undoConfirm}
                </button>
              ) : null}
            </div>
          )}
        </div>
      </header>

      <div className="issue-detail-scroll">
        <IssuePhotos
          photos={photos}
          t={t}
          categoryLabel={getCategoryLabel(issue.category, locale)}
          statusLabel={getStatusLabel(issue.status, locale)}
          statusTone={statusTone[issue.status]}
        />

        <article className="issue-body">
          <div className="issue-intro">
            <h1 className="issue-title">{title}</h1>
            {description ? <p className="issue-description">{description}</p> : null}
          </div>

          <section className="issue-card issue-location" aria-label={t.locationCardAria}>
            <span className="issue-location-pin" aria-hidden>
              <MapPin size={20} />
            </span>
            <div className="issue-location-copy">
              <strong>{issue.address || t.locationApproximate}</strong>
              {issue.address ? <span>{t.locationApproximate}</span> : null}
              {distance ? <span>{distance}</span> : null}
              <button type="button" className="issue-text-link" onClick={onViewMap}>
                {t.viewOnMap}<ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </section>

          {issue.status === "awaiting_confirmation" && (
            <ConfirmFixCard issue={issue} t={t} onConfirm={onConfirm} onContest={onContest} />
          )}

          <section className={`issue-card issue-confirm${backed ? " is-done" : ""}`} aria-live="polite">
            {issue.mine ? (
              <>
                <h2 className="issue-card-title">{t.youReportedThis}</h2>
                <p className="issue-card-body">{neighbours}</p>
              </>
            ) : backed ? (
              <>
                <h2 className="issue-card-title">
                  <Check size={18} aria-hidden />
                  {t.youConfirmedIssue}
                </h2>
                <p className="issue-card-body">{neighbours}</p>
                <div className="issue-confirm-actions">
                  <button type="button" className="issue-confirm-primary" onClick={() => openShareSheet("share")}>
                    <XLogo size={15} />
                    {t.shareOnX}
                  </button>
                </div>
                <button type="button" className="issue-text-link" onClick={onUndoConfirm}>{t.undoConfirm}</button>
              </>
            ) : (
              <>
                <h2 className="issue-card-title">{t.alsoAffected}</h2>
                <p className="issue-card-body">{neighbours}</p>
                <div className="issue-confirm-actions">
                  <button
                    type="button"
                    className="issue-confirm-primary"
                    onClick={() => void confirmSeen()}
                    disabled={confirming}
                    aria-busy={confirming}
                  >
                    {confirming ? <span className="spinner" aria-hidden /> : null}
                    {confirming ? t.confirming : t.seeToo}
                  </button>
                </div>
                {confirmError ? (
                  <p className="issue-confirm-error" role="alert">
                    {t.confirmFailed}
                    <button type="button" className="issue-text-link" onClick={() => void confirmSeen()}>{t.retry}</button>
                  </p>
                ) : null}
              </>
            )}
          </section>

          <section className="issue-authority-block">
            <h2 className="issue-section-title">{t.responsibleAuthority}</h2>
            <div className="issue-card issue-authority">
              <p className="issue-authority-org">
                {authority.organizationName[locale]}
                <span aria-hidden> – </span>
                {authority.departmentName[locale]}
              </p>
              <p className="issue-authority-ward">{areaContext.ward[locale]} · {areaContext.areaName[locale]}</p>
              <div className="issue-officer">
                {officer ? (
                  <>
                    <span className="issue-officer-avatar" aria-hidden>{initialsOf(officer)}</span>
                    <span className="issue-officer-copy">
                      <strong>{officer}</strong>
                      <span>{authority.roleName[locale]}</span>
                    </span>
                  </>
                ) : (
                  <>
                    <span className="issue-officer-avatar is-pending" aria-hidden><Building2 size={16} /></span>
                    <span className="issue-officer-copy">
                      <strong>{t.officerPending}</strong>
                      <span>{authority.roleName[locale]}</span>
                    </span>
                  </>
                )}
              </div>
              <button type="button" className="issue-text-link" onClick={() => setAuthorityOpen(true)}>
                {t.viewAuthorityDetails}<ArrowRight size={16} aria-hidden />
              </button>
            </div>
          </section>

          <section className="issue-progress">
            <div className="issue-progress-head">
              <h2 className="issue-section-title">{t.timeline}</h2>
              <span>{updates}</span>
            </div>
            <ol className="issue-timeline">
              {stages.map((stage) => (
                <li key={stage.key} className={`issue-step is-${stage.state}`}>
                  <span className="issue-step-node" aria-hidden>
                    {stage.state === "done" ? <Check size={12} strokeWidth={3} /> : null}
                  </span>
                  <div className="issue-step-copy">
                    <strong>{stage.label}</strong>
                    {stage.date ? <time>{stage.date}</time> : null}
                    {stage.note ? <p>{stage.note}</p> : null}
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {overdue && (
            <section className="issue-card issue-escalate">
              <h2 className="issue-card-title">{t.escalatePublicly}</h2>
              <p className="issue-card-body">{t.escalateHelp}</p>
              <button type="button" className="issue-text-link" onClick={() => openShareSheet("escalate")}>
                {t.escalatePublicly}
              </button>
            </section>
          )}

        </article>
      </div>

      <div className="issue-detail-bar">
        <button
          type="button"
          className="issue-bar-primary"
          onClick={onStickyPrimary}
          disabled={stickyDisabled}
          aria-busy={confirming && !issue.mine && !backed}
        >
          {confirmedOther ? <XLogo size={15} /> : confirming ? <span className="spinner" aria-hidden /> : null}
          {stickyPrimary}
        </button>
        <button type="button" className="issue-icon-btn issue-bar-share" onClick={() => void shareReport()} aria-label={t.share}>
          <Share2 size={20} />
        </button>
      </div>

      <AuthoritySheet open={authorityOpen} authority={authority} officer={officer} locale={locale} t={t} onClose={() => setAuthorityOpen(false)} />
      <ShareSheet
        open={shareOpen}
        title={shareKind === "escalate" ? t.escalatePublicly : t.shareOnX}
        post={publicPost}
        t={t}
        onClose={() => setShareOpen(false)}
      />
    </div>
  );
}

function IssuePhotos({
  photos,
  t,
  categoryLabel,
  statusLabel,
  statusTone,
}: {
  photos: string[];
  t: ReturnType<typeof getCopy>;
  categoryLabel: string;
  statusLabel: string;
  statusTone: string;
}) {
  return (
    <div className={`issue-hero${photos.length === 0 ? " is-empty" : ""}`}>
      {photos.length === 0 ? (
        <div className="issue-hero-fallback" role="img" aria-label={t.photoUnavailable}>
          <ImageOff size={28} aria-hidden />
          <span>{t.photoUnavailable}</span>
        </div>
      ) : (
        <div
          className="issue-hero-track"
          tabIndex={photos.length > 1 ? 0 : undefined}
          aria-label={t.photoAlt}
        >
          {photos.map((src, photoIndex) => (
            <IssuePhoto key={src} src={src} alt={photoIndex === 0 ? t.photoAlt : ""} t={t} />
          ))}
        </div>
      )}
      <div className="issue-hero-meta">
        <span>{categoryLabel}</span>
        <span className="issue-hero-meta-separator" aria-hidden>·</span>
        <span className={`status-pill ${statusTone}`}>{statusLabel}</span>
      </div>
    </div>
  );
}

function IssuePhoto({ src, alt, t }: { src: string; alt: string; t: ReturnType<typeof getCopy> }) {
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  return (
    <div className={`issue-hero-slide is-${status}`}>
      {status !== "ready" && (
        <div className="issue-hero-fallback" aria-hidden={status === "loading"}>
          {status === "error" ? (
            <>
              <ImageOff size={28} aria-hidden />
              <span>{t.photoUnavailable}</span>
            </>
          ) : (
            <span className="issue-hero-shimmer" />
          )}
        </div>
      )}
      {status !== "error" && (
        <img
          src={src}
          alt={alt}
          onLoad={() => setStatus("ready")}
          onError={() => setStatus("error")}
        />
      )}
    </div>
  );
}

function ConfirmFixCard({
  issue,
  t,
  onConfirm,
  onContest,
}: {
  issue: Issue;
  t: ReturnType<typeof getCopy>;
  onConfirm: () => void;
  onContest: () => void;
}) {
  const resolutionEvent = eventByStatus(issue.timeline, "awaiting_confirmation");

  return (
    <section className="issue-card issue-verify" aria-labelledby={`confirm-fix-${issue.id}`}>
      <div className="issue-verify-copy">
        <h2 id={`confirm-fix-${issue.id}`} className="issue-card-title">{t.awaiting}</h2>
        <p className="issue-card-body">{t.inspect}</p>
      </div>

      {issue.resolutionImage ? (
        <figure className="issue-after-fix">
          <img src={issue.resolutionImage} alt={t.afterFixPhotoAlt} />
          <figcaption>
            <strong>{t.afterFix}</strong>
            {resolutionEvent?.date ? <time>{resolutionEvent.date}</time> : null}
          </figcaption>
        </figure>
      ) : null}

      <div className="issue-verify-actions">
        <button type="button" className="issue-verify-confirm" onClick={onConfirm}>
          <Check size={19} strokeWidth={2.5} aria-hidden />
          {t.fixed}
        </button>
        <button type="button" className="issue-verify-reopen" onClick={onContest}>
          <RotateCcw size={17} strokeWidth={2.25} aria-hidden />
          {t.broken}
        </button>
        <p className="issue-verify-help">{t.reopenNext}</p>
      </div>
    </section>
  );
}

function AuthoritySheet({
  open,
  authority,
  officer,
  locale,
  t,
  onClose,
}: {
  open: boolean;
  authority: Authority;
  officer: string | null;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  onClose: () => void;
}) {
  return (
    <OverlaySheet open={open} title={t.responsibleAuthority} onClose={onClose} closeLabel={t.close}>
      <dl className="account-dl">
        <div>
          <dt>{t.corporation}</dt>
          <dd>{authority.organizationName[locale]}</dd>
        </div>
        <div>
          <dt>{t.officeLabel}</dt>
          <dd>{authority.departmentName[locale]}</dd>
        </div>
        <div>
          <dt>{t.wardLabel}</dt>
          <dd>{areaContext.ward[locale]} · {areaContext.areaName[locale]}</dd>
        </div>
        <div>
          <dt>{t.assigned}</dt>
          <dd>{officer ? `${officer} · ${authority.roleName[locale]}` : t.officerPending}</dd>
        </div>
      </dl>
    </OverlaySheet>
  );
}
