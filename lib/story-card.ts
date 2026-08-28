import { tokens } from "@/design-system/generated/tokens";
import { areaContext } from "./authority";
import { formatCopy, type getCopy } from "./i18n";
import { privacyProtect } from "./privacy-blur";
import type { Issue, Locale } from "./types";

export const STORY_WIDTH = 1080;
export const STORY_HEIGHT = 1920;
export const WARD_SEASON = { reported: 47, fixed: 22 } as const;

export type StoryKind = "fix" | "ward";
type Copy = ReturnType<typeof getCopy>;
type StoryImage = CanvasImageSource & { width: number; height: number };

const FONT = tokens.fontFamilySans;
const SAFE = { x: 88, top: 228, bottom: 268 };
const PHOTO_RADIUS = 28;

export function daysToResolve(issue: Issue) {
  const start = Date.parse(issue.reportedAt);
  const end = Date.parse(issue.updatedAt);
  if (!Number.isFinite(start) || !Number.isFinite(end) || end < start) return 0;
  return Math.round((end - start) / 86_400_000);
}

export function storyArea(locale: Locale) {
  return `${areaContext.areaName[locale]} · ${areaContext.city[locale]}`;
}

export function fixHeadline(issue: Issue, t: Copy) {
  const hay = `${issue.titleEn} ${issue.category}`.toLowerCase();
  if (hay.includes("pothole")) return t.storyFixPothole;
  if (hay.includes("garbage") || hay.includes("waste") || hay.includes("dumped")) return t.storyFixWaste;
  if (hay.includes("leak") || hay.includes("pipe") || issue.category === "Water") return t.storyFixLeak;
  if (hay.includes("dark") || hay.includes("light") || issue.category === "Lighting") return t.storyFixLight;
  if (hay.includes("drain") || issue.category === "Drainage") return t.storyFixDrain;
  if (issue.category === "Roads") return t.storyFixRoad;
  if (issue.category === "Waste") return t.storyFixWaste;
  return t.storyFixGeneric;
}

export function resolvedCopy(days: number, t: Copy) {
  if (days <= 0) return t.storyResolvedToday;
  if (days === 1) return t.storyResolvedInDay;
  return formatCopy(t.storyResolvedInDays, { days });
}

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxWidth: number) {
  const lines: string[] = [];
  for (const block of text.split("\n")) {
    const words = block.split(" ").filter(Boolean);
    let current = "";
    for (const word of words) {
      const next = current ? `${current} ${word}` : word;
      if (current && ctx.measureText(next).width > maxWidth) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    if (current) lines.push(current);
  }
  return lines;
}

function fitSize(ctx: CanvasRenderingContext2D, lines: string[], maxWidth: number, size: number, weight: string) {
  let next = size;
  const apply = () => {
    ctx.font = `${weight} ${next}px ${FONT}`;
  };
  apply();
  while (next > 34 && lines.some((line) => ctx.measureText(line).width > maxWidth)) {
    next -= 2;
    apply();
  }
  return next;
}

function drawCover(ctx: CanvasRenderingContext2D, image: StoryImage, x: number, y: number, w: number, h: number, radius: number) {
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, radius);
  ctx.clip();
  const scale = Math.max(w / image.width, h / image.height);
  const dw = image.width * scale;
  const dh = image.height * scale;
  ctx.drawImage(image, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = "rgba(255,255,255,0.10)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x + 1, y + 1, w - 2, h - 2, radius - 1);
  ctx.stroke();
  ctx.restore();
}

function drawCheck(ctx: CanvasRenderingContext2D, cx: number, cy: number, size: number) {
  ctx.save();
  ctx.fillStyle = tokens.colorSuccess500;
  ctx.beginPath();
  ctx.arc(cx, cy, size / 2, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = tokens.colorGray0;
  ctx.lineWidth = Math.max(6, size * 0.08);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - size * 0.22, cy + size * 0.02);
  ctx.lineTo(cx - size * 0.06, cy + size * 0.18);
  ctx.lineTo(cx + size * 0.24, cy - size * 0.16);
  ctx.stroke();
  ctx.restore();
}

function drawChevron(ctx: CanvasRenderingContext2D, cx: number, cy: number) {
  ctx.save();
  ctx.strokeStyle = tokens.colorGray400;
  ctx.lineWidth = 5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 10, cy - 18);
  ctx.lineTo(cx + 12, cy);
  ctx.lineTo(cx - 10, cy + 18);
  ctx.stroke();
  ctx.restore();
}

function drawLogo(ctx: CanvasRenderingContext2D, logo: StoryImage, x: number, y: number, height: number) {
  const width = (logo.width / logo.height) * height;
  ctx.drawImage(logo, x, y, width, height);
  return width;
}

function drawFooter(
  ctx: CanvasRenderingContext2D,
  logo: StoryImage | null,
  tracked: string,
  url: string,
) {
  const y = STORY_HEIGHT - SAFE.bottom;
  if (logo) drawLogo(ctx, logo, SAFE.x, y, 44);
  ctx.fillStyle = tokens.colorGray400;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText(tracked, SAFE.x, y + 86);
  ctx.fillText(url, SAFE.x, y + 124);
}

const photoCache = new WeakMap<HTMLImageElement, Promise<HTMLCanvasElement>>();

async function preparePhoto(image: HTMLImageElement | null) {
  if (!image) return null;
  const cached = photoCache.get(image);
  if (cached) return cached;
  const next = privacyProtect(image, image.naturalWidth || image.width, image.naturalHeight || image.height);
  photoCache.set(image, next);
  return next;
}

function drawFixCard(
  ctx: CanvasRenderingContext2D,
  issue: Issue,
  locale: Locale,
  t: Copy,
  logo: StoryImage | null,
  reported: StoryImage | null,
  resolved: StoryImage | null,
) {
  const contentW = STORY_WIDTH - SAFE.x * 2;
  ctx.fillStyle = tokens.colorGray950;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  if (logo) drawLogo(ctx, logo, SAFE.x, SAFE.top, 48);
  ctx.fillStyle = tokens.colorGray400;
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText(storyArea(locale), SAFE.x, SAFE.top + 92);

  const headline = fixHeadline(issue, t);
  ctx.fillStyle = tokens.colorGray0;
  ctx.font = `700 64px ${FONT}`;
  if ("letterSpacing" in ctx) ctx.letterSpacing = "-0.03em";
  const rawLines = wrapLines(ctx, headline, contentW);
  const headlineSize = fitSize(ctx, rawLines, contentW, 64, "700");
  ctx.font = `700 ${headlineSize}px ${FONT}`;
  ctx.textBaseline = "top";
  rawLines.forEach((line, index) => {
    ctx.fillText(line, SAFE.x, SAFE.top + 128 + index * (headlineSize * 1.12));
  });
  ctx.textBaseline = "alphabetic";
  if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";

  const photoTop = SAFE.top + 128 + rawLines.length * (headlineSize * 1.12) + 48;
  const photoH = Math.max(400, Math.min(560, STORY_HEIGHT - SAFE.bottom - photoTop - 280));
  if (reported && resolved) {
    const gap = 56;
    const photoW = (contentW - gap) / 2;
    drawCover(ctx, reported, SAFE.x, photoTop, photoW, photoH, PHOTO_RADIUS);
    drawCover(ctx, resolved, SAFE.x + photoW + gap, photoTop, photoW, photoH, PHOTO_RADIUS);
    drawChevron(ctx, SAFE.x + photoW + gap / 2, photoTop + photoH / 2);
    ctx.font = `600 24px ${FONT}`;
    ctx.fillStyle = tokens.colorGray400;
    ctx.fillText(t.storyReported, SAFE.x, photoTop + photoH + 42);
    ctx.fillStyle = tokens.colorSuccess500;
    ctx.fillText(t.storyFixed, SAFE.x + photoW + gap, photoTop + photoH + 42);
  } else if (reported) {
    drawCover(ctx, reported, SAFE.x, photoTop, contentW, photoH, PHOTO_RADIUS);
    drawCheck(ctx, SAFE.x + contentW - 64, photoTop + photoH - 64, 112);
    ctx.font = `600 24px ${FONT}`;
    ctx.fillStyle = tokens.colorSuccess500;
    ctx.fillText(t.storyFixed, SAFE.x, photoTop + photoH + 42);
  }

  const detailsTop = photoTop + photoH + 108;
  ctx.fillStyle = tokens.colorGray0;
  ctx.font = `600 36px ${FONT}`;
  ctx.fillText(resolvedCopy(daysToResolve(issue), t), SAFE.x, detailsTop);
  ctx.fillStyle = tokens.colorGray400;
  ctx.font = `500 30px ${FONT}`;
  ctx.fillText(t.storyConfirmedByCommunity, SAFE.x, detailsTop + 52);

  ctx.fillStyle = tokens.colorGray0;
  ctx.font = `600 36px ${FONT}`;
  const closing = wrapLines(ctx, t.storyFixClosing, contentW);
  closing.forEach((line, index) => {
    ctx.fillText(line, SAFE.x, detailsTop + 148 + index * 46);
  });

  if (logo) drawFooter(ctx, logo, t.storyTrackedWith, t.storyUrl);
}

function drawWardCard(ctx: CanvasRenderingContext2D, locale: Locale, t: Copy, logo: StoryImage | null) {
  const contentW = STORY_WIDTH - SAFE.x * 2;
  ctx.fillStyle = tokens.colorGray950;
  ctx.fillRect(0, 0, STORY_WIDTH, STORY_HEIGHT);

  ctx.fillStyle = tokens.colorGray400;
  ctx.font = `500 28px ${FONT}`;
  ctx.fillText(formatCopy(t.storyWardKicker, { ward: areaContext.ward[locale] }), SAFE.x, SAFE.top + 24);

  ctx.fillStyle = tokens.colorGray0;
  ctx.font = `800 260px ${FONT}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(String(WARD_SEASON.fixed), SAFE.x - 8, 760);
  ctx.font = `600 56px ${FONT}`;
  ctx.fillText(t.storyWardStat, SAFE.x, 848);
  ctx.fillStyle = tokens.colorGray400;
  ctx.font = `500 32px ${FONT}`;
  ctx.fillText(formatCopy(t.storyWardFrom, { count: WARD_SEASON.reported }), SAFE.x, 908);

  const barY = 980;
  const barH = 10;
  const progress = WARD_SEASON.fixed / WARD_SEASON.reported;
  ctx.fillStyle = tokens.colorGray800;
  ctx.beginPath();
  ctx.roundRect(SAFE.x, barY, contentW, barH, barH / 2);
  ctx.fill();
  ctx.fillStyle = tokens.colorSuccess500;
  ctx.beginPath();
  ctx.roundRect(SAFE.x, barY, Math.max(barH, contentW * progress), barH, barH / 2);
  ctx.fill();
  ctx.fillStyle = tokens.colorGray400;
  ctx.font = `500 26px ${FONT}`;
  ctx.fillText(
    formatCopy(t.storyWardProgress, { fixed: WARD_SEASON.fixed, total: WARD_SEASON.reported }),
    SAFE.x,
    barY + 48,
  );

  ctx.fillStyle = tokens.colorGray0;
  ctx.font = `600 36px ${FONT}`;
  const closing = wrapLines(ctx, t.storyWardClosing, contentW);
  closing.forEach((line, index) => {
    ctx.fillText(line, SAFE.x, 1280 + index * 48);
  });

  if (logo) drawFooter(ctx, logo, t.storyTrackedWith, t.storyUrl);
}

export async function renderStoryCard(
  canvas: HTMLCanvasElement,
  kind: StoryKind,
  issue: Issue,
  locale: Locale,
  t: Copy,
  assets: { logo: HTMLImageElement | null; reported: HTMLImageElement | null; resolved: HTMLImageElement | null },
) {
  canvas.width = STORY_WIDTH;
  canvas.height = STORY_HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  await document.fonts.ready;

  const reported = await preparePhoto(assets.reported);
  const resolved = assets.resolved ? await preparePhoto(assets.resolved) : null;
  const logo = assets.logo;

  if (kind === "ward") drawWardCard(ctx, locale, t, logo);
  else drawFixCard(ctx, issue, locale, t, logo, reported, resolved);
}

export function canvasToBlob(canvas: HTMLCanvasElement) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
}
