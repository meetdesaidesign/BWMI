import { areaContext, resolveIssueAuthority } from "./authority";
import { formatCopy, localizedField } from "./i18n";
import type { Authority, Issue, Locale, Representative } from "./types";

export const POST_LIMIT = 280;

const INTENT_URL = "https://x.com/intent/post";

/**
 * Handles the escalation post should tag, most accountable first. The named
 * officer leads, the department follows, elected representatives close — that is
 * the order a resident would escalate in if they were doing it by hand.
 */
export function escalationHandles(authority: Authority, representatives: Representative[] = []): string[] {
  const ordered = [
    authority.officerHandle,
    authority.orgHandle,
    ...representatives.map((rep) => (rep.vacant ? undefined : rep.handle)),
  ];
  return Array.from(new Set(ordered.filter((handle): handle is string => Boolean(handle))));
}

/**
 * Build the post text from a localized template. The tag list is the first thing
 * trimmed when the draft runs long, so the problem and the reference number —
 * the parts that make the post actionable — always survive.
 */
export function composeEscalationPost({
  template,
  hashtags,
  title,
  area,
  id,
  handles,
}: {
  template: string;
  hashtags: string;
  title: string;
  area: string;
  id: string;
  handles: string[];
}): string {
  const render = (tags: string[]) =>
    formatCopy(template, { title, area, id, handles: tags.join(" "), hashtags }).replace(/\s+/g, " ").trim();

  let tags = [...handles];
  let text = render(tags);
  while (text.length > POST_LIMIT && tags.length > 1) {
    tags = tags.slice(0, -1);
    text = render(tags);
  }
  if (text.length <= POST_LIMIT) return text;

  /* Still long: shorten the title rather than ship a draft X will reject. */
  const overflow = text.length - POST_LIMIT;
  const trimmedTitle = `${title.slice(0, Math.max(12, title.length - overflow - 1)).trimEnd()}…`;
  return formatCopy(template, { title: trimmedTitle, area, id, handles: tags.join(" "), hashtags })
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, POST_LIMIT);
}

export function postIntentUrl(text: string) {
  return `${INTENT_URL}?text=${encodeURIComponent(text)}`;
}

/** Ready-to-edit public post for a report, used by share and overdue escalation. */
export function composeIssuePost(issue: Issue, locale: Locale, template: string, hashtags: string) {
  const authority = resolveIssueAuthority(issue);
  return composeEscalationPost({
    template,
    hashtags,
    title: localizedField(issue as unknown as Record<string, unknown>, locale, "title"),
    area: `${areaContext.areaName[locale]} · ${areaContext.ward[locale]}`,
    id: issue.id,
    handles: escalationHandles(authority, areaContext.representatives),
  });
}

export function isResponseOverdue(issue: Issue) {
  if ((issue.overdueDays ?? 0) <= 0) return false;
  return issue.status !== "confirmed" && issue.status !== "awaiting_confirmation";
}
