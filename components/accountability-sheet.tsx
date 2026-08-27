"use client";

import { OverlaySheet } from "./overlay-sheet";
import { formatCopy, type getCopy } from "@/lib/i18n";
import { formatVerifiedDate, officerDisplayName } from "@/lib/authority";
import type { AreaContext, Authority, Locale } from "@/lib/types";

export function AccountabilitySheet({
  open,
  locale,
  t,
  area,
  authority,
  issueContext,
  onClose,
}: {
  open: boolean;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  area: AreaContext;
  authority: Authority;
  issueContext: boolean;
  onClose: () => void;
}) {
  const name = officerDisplayName(authority, locale);
  return (
    <OverlaySheet open={open} title={t.accountabilityTitle} onClose={onClose} closeLabel={t.close}>
      <p className="eyebrow">{issueContext ? t.issueOwner : t.areaAuthority}</p>
      <h3 className="type-heading-sm">{authority.organizationName[locale]}</h3>
      <dl className="account-dl">
        <div>
          <dt>{t.responsibility}</dt>
          <dd>{authority.departmentName[locale]}</dd>
        </div>
        <div>
          <dt>{t.assigned}</dt>
          <dd>
            {authority.routingPending ? t.routingInProgress : authority.roleName[locale]}
            {name ? ` · ${name}` : null}
            {!name && authority.officerName && !authority.officerCurrent ? ` · ${t.roleUpdatePending}` : null}
          </dd>
        </div>
        <div>
          <dt>{t.officialContact}</dt>
          <dd>{authority.officialContact}</dd>
        </div>
        {authority.supportingAuthority ? (
          <div>
            <dt>{t.supportingAuthority}</dt>
            <dd>{authority.supportingAuthority[locale]}</dd>
          </div>
        ) : null}
        <div>
          <dt>{t.sourceLabel}</dt>
          <dd>
            <a href={authority.sourceUrl} target="_blank" rel="noreferrer">{authority.sourceName}</a>
            <span className="type-caption">{formatCopy(t.lastVerified, { date: formatVerifiedDate(authority.verifiedAt, locale) })}</span>
          </dd>
        </div>
      </dl>

      <section className="account-section">
        <h3 className="type-heading-sm">{t.escalationPath}</h3>
        <p className="type-body-md">{area.escalationRole[locale]}</p>
        <p className="type-caption">{area.escalationOffice[locale]} · {authority.officialContact}</p>
      </section>

      <section className="account-section">
        <h3 className="type-heading-sm">{t.yourRepresentatives}</h3>
        <p className="type-caption">{t.representativesHelp}</p>
        <ul className="rep-list">
          {area.representatives.map((rep) => (
            <li key={rep.role}>
              <strong>{rep.title[locale]}</strong>
              <span>{rep.vacant || !rep.name ? t.positionVacant : rep.name[locale]}</span>
            </li>
          ))}
        </ul>
      </section>
    </OverlaySheet>
  );
}

export function AreaSheet({
  open,
  locale,
  t,
  area,
  onClose,
}: {
  open: boolean;
  locale: Locale;
  t: ReturnType<typeof getCopy>;
  area: AreaContext;
  onClose: () => void;
}) {
  return (
    <OverlaySheet open={open} title={t.areaDetails} onClose={onClose} closeLabel={t.close}>
      <dl className="account-dl">
        <div>
          <dt>{t.city}</dt>
          <dd>{area.city[locale]}</dd>
        </div>
        <div>
          <dt>{t.corporation}</dt>
          <dd>{area.corporation[locale]}</dd>
        </div>
        <div>
          <dt>{t.wardLabel}</dt>
          <dd>{area.ward[locale]} · {area.areaName[locale]}</dd>
        </div>
        <div>
          <dt>{t.boundarySource}</dt>
          <dd>{area.boundarySource[locale]}</dd>
        </div>
      </dl>
    </OverlaySheet>
  );
}
