"use client";

import { CircleAlert, Crosshair, LocateFixed, MapPin, MapPinOff } from "lucide-react";
import type { ReactNode } from "react";
import { namedPlace } from "@/lib/geo";
import { formatCopy, type getCopy } from "@/lib/i18n";
import type { Locale, LocationFix } from "@/lib/types";

type LocationAction = "use" | "change" | "adjust" | "retry";
type Tone = "ok" | "busy" | "warn" | "error" | "idle";

type ActionSpec = { intent: LocationAction; label: string; emphasis?: boolean };

type LocationView = {
  tone: Tone;
  icon: ReactNode;
  /** Answers 'what kind of location is this?' before anything else. */
  status: string;
  /** Place plus how precise it is, or why there is nothing yet. */
  detail: string;
  hint: string | null;
  actions: ActionSpec[];
};

function metres(value: number | null) {
  if (value === null) return null;
  return value >= 100 ? Math.round(value / 10) * 10 : Math.round(value);
}

function placeOf(fix: LocationFix, locale: Locale, fallback: string) {
  if (!fix.point) return fallback;
  return namedPlace(fix.point[0], fix.point[1], locale, fallback);
}

/**
 * Report step 1 location states. Each state names its own source (GPS, a pin the
 * resident dropped, nothing yet) because a place name alone never tells the
 * resident whether fixo actually found them.
 */
function locationView(fix: LocationFix, t: ReturnType<typeof getCopy>, locale: Locale): LocationView {
  const place = placeOf(fix, locale, t.locationArea);
  const accuracy = metres(fix.accuracyM);

  switch (fix.status) {
    case "ready":
      return fix.manual
        ? {
            tone: "ok",
            icon: <MapPin size={20} strokeWidth={2.2} />,
            status: t.locationPinned,
            detail: formatCopy(t.locationNotGps, { place }),
            hint: null,
            actions: [
              { intent: "adjust", label: t.locationMovePin },
              { intent: "use", label: t.locationUseCurrent },
            ],
          }
        : {
            tone: "ok",
            icon: <LocateFixed size={20} strokeWidth={2.2} />,
            status: t.locationCurrent,
            detail: accuracy === null ? place : formatCopy(t.locationAccurate, { place, m: accuracy }),
            hint: null,
            actions: [{ intent: "change", label: t.locationChangeOnMap }],
          };
    case "finding":
      return {
        tone: "busy",
        icon: <span className="spinner" />,
        status: t.locationFinding,
        detail: t.locationFindingHelp,
        hint: null,
        actions: [{ intent: "change", label: t.locationSetManually }],
      };
    case "approximate":
      return {
        tone: "warn",
        icon: <Crosshair size={20} strokeWidth={2.2} />,
        status: t.locationApproximate,
        detail: accuracy === null ? place : formatCopy(t.locationOffBy, { place, m: accuracy }),
        hint: t.locationCheckPin,
        actions: [
          { intent: "adjust", label: t.locationAdjust, emphasis: true },
          { intent: "retry", label: t.locationRetryGps },
        ],
      };
    case "unavailable":
      return {
        tone: "error",
        icon: <MapPinOff size={20} strokeWidth={2.2} />,
        status: t.locationUnavailable,
        detail: fix.blocked ? t.locationBlockedHelp : t.locationRetryHelp,
        hint: null,
        actions: fix.blocked
          ? [{ intent: "change", label: t.locationSetManually, emphasis: true }]
          : [
              { intent: "retry", label: t.locationRetryGps, emphasis: true },
              { intent: "change", label: t.locationSetManually },
            ],
      };
    default:
      return {
        tone: "idle",
        icon: <MapPin size={20} strokeWidth={2.2} />,
        status: t.locationMissing,
        detail: t.locationWhy,
        hint: null,
        actions: [
          { intent: "use", label: t.locationUseCurrent, emphasis: true },
          { intent: "change", label: t.locationSetManually },
        ],
      };
  }
}

/**
 * The location block on report step 1. Location decides which office receives
 * the report, so the card states the source, the precision, and the destination
 * instead of a bare tick beside an area name.
 */
export function LocationCard({
  t,
  locale,
  location,
  routedTo,
  onAction,
}: {
  t: ReturnType<typeof getCopy>;
  locale: Locale;
  location: LocationFix;
  routedTo?: string;
  onAction: (action: LocationAction) => void;
}) {
  const view = locationView(location, t, locale);
  const settled = location.status === "ready" || location.status === "approximate";

  return (
    <section className={`location-card tone-${view.tone}`} aria-label={t.locationCardAria}>
      <div className="location-card-head">
        <span className={`location-card-icon${view.tone === "ok" && !location.manual ? " is-live" : ""}`} aria-hidden>
          {view.icon}
        </span>
        <div className="location-card-text">
          <strong className="location-card-status type-label-md">{view.status}</strong>
          <span className="location-card-detail">{view.detail}</span>
          {view.hint && (
            <span className="location-card-hint">
              <CircleAlert size={13} aria-hidden />
              {view.hint}
            </span>
          )}
        </div>
      </div>

      {settled && routedTo && (
        <p className="location-card-route">{formatCopy(t.locationRoute, { office: routedTo })}</p>
      )}

      <div className="location-card-actions">
        {view.actions.map((action) => (
          <button
            key={`${action.intent}-${action.label}`}
            type="button"
            className={`location-card-button${action.emphasis ? " is-emphasis" : ""}`}
            onClick={() => onAction(action.intent)}
          >
            {action.label}
          </button>
        ))}
      </div>
    </section>
  );
}

export { locationView };
export type { LocationAction };
