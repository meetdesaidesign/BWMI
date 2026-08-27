"use client";

import { Building2, ChevronRight } from "lucide-react";
import { formatCopy, type getCopy } from "@/lib/i18n";
import { formatVerifiedDate, officerDisplayName } from "@/lib/authority";
import type { Authority, Locale } from "@/lib/types";

export function AuthorityCard({
  locale,
  t,
  authority,
  issueContext,
  updatedLabel,
  onOpen,
}: {
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  authority: Authority;
  issueContext: boolean;
  updatedLabel?: string;
  onOpen: () => void;
}) {
  const name = officerDisplayName(authority, locale);
  const stale = Boolean(authority.officerName && (!authority.officerVerified || !authority.officerCurrent));
  const identity = authority.routingPending
    ? t.routingInProgress
    : stale
      ? `${authority.roleName[locale]} · ${t.roleUpdatePending}`
      : name
        ? `${authority.roleName[locale]} · ${name}`
        : authority.roleName[locale];

  return (
    <button type="button" className="authority-card" onClick={onOpen} aria-label={t.viewAccountability}>
      <span className="authority-avatar" aria-hidden>
        <Building2 size={18} />
      </span>
      <span className="authority-copy">
        <span className="authority-eyebrow">{issueContext ? t.issueOwner : t.areaAuthority}</span>
        <strong className="authority-primary">{issueContext ? authority.departmentName[locale] : authority.organizationName[locale]}</strong>
        <span className="authority-secondary">{issueContext ? `${authority.organizationName[locale]} · ${identity}` : `${authority.wardOffice[locale]} · ${identity}`}</span>
        {updatedLabel ? <span className="authority-meta">{updatedLabel}</span> : null}
        {stale ? <span className="authority-meta">{formatCopy(t.lastVerified, { date: formatVerifiedDate(authority.verifiedAt, locale) })}</span> : null}
      </span>
      <span className="authority-action" aria-hidden>
        <ChevronRight size={18} />
      </span>
    </button>
  );
}
