"use client";

import { Check } from "lucide-react";
import { useEffect, useState } from "react";
import type { getCopy } from "@/lib/i18n";

const STEP_TWO_MS = 280;
const STEP_THREE_MS = 540;

function AnalysisSpark() {
  return (
    <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" aria-hidden>
      <path d="M8 1.15c.14 2.42 1.18 3.46 3.6 3.6-2.42.14-3.46 1.18-3.6 3.6-.14-2.42-1.18-3.46-3.6-3.6 2.42-.14 3.46-1.18 3.6-3.6Z" />
    </svg>
  );
}

export function PhotoAnalysisOverlay({
  t,
  slow,
  failed,
  complete,
  exiting,
  onFillManually,
  onEnterDetails,
  onChangePhoto,
}: {
  t: ReturnType<typeof getCopy>;
  slow: boolean;
  failed: boolean;
  complete: boolean;
  exiting: boolean;
  onFillManually: () => void;
  onEnterDetails: () => void;
  onChangePhoto: () => void;
}) {
  const [doneCount, setDoneCount] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const first = window.setTimeout(() => {
      setDoneCount(1);
      setVisibleCount(2);
    }, STEP_TWO_MS);
    const second = window.setTimeout(() => {
      setDoneCount(2);
      setVisibleCount(3);
    }, STEP_THREE_MS);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, []);

  useEffect(() => {
    if (!complete || visibleCount < 3) return;
    setDoneCount(3);
  }, [complete, visibleCount]);

  const title = failed ? t.analysisUnclear : slow ? t.analyzingStill : t.aiReading;
  const help = failed ? t.analysisUnclearHelp : slow ? t.analyzingStillHelp : t.aiHelp;
  const steps = [t.analysisPhoto, t.analysisCategory, t.analysisWriting];

  return (
    <div
      className={`photo-analysis${failed ? " is-failed" : ""}${exiting ? " is-exit" : ""}`}
      role="status"
      aria-live="polite"
      aria-busy={!failed && !complete}
    >
      <span className="photo-analysis-dim" aria-hidden />
      {!failed && <span className="photo-scan" aria-hidden />}
      <div className="photo-analysis-status">
        <span className={`photo-analysis-spark${failed ? " is-static" : ""}`} aria-hidden>
          <AnalysisSpark />
        </span>
        <p className="photo-analysis-title">{title}</p>
        <p className="photo-analysis-help">{help}</p>
        {!failed && (
          <ol className="photo-analysis-steps">
            {steps.slice(0, visibleCount).map((label, index) => {
              const done = index < doneCount;
              const active = !done && index === doneCount;
              return (
                <li key={label} className={done ? "is-done" : active ? "is-active" : ""}>
                  <span className="photo-analysis-mark" aria-hidden>
                    {done ? <Check size={12} strokeWidth={2.5} /> : <span className="photo-analysis-dot" />}
                  </span>
                  {label}
                </li>
              );
            })}
          </ol>
        )}
        {failed ? (
          <div className="photo-analysis-actions">
            <button type="button" className="photo-analysis-action is-primary" onClick={onEnterDetails}>
              {t.enterDetails}
            </button>
            <button type="button" className="photo-analysis-action is-secondary" onClick={onChangePhoto}>
              {t.changePhotoFull}
            </button>
          </div>
        ) : slow ? (
          <button type="button" className="photo-analysis-action is-secondary" onClick={onFillManually}>
            {t.fillManually}
          </button>
        ) : null}
      </div>
    </div>
  );
}
