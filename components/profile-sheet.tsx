"use client";

import { BadgeCheck, ChevronRight, Globe2 } from "lucide-react";
import { OverlaySheet } from "./overlay-sheet";
import { ProfileAvatar } from "./profile-avatar";
import { formatCopy, type getCopy } from "@/lib/i18n";
import { LOCALE_META } from "@/lib/locale";
import { residentProfile } from "@/lib/profile";
import type { Locale } from "@/lib/types";

export function ProfileSheet({
  open,
  t,
  locale,
  identityVerified,
  reportCount,
  areaLabel,
  onVerify,
  onOpenLanguage,
  onClose,
}: {
  open: boolean;
  t: ReturnType<typeof getCopy>;
  locale: Locale;
  /** Aadhaar identity verified. The mobile number is the login factor, so it needs no separate check. */
  identityVerified: boolean;
  reportCount: number;
  areaLabel: string;
  onVerify: () => void;
  onOpenLanguage: () => void;
  onClose: () => void;
}) {
  return (
    <OverlaySheet
      open={open}
      title={t.profileTitle}
      onClose={onClose}
      closeLabel={t.close}
      footer={identityVerified ? undefined : (
        <button type="button" className="primary-button" onClick={onVerify}>{t.verifyAadhaar}</button>
      )}
    >
      <div className="profile-hero">
        <ProfileAvatar size={88} alt="" />
        <h3 className="type-heading-sm">{residentProfile.displayName}</h3>
        {identityVerified ? (
          <span className="identity-badge">
            <BadgeCheck size={15} aria-hidden />
            {t.aadhaarVerified}
          </span>
        ) : null}
        <p className="type-caption">{areaLabel}</p>
        <p className="type-caption">{t.anonymous}</p>
      </div>

      <dl className="account-dl">
        <div>
          <dt>{t.profilePhone}</dt>
          <dd>
            <span>{residentProfile.phone}</span>
            <span className="type-caption">{t.profilePhoneHelp}</span>
          </dd>
        </div>
        <div>
          <dt>{t.profileIdentity}</dt>
          <dd>
            <span className={`profile-verify-status ${identityVerified ? "is-verified" : ""}`}>
              <BadgeCheck size={14} aria-hidden />
              {identityVerified ? t.aadhaarVerified : t.aadhaarUnverified}
            </span>
          </dd>
        </div>
        <div>
          <dt>{t.reports}</dt>
          <dd>{formatCopy(t.profileReports, { count: reportCount })}</dd>
        </div>
      </dl>

      <section className="account-section">
        <h3 className="type-heading-sm">{t.profileIdentity}</h3>
        <p className="type-body-md">{t.aadhaarHelp}</p>
      </section>

      <section className="account-section">
        <h3 className="type-heading-sm">{t.verification}</h3>
        <p className="type-body-md">{t.verificationHelp}</p>
      </section>

      <button type="button" className="account-row" onClick={onOpenLanguage}>
        <span className="account-row-icon" aria-hidden><Globe2 size={17} /></span>
        <span className="account-row-text">
          <strong className="type-label-md">{t.language}</strong>
          <span className="type-caption">{LOCALE_META[locale].selfName}</span>
        </span>
        <ChevronRight size={17} aria-hidden />
      </button>
    </OverlaySheet>
  );
}
