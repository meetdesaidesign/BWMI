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
  const tel = authority.officialContact ? telHref(authority.officialContact) : null;
  const verified = formatCopy(t.lastVerified, { date: formatVerifiedDate(authority.verifiedAt, locale) });

  return (
    <OverlaySheet
      open={open}
      title={area.areaName[locale]}
      subtitle={area.ward[locale]}
      onClose={onClose}
      closeLabel={t.close}
      className="is-area-profile"
      showHandle
      closeAppearance="plain"
      footerClassName="is-quiet"
      footer={
        <p className="area-source">
          {verified}
          {authority.sourceUrl ? (
            <>
              {" · "}
              <a href={authority.sourceUrl} target="_blank" rel="noreferrer">
                {t.wardDataSource}
                <ExternalLink size={11} strokeWidth={2.25} aria-hidden />
              </a>
            </>
          ) : null}
        </p>
      }
    >
      <article className="area-authority-card">
        <div className="area-authority-who">
          <p className="area-kicker">{t.responsibleAuthority}</p>
          <p className="area-authority-org">{authority.organizationName[locale]}</p>
          <p className="area-authority-office">{authority.departmentName[locale]}</p>
        </div>
        <div className="area-officer">
          <p className="area-officer-name">
            {authority.routingPending ? t.routingInProgress : officer ?? t.officerPending}
          </p>
          {authority.routingPending ? null : (
            <p className="area-officer-role">{authority.roleName[locale]}</p>
          )}
        </div>
        {tel || authority.sourceUrl ? (
          <div className="area-authority-actions">
            {tel ? (
              <a className="area-action" href={tel} aria-label={`${t.callOffice}, ${authority.officialContact}`}>
                <Phone size={16} strokeWidth={2.25} aria-hidden />
                {t.callOffice}
              </a>
            ) : null}
            {authority.sourceUrl ? (
              <a className="area-action" href={authority.sourceUrl} target="_blank" rel="noreferrer">
                <ExternalLink size={16} strokeWidth={2.25} aria-hidden />
                {t.viewAuthority}
              </a>
            ) : null}
          </div>
        ) : null}
      </article>

      <section className="area-escalate" aria-labelledby="area-escalate-heading">
        <h3 id="area-escalate-heading" className="area-escalate-title">{t.ifUnresolved}</h3>
        <p className="area-escalate-role">{area.escalationRole[locale]}</p>
        <p className="area-escalate-office">{area.escalationOffice[locale]}</p>
        {tel ? (
          <a className="area-escalate-call" href={tel}>
            <Phone size={16} strokeWidth={2.25} aria-hidden />
            {formatCopy(t.callNumber, { number: authority.officialContact })}
          </a>
        ) : null}
      </section>

      <section className="area-reps" aria-labelledby="area-reps-heading">
        <h3 id="area-reps-heading" className="area-kicker">{t.yourRepresentatives}</h3>
        <ul className="area-rep-list">
          {area.representatives.map((rep) => (
            <li key={rep.role}>
              <span className="area-rep-role">{rep.title[locale]}</span>
              <span className="area-rep-name">{rep.vacant || !rep.name ? t.positionVacant : rep.name[locale]}</span>
            </li>
          ))}
        </ul>
        <p className="area-reps-note">{t.representativesHelp}</p>
      </section>
    </OverlaySheet>
  );
}
