"use client";

import { useEffect, useState } from "react";
import { POST_LIMIT, postIntentUrl } from "@/lib/share";
import type { getCopy } from "@/lib/i18n";
import { OverlaySheet } from "./overlay-sheet";

export function XLogo({ size = 15 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden focusable="false">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export function ShareSheet({
  open,
  title,
  post,
  t,
  onClose,
}: {
  open: boolean;
  title: string;
  post: string;
  t: ReturnType<typeof getCopy>;
  onClose: () => void;
}) {
  const [text, setText] = useState(post);

  useEffect(() => {
    if (open) setText(post);
  }, [open, post]);

  const draft = text.trim() || post;

  return (
    <OverlaySheet
      open={open}
      title={title}
      onClose={onClose}
      closeLabel={t.close}
      footer={
        <a
          className="primary-button share-open-x"
          href={postIntentUrl(draft)}
          target="_blank"
          rel="noreferrer"
          aria-label={t.shareOnXAria}
        >
          <XLogo size={15} />
          {t.openX}
        </a>
      }
    >
      <div className="share-compose">
        <div className="share-preview">
          <span className="share-preview-mark"><XLogo size={14} /></span>
          <p className="share-preview-text">{draft}</p>
        </div>
        <label className="share-edit">
          <span>{t.sharePostEdit}</span>
          <textarea
            value={text}
            maxLength={POST_LIMIT}
            rows={5}
            onChange={(event) => setText(event.target.value)}
          />
        </label>
        <p className="share-review-note type-caption">{t.shareReviewNote}</p>
      </div>
    </OverlaySheet>
  );
}
