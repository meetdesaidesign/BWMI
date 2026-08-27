"use client";

import { useMemo, useState } from "react";
import { OverlaySheet } from "./overlay-sheet";
import { LOCALE_META, SUPPORTED_LOCALES } from "@/lib/locale";
import type { getCopy } from "@/lib/i18n";
import type { Locale } from "@/lib/types";

export function LanguageSheet({
  open,
  locale,
  t,
  onClose,
  onChange,
}: {
  open: boolean;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  onClose: () => void;
  onChange: (locale: Locale) => void;
}) {
  const [query, setQuery] = useState("");
  const languages = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return SUPPORTED_LOCALES.filter((id) => {
      const meta = LOCALE_META[id];
      if (!needle) return true;
      return meta.searchNames.some((name) => name.toLowerCase().includes(needle)) || meta.selfName.toLowerCase().includes(needle);
    });
  }, [query]);

  return (
    <OverlaySheet open={open} title={t.languageTitle} onClose={() => { setQuery(""); onClose(); }} closeLabel={t.close}>
      <label className="language-search">
        <span className="visually-hidden">{t.languageSearch}</span>
        <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t.languageSearch} />
      </label>
      <ul className="language-list">
        {languages.map((id) => (
          <li key={id}>
            <button
              type="button"
              className={`language-option ${id === locale ? "is-selected" : ""}`}
              aria-pressed={id === locale}
              onClick={() => { onChange(id); setQuery(""); onClose(); }}
            >
              <strong>{LOCALE_META[id].selfName}</strong>
              <span>{LOCALE_META[id].shortLabel}</span>
            </button>
          </li>
        ))}
      </ul>
    </OverlaySheet>
  );
}
