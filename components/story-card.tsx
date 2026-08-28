"use client";

import { Check, Copy, Loader2, Lock, Save } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { Toast } from "antd-mobile";
import { assetPath, brand } from "@/lib/assets";
import type { getCopy } from "@/lib/i18n";
import { canvasToBlob, renderStoryCard, type StoryKind } from "@/lib/story-card";
import type { Issue, Locale } from "@/lib/types";

type Copy = ReturnType<typeof getCopy>;
type Action = "share" | "save" | "copy";

function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3" y="3" width="18" height="18" rx="5" stroke="currentColor" strokeWidth="2" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  );
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("image"));
    image.src = src;
  });
}

function isAbort(error: unknown) {
  return error instanceof DOMException && error.name === "AbortError";
}

export function StoryCard({ issue, locale, t }: { issue: Issue; locale: Locale; t: Copy }) {
  const fixCanvasRef = useRef<HTMLCanvasElement>(null);
  const wardCanvasRef = useRef<HTMLCanvasElement>(null);
  const [kind, setKind] = useState<StoryKind>("fix");
  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState<Action | null>(null);
  const [done, setDone] = useState<Action | null>(null);
  const [slide, setSlide] = useState<"in" | "from-left" | "from-right">("in");

  const activeCanvas = () => (kind === "fix" ? fixCanvasRef.current : wardCanvasRef.current);

  const paint = useCallback(async () => {
    const fixCanvas = fixCanvasRef.current;
    const wardCanvas = wardCanvasRef.current;
    if (!fixCanvas || !wardCanvas) return;
    setReady(false);
    try {
      const [logo, reported] = await Promise.all([
        loadImage(assetPath(brand.logoHorizontal)).catch(() => null),
        loadImage(assetPath(issue.image)).catch(() => null),
      ]);
      const resolved = issue.resolutionImage
        ? await loadImage(assetPath(issue.resolutionImage)).catch(() => null)
        : null;
      const assets = { logo, reported, resolved };
      await Promise.all([
        renderStoryCard(fixCanvas, "fix", issue, locale, t, assets),
        renderStoryCard(wardCanvas, "ward", issue, locale, t, assets),
      ]);
      setReady(true);
    } catch {
      setReady(false);
    }
  }, [issue, locale, t]);

  useEffect(() => {
    void paint();
  }, [paint]);

  const switchKind = (next: StoryKind) => {
    if (next === kind) return;
    setSlide(next === "ward" ? "from-right" : "from-left");
    setKind(next);
  };

  const downloadCanvas = (canvas: HTMLCanvasElement) => {
    const a = document.createElement("a");
    a.download = "fixo-story.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const flash = (action: Action) => {
    setDone(action);
    window.setTimeout(() => setDone(null), 1800);
  };

  const share = async () => {
    const canvas = activeCanvas();
    if (!canvas || busy) return;
    setBusy("share");
    try {
      const blob = await canvasToBlob(canvas);
      if (!blob) throw new Error("blob");
      const file = new File([blob], "fixo-story.png", { type: "image/png" });
      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: t.shareToInstagram });
        return;
      }
      downloadCanvas(canvas);
      Toast.show({ content: t.storyInstagramUnavailable, position: "bottom" });
      flash("save");
    } catch (error) {
      if (isAbort(error)) return;
      Toast.show({ content: t.shareFailed, position: "bottom" });
    } finally {
      setBusy(null);
    }
  };

  const save = async () => {
    const canvas = activeCanvas();
    if (!canvas || busy) return;
    setBusy("save");
    try {
      downloadCanvas(canvas);
      Toast.show({ content: t.storySaved, position: "bottom" });
      flash("save");
    } catch {
      Toast.show({ content: t.shareFailed, position: "bottom" });
    } finally {
      setBusy(null);
    }
  };

  const copyLink = async () => {
    if (busy) return;
    setBusy("copy");
    try {
      await navigator.clipboard.writeText(window.location.href);
      Toast.show({ content: t.copied, position: "bottom" });
      flash("copy");
    } catch {
      Toast.show({ content: t.shareFailed, position: "bottom" });
    } finally {
      setBusy(null);
    }
  };

  const saveLabel = done === "save" ? t.storySaved : t.storySave;
  const copyLabel = done === "copy" ? t.copied : t.copy;

  return (
    <div className="story-page">
      <div className="story-switch" role="tablist" aria-label={t.storySwitchAria}>
        <button
          type="button"
          role="tab"
          aria-selected={kind === "fix"}
          className={kind === "fix" ? "is-active" : undefined}
          onClick={() => switchKind("fix")}
        >
          {t.storyThisFix}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={kind === "ward"}
          className={kind === "ward" ? "is-active" : undefined}
          onClick={() => switchKind("ward")}
        >
          {t.storyWardImpact}
        </button>
      </div>

      <div className="story-stage">
        <div className={`story-deck is-${slide}${ready ? " is-ready" : ""}`}>
          <canvas
            ref={fixCanvasRef}
            className={kind === "fix" ? "is-active" : undefined}
            width={1080}
            height={1920}
            aria-hidden={kind !== "fix"}
            aria-label={t.storyAria}
          />
          <canvas
            ref={wardCanvasRef}
            className={kind === "ward" ? "is-active" : undefined}
            width={1080}
            height={1920}
            aria-hidden={kind !== "ward"}
            aria-label={t.storyAriaWard}
          />
        </div>
      </div>

      <p className="story-privacy">
        <Lock size={14} aria-hidden />
        {t.storyPrivacyNote}
      </p>

      <div className="story-actions">
        <button
          type="button"
          className="primary-button"
          onClick={() => void share()}
          disabled={!ready || busy !== null}
          data-tooltip={t.shareToInstagram}
          aria-label={t.shareToInstagram}
        >
          {busy === "share" ? <Loader2 size={18} className="story-spin" aria-hidden /> : <InstagramIcon />}
          {busy === "share" ? t.storySharing : t.shareToInstagram}
        </button>
        <div className="story-secondary-row">
          <button
            type="button"
            className="story-secondary"
            onClick={() => void save()}
            disabled={!ready || busy !== null}
            data-tooltip={t.storySave}
          >
            {busy === "save" ? <Loader2 size={18} className="story-spin" aria-hidden /> : done === "save" ? <Check size={18} aria-hidden /> : <Save size={18} aria-hidden />}
            {busy === "save" ? t.storySaving : saveLabel}
          </button>
          <button
            type="button"
            className="story-secondary"
            onClick={() => void copyLink()}
            disabled={!ready || busy !== null}
            data-tooltip={t.copy}
          >
            {busy === "copy" ? <Loader2 size={18} className="story-spin" aria-hidden /> : done === "copy" ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
            {busy === "copy" ? t.storyCopying : copyLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
