"use client";

import { ShieldCheck } from "lucide-react";
import { OverlaySheet } from "./overlay-sheet";
import { ProfileAvatar } from "./profile-avatar";
import { formatCopy, type getCopy } from "@/lib/i18n";
import { residentProfile } from "@/lib/profile";

export function ProfileSheet({
  open,
  t,
  verified,
  reportCount,
  areaLabel,
  onVerify,
  onClose,
}: {
  open: boolean;
  t: ReturnType<typeof getCopy>;
  verified: boolean;
  reportCount: number;
  areaLabel: string;
  onVerify: () => void;
  onClose: () => void;
}) {
  return (
    <OverlaySheet
      open={open}
      title={t.profileTitle}
      onClose={onClose}
      closeLabel={t.close}
      footer={verified ? undefined : (
        <button type="button" className="primary-button" onClick={onVerify}>{t.verifyPhone}</button>
      )}
    >
      <div className="profile-hero">
        <ProfileAvatar size={88} verified={verified} alt="" />
        <h3 className="type-heading-sm">{residentProfile.displayName}</h3>
        <p className="type-caption">{areaLabel}</p>
        <p className="type-caption">{t.anonymous}</p>
      </div>

      <dl className="account-dl">
        <div>
          <dt>{t.profilePhone}</dt>
          <dd>
            <span>{residentProfile.phone}</span>
            <span className={`profile-verify-status ${verified ? "is-verified" : ""}`}>
              <ShieldCheck size={14} aria-hidden />
              {verified ? t.contactVerified : t.contactUnverified}
            </span>
          </dd>
        </div>
        <div>
          <dt>{t.reports}</dt>
          <dd>{formatCopy(t.profileReports, { count: reportCount })}</dd>
        </div>
      </dl>

      <section className="account-section">
        <h3 className="type-heading-sm">{t.verification}</h3>
        <p className="type-body-md">{t.verificationHelp}</p>
      </section>
    </OverlaySheet>
  );
}
