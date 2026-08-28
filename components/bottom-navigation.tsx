"use client";

import { ClipboardList, LoaderCircle, MapPin, Plus } from "lucide-react";
import type { getCopy } from "@/lib/i18n";

export type BottomNavDestination = "around" | "reports";

const iconProps = { size: 20, strokeWidth: 1.75, "aria-hidden": true as const };

/**
 * Two destinations on a flat bar, with Report as a circular action in the
 * centre — reachable before either destination, without a floating dock.
 */
export function BottomNavigation({
  activeItem,
  onAroundYou,
  onMyReports,
  onReport,
  hidden,
  busy,
  hint,
  t,
}: {
  activeItem: BottomNavDestination;
  onAroundYou: () => void;
  onMyReports: () => void;
  onReport: () => void;
  hidden?: boolean;
  busy?: boolean;
  hint?: boolean;
  t: ReturnType<typeof getCopy>;
}) {
  return (
    <nav className="bottom-nav" hidden={hidden} aria-label={t.navAria}>
      <div className="bottom-nav-dock">
        <button
          type="button"
          className={`bottom-nav-item${activeItem === "around" ? " is-active" : ""}`}
          aria-current={activeItem === "around" ? "page" : undefined}
          onClick={onAroundYou}
        >
          <span className="bottom-nav-icon">
            <MapPin {...iconProps} />
          </span>
          <span className="bottom-nav-label">{t.nearby}</span>
        </button>

        <span className="bottom-nav-spacer" aria-hidden />

        <button
          type="button"
          className={`bottom-nav-item${activeItem === "reports" ? " is-active" : ""}`}
          aria-current={activeItem === "reports" ? "page" : undefined}
          onClick={onMyReports}
        >
          <span className="bottom-nav-icon">
            <ClipboardList {...iconProps} />
          </span>
          <span className="bottom-nav-label">{t.reports}</span>
        </button>
      </div>

      <button
        type="button"
        className={`bottom-nav-report${hint ? " is-hint" : ""}`}
        aria-label={t.reportProblem}
        aria-busy={busy || undefined}
        disabled={busy}
        onClick={onReport}
      >
        <span className="bottom-nav-report-badge">
          {busy ? (
            <LoaderCircle className="bottom-nav-spinner" size={20} strokeWidth={2.4} aria-hidden />
          ) : (
            <Plus size={20} strokeWidth={2.4} aria-hidden />
          )}
        </span>
      </button>
    </nav>
  );
}
