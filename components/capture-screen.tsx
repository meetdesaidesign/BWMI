"use client";

/* eslint-disable @next/next/no-img-element -- captured data URLs must render through a native img */

import { Camera, CircleAlert, RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { Button } from "antd-mobile";
import { TopBar } from "./top-bar";
import { OverlaySheet } from "./overlay-sheet";
import { PhotoAnalysisOverlay } from "./photo-analysis-overlay";
import { LocationCard, locationView, type LocationAction } from "./location-card";
import type { getCopy } from "@/lib/i18n";
import type { AnalysisStatus, Locale, LocationFix, PhotoIssue } from "@/lib/types";

export function CaptureScreen({
  t,
  locale,
  photo,
  photoIssue,
  analysis,
  location,
  routedTo,
  offline,
  analyzing,
  analysisSlow,
  analysisFailed,
  analysisComplete,
  analysisExiting,
  photoCardRef,
  onBack,
  onFile,
  onRemovePhoto,
  onContinueAsGuest,
  onLocationAction,
  onRetryAnalysis,
  onContinue,
  onFillManually,
  onEnterDetails,
}: {
  t: ReturnType<typeof getCopy>;
  locale: Locale;
  photo: string | null;
  photoIssue: PhotoIssue;
  analysis: AnalysisStatus;
  location: LocationFix;
  routedTo?: string;
  offline: boolean;
  analyzing: boolean;
  analysisSlow: boolean;
  analysisFailed: boolean;
  analysisComplete: boolean;
  analysisExiting: boolean;
  photoCardRef: React.Ref<HTMLDivElement>;
  onBack: () => void;
  onFile: (file?: File) => void;
  onRemovePhoto: () => void;
  onContinueAsGuest: () => Promise<void>;
  onLocationAction: (action: LocationAction) => void;
  onRetryAnalysis: () => void;
  onContinue: () => void;
  onFillManually: () => void;
  onEnterDetails: () => void;
}) {
  const cameraRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [guestPending, setGuestPending] = useState(false);

  const view = locationView(location, t, locale);
  const locationReady = location.status === "ready" || location.status === "approximate";
  const canContinue = Boolean(photo) && locationReady;
  const busy = analysis === "running";

  const openCamera = () => cameraRef.current?.click();
  const openGallery = () => galleryRef.current?.click();
  const openPhotoOptions = () => setOptionsOpen(true);

  const continueAsGuest = async () => {
    if (guestPending) return;
    setGuestPending(true);
    try {
      await onContinueAsGuest();
    } finally {
      setGuestPending(false);
    }
  };

  /* One polite announcement channel for progress, location, and upload errors. */
  const announcement = analyzing
    ? (analysisFailed ? t.analysisUnclear : analysisSlow ? t.analyzingStill : t.aiReading)
    : photoIssue === "uploadFailed"
      ? t.uploadFailed
      : photoIssue === "unclear"
        ? t.photoUnclear
        : busy
          ? t.photoChecking
          : `${view.status}. ${view.detail}`;

  return (
    <div className={`full-page capture-page${analyzing ? " is-analyzing" : ""}`}>
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
        <div ref={photoCardRef} className={`photo-card has-photo${analyzing ? " is-analyzing" : ""}`}>
          <img src={photo} alt={t.photoAlt} />
          {analyzing && (
            <PhotoAnalysisOverlay
              t={t}
              slow={analysisSlow}
              failed={analysisFailed}
              complete={analysisComplete}
              exiting={analysisExiting}
              onFillManually={onFillManually}
              onEnterDetails={onEnterDetails}
              onChangePhoto={openPhotoOptions}
            />
          )}
          {!analysisFailed && (
            <button type="button" className="photo-change" onClick={openPhotoOptions}>
              <RotateCcw size={15} />{t.changePhoto}
            </button>
          )}
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

      {!photo && (
        <div className="capture-secondary">
          <button type="button" className="guest-link" disabled={guestPending} aria-busy={guestPending} onClick={() => void continueAsGuest()}>
            {t.continueAsGuest}
          </button>
        </div>
      )}

      <LocationCard t={t} locale={locale} location={location} routedTo={routedTo} onAction={onLocationAction} />

      {offline && photo && <p className="capture-offline">{t.savedOffline}</p>}

      {!analyzing && <p className="visually-hidden" role="status" aria-live="polite">{announcement}</p>}

      <div className="sticky-action">
        <Button block color="primary" size="large" className="primary-button" disabled={!canContinue} onClick={onContinue}>
          {t.review}
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
