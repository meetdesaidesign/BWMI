"use client";

/* eslint-disable @next/next/no-img-element -- review evidence is a user-captured data URL */

import { ArrowRight, Check, MapPin, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "antd-mobile";
import { formatCopy, getCategoryLabel, getCopy, localizedField } from "@/lib/i18n";
import { namedPlace } from "@/lib/geo";
import type { AIExtraction, Category, Issue, Locale, LocationFix } from "@/lib/types";
import { CategoryIcon } from "./category-icon";
import { TopBar } from "./top-bar";

const FILL_STAGGER_MS = 130;
const HIGHLIGHT_MS = 420;
const FILLED_NOTE_MS = 2500;

type FillMode = "stagger" | "instant";
type RevealKey = "category" | "title" | "details" | "duplicate";

export function ReviewScreen({
  locale,
  t,
  extraction,
  setExtraction,
  photo,
  photoRef,
  photoReady,
  location,
  duplicate,
  different,
  setDifferent,
  fillMode,
  playFill,
  onBack,
  onBackExisting,
  onSubmit,
}: {
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  extraction: AIExtraction;
  setExtraction: (e: AIExtraction) => void;
  photo: string | null;
  photoRef: React.Ref<HTMLDivElement>;
  photoReady: boolean;
  location: LocationFix;
  duplicate?: Issue;
  different: boolean;
  setDifferent: (v: boolean) => void;
  fillMode: FillMode;
  playFill: boolean;
  onBack: () => void;
  onBackExisting: (i: Issue) => void;
  onSubmit: () => void;
}) {
  const categories: Category[] = ["Roads", "Waste", "Water", "Lighting", "Drainage", "Other"];
  const titleKey = locale === "hi" ? "title_hi" : locale === "kn" && extraction.title_kn ? "title_kn" : "title_en";
  const descKey = locale === "hi" ? "description_hi" : locale === "kn" && extraction.description_kn ? "description_kn" : "description_en";
  const place = location.point
    ? namedPlace(location.point[0], location.point[1], locale, t.locationArea)
    : t.locationArea;
  const accuracy = location.accuracyM;
  const metres = accuracy === null ? null : accuracy >= 100 ? Math.round(accuracy / 10) * 10 : Math.round(accuracy);
  const placeLine = location.status === "approximate"
    ? formatCopy(t.locationApprox, { place })
    : metres === null
      ? place
      : formatCopy(t.locationReady, { place, m: metres });

  const instant = fillMode === "instant";
  const [revealed, setRevealed] = useState<Record<RevealKey, boolean>>({
    category: instant,
    title: instant,
    details: instant,
    duplicate: instant,
  });
  const [highlight, setHighlight] = useState<Partial<Record<RevealKey, boolean>>>({});
  const [note, setNote] = useState<"hidden" | "show" | "leaving">("hidden");
  const [locked, setLocked] = useState<Partial<Record<RevealKey, boolean>>>({});

  useEffect(() => {
    if (instant || !playFill) return;
    const timers: number[] = [];
    const keys: RevealKey[] = ["category", "title", "details"];
    if (duplicate && !different) keys.push("duplicate");

    keys.forEach((key, index) => {
      timers.push(window.setTimeout(() => {
        setRevealed((current) => ({ ...current, [key]: true }));
        setHighlight((current) => ({ ...current, [key]: true }));
        timers.push(window.setTimeout(() => {
          setHighlight((current) => ({ ...current, [key]: false }));
        }, HIGHLIGHT_MS));
      }, FILL_STAGGER_MS * index));
    });

    timers.push(window.setTimeout(() => {
      setNote("show");
    }, FILL_STAGGER_MS * keys.length));
    timers.push(window.setTimeout(() => {
      setNote("leaving");
    }, FILL_STAGGER_MS * keys.length + FILLED_NOTE_MS));
    timers.push(window.setTimeout(() => {
      setNote("hidden");
    }, FILL_STAGGER_MS * keys.length + FILLED_NOTE_MS + 280));

    return () => {
      timers.forEach((id) => window.clearTimeout(id));
    };
  }, [instant, playFill]);

  const titleValue = revealed.title || locked.title ? extraction[titleKey] : "";
  const detailsValue = revealed.details || locked.details ? extraction[descKey] : "";
  const showDuplicate = Boolean(duplicate && !different && revealed.duplicate);

  return (
    <div className={`full-page review-page${photoReady ? "" : " is-awaiting"}`}>
      <TopBar title={t.review} onBack={onBack} />
      <div ref={photoRef} className={`review-evidence${photoReady ? "" : " is-awaiting"}`}>
        {photo && <img src={photo} alt={t.photoAlt} />}
        {photoReady && (
          <div>
            <span><MapPin size={14} />{placeLine}</span>
          </div>
        )}
      </div>
      {note !== "hidden" && (
        <div className={`review-filled-note${note === "leaving" ? " is-leaving" : ""}`} role="status">
          <Check size={16} strokeWidth={2.25} aria-hidden />
          <span>
            <strong>{t.detailsFilled}</strong>
            <span>{t.detailsFilledHelp}</span>
          </span>
        </div>
      )}
      <div className="review-form">
        <label className={highlight.category ? "is-highlight" : ""}>
          <span>{t.category}</span>
          <div className="category-chips">
            {categories.map((category) => (
              <button
                type="button"
                key={category}
                className={revealed.category && extraction.category === category ? "selected" : ""}
                aria-pressed={revealed.category && extraction.category === category}
                onClick={() => {
                  setLocked((current) => ({ ...current, category: true }));
                  setRevealed((current) => ({ ...current, category: true }));
                  setExtraction({ ...extraction, category });
                }}
              >
                <CategoryIcon category={category} size={16} /> {getCategoryLabel(category, locale)}
              </button>
            ))}
          </div>
        </label>
        <label className={highlight.title ? "is-highlight" : ""}>
          <span>{t.title}</span>
          <input
            value={titleValue}
            onChange={(event) => {
              setLocked((current) => ({ ...current, title: true }));
              setRevealed((current) => ({ ...current, title: true }));
              setExtraction({ ...extraction, [titleKey]: event.target.value });
            }}
          />
        </label>
        <label className={highlight.details ? "is-highlight" : ""}>
          <span>{t.description}</span>
          <textarea
            rows={3}
            value={detailsValue}
            onChange={(event) => {
              setLocked((current) => ({ ...current, details: true }));
              setRevealed((current) => ({ ...current, details: true }));
              setExtraction({ ...extraction, [descKey]: event.target.value });
            }}
          />
        </label>
        {showDuplicate && duplicate && (
          <DuplicateNotice
            duplicate={duplicate}
            locale={locale}
            t={t}
            onBackExisting={onBackExisting}
            onDismiss={() => setDifferent(true)}
          />
        )}
      </div>
      <div className="sticky-action">
        <Button block color="primary" size="large" className="primary-button" onClick={onSubmit}>
          {t.submit}<ArrowRight size={18} />
        </Button>
      </div>
    </div>
  );
}

function DuplicateNotice({
  duplicate,
  locale,
  t,
  onBackExisting,
  onDismiss,
}: {
  duplicate: Issue;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  onBackExisting: (i: Issue) => void;
  onDismiss: () => void;
}) {
  const title = localizedField(duplicate as unknown as Record<string, unknown>, locale, "title");
  return (
    <aside className="duplicate-notice is-enter" aria-label={t.duplicateAria}>
      <p className="duplicate-notice-label"><Users size={13} aria-hidden />{t.duplicate}</p>
      <div className="duplicate-notice-match">
        {duplicate.image
          ? <img className="duplicate-notice-thumb" src={duplicate.image} alt="" />
          : <span className="duplicate-notice-thumb is-icon"><CategoryIcon category={duplicate.category} size={18} /></span>}
        <span className="duplicate-notice-body">
          <strong className="type-label-md">{title}</strong>
          <span className="type-caption">{duplicate.supporters} {t.supporters} · {duplicate.address}</span>
        </span>
      </div>
      <div className="duplicate-notice-actions">
        <button type="button" className="duplicate-notice-support" onClick={() => onBackExisting(duplicate)}>{t.seeToo}</button>
        <button type="button" className="duplicate-notice-dismiss" onClick={onDismiss}>{t.different}</button>
      </div>
    </aside>
  );
}
