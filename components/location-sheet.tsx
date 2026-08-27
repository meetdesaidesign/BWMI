"use client";

import { ExternalLink, Phone } from "lucide-react";
import { OverlaySheet } from "./overlay-sheet";
import { formatCopy, type getCopy } from "@/lib/i18n";
import { formatVerifiedDate, officerDisplayName } from "@/lib/authority";
import type { AreaContext, Locale } from "@/lib/types";

function telHref(contact: string) {
  const digits = contact.replace(/[^+\d]/g, "");
  return digits ? `tel:${digits}` : null;
}

/**
 * Location detail — opened from the map location header. Authority lives here
 * rather than on the map so the top of the map stays a thin, glanceable strip.
 */
export function LocationSheet({
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
  const authority = area.authority;
  const officer = officerDisplayName(authority, locale);
  const assigned = authority.routingPending
    ? t.routingInProgress
    : officer
      ? `${authority.roleName[locale]} · ${officer}`
      : authority.roleName[locale];
  const tel = authority.officialContact ? telHref(authority.officialContact) : null;

  return (
    <OverlaySheet open={open} title={area.areaName[locale]} onClose={onClose} closeLabel={t.close}>
      <dl className="account-dl">
        <div>
          <dt>{t.responsibleAuthority}</dt>
          <dd>{authority.organizationName[locale]}</dd>
        </div>
        <div>
          <dt>{t.wardLabel}</dt>
          <dd>{area.ward[locale]} · {area.areaName[locale]}</dd>
        </div>
        <div>
          <dt>{t.officeLabel}</dt>
          <dd>{authority.departmentName[locale]}</dd>
        </div>
        <div>
          <dt>{t.assigned}</dt>
          <dd>{assigned}</dd>
        </div>
      </dl>

      {tel || authority.sourceUrl ? (
        <div className="location-actions">
          {tel ? (
            <a className="location-action" href={tel}>
              <Phone size={16} aria-hidden />{authority.officialContact}
            </a>
          ) : null}
          {authority.sourceUrl ? (
            <a className="location-action" href={authority.sourceUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden />{authority.sourceName}
            </a>
          ) : null}
        </div>
      ) : null}

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

      <p className="sheet-footnote type-caption">
        {area.boundarySource[locale]} · {formatCopy(t.lastVerified, { date: formatVerifiedDate(authority.verifiedAt, locale) })}
      </p>
    </OverlaySheet>
  );
}
