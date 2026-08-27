import type { Issue, IssueStatus, PublicStatus, StatusGroup } from "./types";

export const PUBLIC_STATUS_COLOR: Record<PublicStatus, string> = {
  reported: "#64748B",
  verified: "#7E22CE",
  assigned: "#D97706",
  in_progress: "#1D4ED8",
  resolved: "#15803D",
  reopened: "#DC2626",
};

export function toPublicStatus(status: IssueStatus): PublicStatus {
  if (status === "reported") return "reported";
  if (status === "acknowledged") return "assigned";
  if (status === "in_progress") return "in_progress";
  if (status === "awaiting_confirmation" || status === "confirmed") return "resolved";
  return "reopened";
}

export function toStatusGroup(status: IssueStatus): StatusGroup {
  const publicStatus = toPublicStatus(status);
  if (publicStatus === "in_progress") return "in_progress";
  if (publicStatus === "resolved") return "resolved";
  return "open";
}

export function publicStatusOf(issue: Issue): PublicStatus {
  return toPublicStatus(issue.status);
}
