import { LOCALE_STORAGE_KEY } from "./config";
import type { Locale } from "./types";

export const SUPPORTED_LOCALES: Locale[] = ["kn", "en", "hi"];

export const LOCALE_META: Record<Locale, {
  id: Locale;
  selfName: string;
  shortLabel: string;
  searchNames: string[];
}> = {
  kn: { id: "kn", selfName: "ಕನ್ನಡ", shortLabel: "ಕ", searchNames: ["kannada", "ಕನ್ನಡ", "kn"] },
  en: { id: "en", selfName: "English", shortLabel: "EN", searchNames: ["english", "en"] },
  hi: { id: "hi", selfName: "हिंदी", shortLabel: "हिं", searchNames: ["hindi", "हिंदी", "hi"] },
};

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "en" || value === "hi" || value === "kn";
}

export function deviceLocale(): Locale {
  if (typeof navigator === "undefined") return "en";
  const candidates = [navigator.language, ...(navigator.languages ?? [])]
    .map((value) => value.slice(0, 2).toLowerCase());
  const match = candidates.find((code) => isLocale(code));
  return match ?? "en";
}

export function readStoredLocale(): Locale | null {
  if (typeof window === "undefined") return null;
  try {
    const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY);
    return isLocale(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writeStoredLocale(locale: Locale) {
  try {
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  } catch {
    /* ignore quota / private mode */
  }
}

export function resolveInitialLocale(): Locale {
  return readStoredLocale() ?? deviceLocale();
}
