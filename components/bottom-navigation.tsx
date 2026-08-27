"use client";

import { ClipboardList, LoaderCircle, MapPin, Plus } from "lucide-react";
import type { getCopy } from "@/lib/i18n";

export type BottomNavDestination = "around" | "reports";

const iconProps = { size: 24, strokeWidth: 1.75, "aria-hidden": true as const };

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
        {busy ? <LoaderCircle className="bottom-nav-spinner" size={22} strokeWidth={2} aria-hidden /> : <Plus {...iconProps} />}
      </button>
    </nav>
  );
}
