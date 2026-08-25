export type Locale = "en" | "hi";
export type Category = "Roads" | "Waste" | "Water" | "Lighting" | "Drainage";
export type Severity = "low" | "medium" | "high";
export type IssueStatus = "reported" | "acknowledged" | "in_progress" | "awaiting_confirmation" | "confirmed" | "contested";

export interface StatusEvent {
  status: IssueStatus;
  labelEn: string;
  labelHi: string;
  date: string;
  noteEn?: string;
  noteHi?: string;
}

export interface Issue {
  id: string;
  category: Category;
  titleEn: string;
  titleHi: string;
  descriptionEn: string;
  descriptionHi: string;
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
  departmentEn: string;
  departmentHi: string;
  roleEn: string;
  roleHi: string;
  escalationEn: string;
  escalationHi: string;
  expectedEn: string;
  expectedHi: string;
  overdueDays?: number;
  mine?: boolean;
  timeline: StatusEvent[];
}

export interface AIExtraction {
  category: Category;
  title_en: string;
  title_hi: string;
  description_en: string;
  description_hi: string;
  severity: Severity;
  confidence: number;
  needs_user_review: boolean;
  duplicate_id?: string | null;
}
