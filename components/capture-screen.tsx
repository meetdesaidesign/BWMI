"use client";

/* eslint-disable @next/next/no-img-element -- captured data URLs must render through a native img */

import { Camera, Check, CircleAlert, Crosshair, MapPin, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "antd-mobile";
import { TopBar } from "./top-bar";
import { OverlaySheet } from "./overlay-sheet";
import type { getCopy } from "@/lib/i18n";
import type { AnalysisStatus, LocationFix, PhotoIssue } from "@/lib/types";

type LocationAction = "use" | "change" | "adjust" | "retry";

function locationRow(fix: LocationFix, t: ReturnType<typeof getCopy>) {
  switch (fix.status) {
    case "ready":
      return { text: t.locationArea, action: t.locationChange, intent: "change" as LocationAction, tone: "ok" as const };
    case "finding":
      return { text: t.locationFinding, action: null, intent: null, tone: "busy" as const };
    case "approximate":
      return { text: t.locationApproximate, action: t.locationAdjust, intent: "adjust" as LocationAction, tone: "warn" as const };
    case "unavailable":
      return { text: t.locationUnavailable, action: t.retry, intent: "retry" as LocationAction, tone: "error" as const };
    default:
      return { text: t.locationAdd, action: t.locationUse, intent: "use" as LocationAction, tone: "idle" as const };
  }
}

export function CaptureScreen({
  t,
  photo,
  photoIssue,
  analysis,
  location,
  offline,
  onBack,
  onFile,
  onRemovePhoto,
  onSamplePhoto,
  onLocationAction,
  onRetryAnalysis,
  onContinue,
}: {
  t: ReturnType<typeof getCopy>;
  photo: string | null;
  photoIssue: PhotoIssue;
  analysis: AnalysisStatus;
  location: LocationFix;
  offline: boolean;
  onBack: () => void;
  onFile: (file?: File) => void;
  onRemovePhoto: () => void;
  onSamplePhoto: () => void;
  onLocationAction: (action: LocationAction) => void;
  onRetryAnalysis: () => void;
  onContinue: () => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);

  const row = locationRow(location, t);
  const locationReady = location.status === "ready" || location.status === "approximate";
  const canContinue = Boolean(photo) && locationReady;
  const busy = analysis === "running";

  const openCamera = () => cameraRef.current?.click();
  const openGallery = () => galleryRef.current?.click();

  /* One polite announcement channel for progress, location, and upload errors. */
  const announcement = photoIssue === "uploadFailed"
    ? t.uploadFailed
    : photoIssue === "unclear"
      ? t.photoUnclear
      : busy
        ? t.photoChecking
        : row.text;

  return (
    <div className="full-page capture-page">
      <TopBar title={t.reportProblem} onBack={onBack} />

      <div className="step-progress" role="progressbar" aria-label={t.stepAria} aria-valuemin={1} aria-valuemax={2} aria-valuenow={1}>
        <span className="is-active" />
        <span />
      </div>

      <div className="capture-copy">
        <h1 className="capture-heading">{t.capture}</h1>
        <p className="capture-help">{t.captureHelp}</p>
      </div>

      <input ref={cameraRef} hidden type="file" accept="image/*" capture="environment" onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = ""; }} />
      <input ref={galleryRef} hidden type="file" accept="image/*" onChange={(event) => { onFile(event.target.files?.[0]); event.target.value = ""; }} />

      {photo ? (
        <div className="photo-card has-photo">
          <img src={photo} alt={t.photoAlt} />
          {busy && <span className="photo-busy" aria-hidden><span className="spinner" /></span>}
          <button type="button" className="photo-change" onClick={() => setOptionsOpen(true)}>
            <RotateCcw size={15} />{t.changePhoto}
          </button>
        </div>
      ) : (
        <button type="button" className="photo-card" onClick={openCamera} aria-label={t.camera}>
          <Camera size={52} strokeWidth={2} aria-hidden />
          <strong className="type-label-md">{t.camera}</strong>
        </button>
      )}

      {photoIssue !== "none" && (
        <p className={`photo-note${photoIssue === "uploadFailed" ? " is-error" : ""}`}>
          <CircleAlert size={15} aria-hidden />
          <span>{photoIssue === "uploadFailed" ? t.uploadFailed : t.photoUnclear}</span>
          {photoIssue === "uploadFailed" && <button type="button" className="text-button" onClick={onRetryAnalysis}>{t.retry}</button>}
        </p>
      )}

      <div className="capture-secondary">
        <button type="button" className="gallery-link" onClick={openGallery}>{t.upload}</button>
        {/* Demo builds only — the inline env check lets the compiler strip this from production. */}
        {process.env.NEXT_PUBLIC_DEMO_SAMPLE === "true" && <button type="button" className="sample-link" onClick={onSamplePhoto}>{t.demoPhotoHint}</button>}
      </div>

      <div className={`location-row tone-${row.tone}`}>
        <span className="location-row-icon" aria-hidden>
          {row.tone === "ok" ? <Check size={18} /> : row.tone === "error" ? <CircleAlert size={18} /> : row.tone === "busy" ? <span className="spinner" /> : <MapPin size={18} />}
        </span>
        <strong className="type-label-md">{row.text}</strong>
        {row.action && row.intent && (
          <button
            type="button"
            className="location-row-action"
            aria-label={row.intent === "change" ? t.locationChange : row.action}
            onClick={() => onLocationAction(row.intent)}
          >
            {row.intent === "adjust" && <Crosshair size={15} aria-hidden />}
            {row.action}
          </button>
        )}
      </div>

      {offline && photo && <p className="capture-offline">{t.savedOffline}</p>}

      <p className="visually-hidden" role="status" aria-live="polite">{announcement}</p>

      <div className="sticky-action">
        <Button block color="primary" size="large" className="primary-button" disabled={!canContinue} onClick={onContinue}>
          {t.reviewReport}
        </Button>
      </div>

      <OverlaySheet open={optionsOpen} title={t.photoOptions} onClose={() => setOptionsOpen(false)} closeLabel={t.close} titleClassName="type-heading-sm">
        <ul className="photo-options">
          <li><button type="button" onClick={() => { setOptionsOpen(false); openCamera(); }}>{t.takeAnother}</button></li>
          <li><button type="button" onClick={() => { setOptionsOpen(false); openGallery(); }}>{t.upload}</button></li>
          <li><button type="button" className="is-destructive" onClick={() => { setOptionsOpen(false); onRemovePhoto(); }}>{t.removePhoto}</button></li>
        </ul>
      </OverlaySheet>
    </div>
  );
}

export type { LocationAction };
