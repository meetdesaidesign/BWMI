export type Locale = "en" | "hi" | "kn";
export type Category = "Roads" | "Waste" | "Water" | "Lighting" | "Drainage" | "Traffic" | "Parks" | "Other";
export type Severity = "low" | "medium" | "high";
export type IssueStatus = "reported" | "acknowledged" | "in_progress" | "awaiting_confirmation" | "confirmed" | "contested";

export type PublicStatus = "reported" | "verified" | "assigned" | "in_progress" | "resolved" | "reopened";
export type StatusGroup = "open" | "in_progress" | "resolved";
export type LocationScope = "visible_map" | "ward" | "near_me";
export type DistanceKm = 1 | 2 | 5;
export type DateFilter = "any" | "today" | "7d" | "30d";
export type TrustFilter = "gov" | "community";
export type SortKey = "nearest" | "recent" | "confirmed" | "unresolved";
export type MapViewMode = "map" | "list";

export type LText = { en: string; hi: string; kn: string };

export interface StatusEvent {
  status: IssueStatus;
  labelEn: string;
  labelHi: string;
  labelKn: string;
  date: string;
  noteEn?: string;
  noteHi?: string;
  noteKn?: string;
}

export interface Issue {
  id: string;
  category: Category;
  titleEn: string;
  titleHi: string;
  titleKn: string;
  descriptionEn: string;
  descriptionHi: string;
  descriptionKn: string;
  address: string;
  lat: number;
  lng: number;
  image: string;
  supporters: number;
  aliases: string[];
  status: IssueStatus;
  severity: Severity;
  reportedAgoEn: string;
  reportedAgoHi: string;
  reportedAgoKn: string;
  reportedAt: string;
  updatedAt: string;
  departmentEn: string;
  departmentHi: string;
  departmentKn: string;
  roleEn: string;
  roleHi: string;
  roleKn: string;
  escalationEn: string;
  escalationHi: string;
  escalationKn: string;
  expectedEn: string;
  expectedHi: string;
  expectedKn: string;
  overdueDays?: number;
  mine?: boolean;
  mergedCount?: number;
  routingPending?: boolean;
  assetOwnerId?: string;
  trust: TrustFilter[];
  timeline: StatusEvent[];
}

export interface Authority {
  id: string;
  organizationName: LText;
  departmentName: LText;
  roleName: LText;
  officerName: LText | null;
  officerVerified: boolean;
  officerCurrent: boolean;
  wardOffice: LText;
  officialContact: string;
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
  routingPending?: boolean;
  supportingAuthority?: LText;
}

export interface Representative {
  role: "councillor" | "mla";
  title: LText;
  name: LText | null;
  vacant?: boolean;
}

export interface AreaContext {
  city: LText;
  corporation: LText;
  ward: LText;
  areaName: LText;
  boundarySource: LText;
  authority: Authority;
  representatives: Representative[];
  escalationRole: LText;
  escalationOffice: LText;
}

export interface FilterState {
  categories: Category[];
  statusGroups: StatusGroup[];
  locationScope: LocationScope;
  distanceKm: DistanceKm;
  reported: DateFilter;
  trust: TrustFilter[];
  sort: SortKey;
}

export interface AIExtraction {
  category: Category;
  title_en: string;
  title_hi: string;
  title_kn?: string;
  description_en: string;
  description_hi: string;
  description_kn?: string;
  severity: Severity;
  confidence: number;
  needs_user_review: boolean;
  duplicate_id?: string | null;
}
