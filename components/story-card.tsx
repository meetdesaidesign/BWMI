"use client";

import { Check, Copy, Download, Share2 } from "lucide-react";
import { useRef, useState } from "react";
import type { Locale } from "@/lib/types";
import type { getCopy } from "@/lib/i18n";

type Copy = ReturnType<typeof getCopy>;

export function StoryCard({ locale, t }: { locale: Locale; t: Copy }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);

  const render = () => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    ctx.fillStyle = "#1f201d";
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.fillStyle = "#f6f1e7";
    ctx.font = "600 34px sans-serif";
    ctx.fillText(locale === "hi" ? "वार्ड 14 · इस मौसम में" : "WARD 14 · THIS SEASON", 80, 130);
    ctx.font = "700 330px Georgia";
    ctx.fillText("47", 62, 850);
    ctx.font = "500 72px sans-serif";
    const lines = locale === "hi" ? ["समस्याएँ जिन्हें", "पड़ोसियों ने", "नज़रअंदाज़ नहीं किया"] : ["things our neighbours", "refused to", "ignore"];
    lines.forEach((line, i) => ctx.fillText(line, 80, 1030 + i * 92));
    ctx.fillStyle = "#aca89d";
    ctx.font = "400 34px sans-serif";
    ctx.fillText(locale === "hi" ? "22 की मरम्मत की पुष्टि" : "22 of them confirmed fixed", 80, 1350);
    ctx.strokeStyle = "#494a45";
    ctx.beginPath(); ctx.moveTo(80, 1600); ctx.lineTo(1000, 1600); ctx.stroke();
    ctx.fillStyle = "#e6532f";
    ctx.beginPath(); ctx.arc(106, 1704, 26, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = "#f6f1e7";
    ctx.font = "600 38px sans-serif";
    ctx.fillText(locale === "hi" ? "सबूत रक्षक" : "Proof Keeper", 160, 1696);
    ctx.fillStyle = "#aca89d";
    ctx.font = "400 27px sans-serif";
    ctx.fillText("pakka.city/ward-14", 160, 1742);
    return canvas;
  };

  const download = () => {
    const canvas = render();
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "pakka-proof-keeper.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const share = async () => {
    const canvas = render();
    if (!canvas) return;
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) return;
    const file = new File([blob], "pakka-proof-keeper.png", { type: "image/png" });
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: "Pakka · Proof Keeper" });
    } else download();
  };

  const copyLink = async () => {
    await navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="story-wrap">
      <canvas ref={canvasRef} className="story-canvas" aria-label="Pakka Proof Keeper story card" />
      <div className="story-preview" aria-hidden="true">
        <p>WARD 14 · THIS SEASON</p><strong>47</strong><h3>things our neighbours<br />refused to ignore</h3><small>22 of them confirmed fixed</small>
        <div className="story-award"><span><Check size={14} /></span><div>Proof Keeper<small>pakka.city/ward-14</small></div></div>
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
