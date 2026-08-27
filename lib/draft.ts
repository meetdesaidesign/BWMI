import type { LocationFix } from "./types";

const DRAFT_KEY = "fixo.report.draft";

export interface ReportDraft {
  photo: string | null;
  location: LocationFix | null;
}

/**
 * Step 1 survives a reload so an offline report is never lost. Photo data URLs
 * can exceed the storage quota; when they do we keep the rest of the draft
 * rather than dropping it, since the photo still lives in memory.
 */
export function writeDraft(draft: ReportDraft) {
  try {
    localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  } catch {
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...draft, photo: null }));
    } catch {
      /* storage unavailable — the in-memory draft is still intact */
    }
  }
}

export function readDraft(): ReportDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ReportDraft;
    if (!parsed || typeof parsed !== "object") return null;
    return { photo: typeof parsed.photo === "string" ? parsed.photo : null, location: parsed.location ?? null };
  } catch {
    return null;
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(DRAFT_KEY);
  } catch {
    /* nothing to clear */
  }
}
