"use client";

import { Check, Copy, Download, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import { tokens } from "@/design-system/generated/tokens";
import type { Locale } from "@/lib/types";
import type { getCopy } from "@/lib/i18n";

type Copy = ReturnType<typeof getCopy>;

export function StoryCard({ t }: { locale: Locale; t: Copy }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = tokens.colorGray950;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = tokens.colorGray0;
    ctx.font = "600 34px sans-serif";
    ctx.fillText(t.storyKicker, 80, 130);
    ctx.font = "700 330px sans-serif";
    ctx.fillText("47", 62, 850);
    ctx.font = "500 72px sans-serif";
    const headlineLines: string[] = [];
    let current = "";
    for (const word of t.storyHeadline.split(" ")) {
      const next = current ? `${current} ${word}` : word;
      if (ctx.measureText(next).width > 900 && current) {
        headlineLines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) headlineLines.push(current);
    headlineLines.forEach((line, i) => ctx.fillText(line, 80, 1030 + i * 92));
    ctx.fillStyle = tokens.colorGray400;
    ctx.font = "400 34px sans-serif";
    ctx.fillText(t.storyConfirmed, 80, 1350);
    ctx.strokeStyle = tokens.colorGray800;
    ctx.beginPath(); ctx.moveTo(80, 1600); ctx.lineTo(1000, 1600); ctx.stroke();
    ctx.fillStyle = tokens.actionPrimary;
    ctx.beginPath(); ctx.arc(106, 1704, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = tokens.colorGray0;
    ctx.font = "600 38px sans-serif";
    ctx.fillText(t.storyBrand, 160, 1696);
    ctx.fillStyle = tokens.colorGray400;
    ctx.font = "400 27px sans-serif";
    ctx.fillText("pakka.city/ward-14", 160, 1742);
    return canvas;
  };

  const download = () => {
    const canvas = render();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "pakka-share-card.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const share = async () => {
    const canvas = render();
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], "pakka-share-card.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: t.shareCardTitle });
    } else download();
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="story-wrap">
      <canvas ref={canvasRef} className="story-canvas" aria-label={t.storyAria} />
      <div className="story-preview" aria-hidden="true">
        <p>{t.storyKicker}</p><strong>47</strong><h3>{t.storyHeadline}</h3><small>{t.storyConfirmed}</small>
        <div className="story-award"><span><Check size={14} /></span><div>{t.storyBrand}<small>pakka.city/ward-14</small></div></div>
      </div>
      <div className="share-actions">
        <button className="primary-button" onClick={share}><Share2 size={18} />{t.share}</button>
        <button className="icon-action" onClick={download} aria-label={t.download}><Download size={19} /></button>
        <button className="icon-action" onClick={copyLink} aria-label={t.copy}>{copied ? <Check size={19} /> : <Copy size={19} />}</button>
      </div>
      {copied && <p className="toast" role="status">{t.copied}</p>}
    </div>
  );
}
