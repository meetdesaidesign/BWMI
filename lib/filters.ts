import { FILTER_STORAGE_KEY } from "./config";
import { distanceMeters, inMapBounds, isValidBounds, pointInPolygon, WARD_CENTER, WARD_POLYGON, type MapBounds } from "./geo";
import { toStatusGroup } from "./public-status";
import type { Category, DistanceKm, FilterState, Issue, LocationScope, StatusGroup } from "./types";

export interface FilterContext {
  bounds?: MapBounds | null;
  origin?: [number, number];
  userCoordinates?: [number, number] | null;
  wardAvailable?: boolean;
}

export const ALL_CATEGORIES: Category[] = ["Roads", "Waste", "Water", "Drainage", "Lighting", "Traffic", "Parks", "Other"];
export const ALL_STATUS_GROUPS: StatusGroup[] = ["open", "in_progress", "resolved"];
export const DISTANCE_KM_OPTIONS: DistanceKm[] = [1, 2, 5];
export const LOCATION_SCOPES: LocationScope[] = ["visible_map", "ward", "near_me"];

export const defaultFilters: FilterState = {
  categories: [],
  statusGroups: ["open"],
  locationScope: "visible_map",
  distanceKm: 2,
  reported: "any",
  trust: [],
  sort: "nearest",
};

const LEGACY_DISTANCE: Record<string, Pick<FilterState, "locationScope" | "distanceKm">> = {
  map: { locationScope: "visible_map", distanceKm: 2 },
  ward: { locationScope: "ward", distanceKm: 2 },
  "1km": { locationScope: "near_me", distanceKm: 1 },
  "2km": { locationScope: "near_me", distanceKm: 2 },
  "5km": { locationScope: "near_me", distanceKm: 5 },
};

export function locationReset(filters: FilterState): FilterState {
  return { ...filters, locationScope: "visible_map", distanceKm: 2 };
}

export function filtersAreDefault(filters: FilterState) {
  return (
    filters.categories.length === 0
    && filters.statusGroups.length === 1
    && filters.statusGroups[0] === "open"
    && filters.locationScope === "visible_map"
    && filters.distanceKm === 2
    && filters.reported === "any"
    && filters.trust.length === 0
    && filters.sort === "nearest"
  );
}

export function locationFiltersAreDefault(filters: FilterState) {
  return filters.locationScope === "visible_map" && filters.distanceKm === 2;
}

export function advancedFilterCount(filters: FilterState) {
  return (filters.reported !== "any" ? 1 : 0) + filters.trust.length + (filters.sort !== "nearest" ? 1 : 0);
}

function inDateRange(iso: string, reported: FilterState["reported"]) {
  if (reported === "any") return true;
  const then = new Date(iso).getTime();
  const now = Date.now();
  const day = 24 * 60 * 60 * 1000;
  if (reported === "today") return now - then < day;
  if (reported === "7d") return now - then < 7 * day;
  return now - then < 30 * day;
}

function inLocationScope(issue: Issue, filters: FilterState, context?: FilterContext) {
  if (filters.locationScope === "visible_map") {
    const bounds = context?.bounds;
    if (!isValidBounds(bounds)) return true;
    return inMapBounds(issue.lat, issue.lng, bounds);
  }
  if (filters.locationScope === "ward") {
    if (context?.wardAvailable === false) return false;
    return pointInPolygon(issue.lat, issue.lng, WARD_POLYGON);
  }
  const origin = context?.userCoordinates;
  if (!origin) return false;
  return distanceMeters(origin[0], origin[1], issue.lat, issue.lng) <= filters.distanceKm * 1000;
}

export function applyFilters(issues: Issue[], filters: FilterState, context?: FilterContext) {
  const origin = context?.userCoordinates ?? context?.origin ?? WARD_CENTER;
  const filtered = issues.filter((issue) => {
    if (filters.categories.length > 0 && !filters.categories.includes(issue.category)) return false;
    if (filters.statusGroups.length > 0 && !filters.statusGroups.includes(toStatusGroup(issue.status))) return false;
    if (!inDateRange(issue.reportedAt, filters.reported)) return false;
    if (!inLocationScope(issue, filters, context)) return false;
    if (filters.trust.length > 0 && !filters.trust.every((flag) => issue.trust.includes(flag))) return false;
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (filters.sort === "recent") return +new Date(b.reportedAt) - +new Date(a.reportedAt);
    if (filters.sort === "confirmed") return b.supporters - a.supporters;
    if (filters.sort === "unresolved") {
      const aDone = toStatusGroup(a.status) === "resolved" ? 1 : 0;
      const bDone = toStatusGroup(b.status) === "resolved" ? 1 : 0;
      if (aDone !== bDone) return aDone - bDone;
      return +new Date(a.reportedAt) - +new Date(b.reportedAt);
    }
    return distanceMeters(origin[0], origin[1], a.lat, a.lng) - distanceMeters(origin[0], origin[1], b.lat, b.lng);
  });

  return sorted;
}

export function previewCount(issues: Issue[], filters: FilterState, context?: FilterContext): number | null {
  if (filters.locationScope === "near_me" && !context?.userCoordinates) return null;
  if (filters.locationScope === "ward" && context?.wardAvailable === false) return null;
  try {
    return applyFilters(issues, filters, context).length;
  } catch {
    return null;
  }
}

function isDistanceKm(value: unknown): value is DistanceKm {
  return value === 1 || value === 2 || value === 5;
}

function isLocationScope(value: unknown): value is LocationScope {
  return value === "visible_map" || value === "ward" || value === "near_me";
}

export function normalizeFilters(parsed: Partial<FilterState> & { distance?: string }): FilterState {
  const merged = { ...defaultFilters, ...parsed };
  if (isLocationScope(parsed.locationScope)) {
    return {
      ...merged,
      locationScope: parsed.locationScope,
      distanceKm: isDistanceKm(parsed.distanceKm) ? parsed.distanceKm : 2,
    };
  }
  const legacy = parsed.distance ? LEGACY_DISTANCE[parsed.distance] : undefined;
  if (legacy) return { ...merged, ...legacy };
  return { ...merged, locationScope: "visible_map", distanceKm: isDistanceKm(parsed.distanceKm) ? parsed.distanceKm : 2 };
}

export function readStoredFilters(): FilterState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(FILTER_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<FilterState> & { distance?: string };
    if (!parsed || !Array.isArray(parsed.statusGroups)) return null;
    return normalizeFilters(parsed);
  } catch {
    return null;
  }
}

export function writeStoredFilters(filters: FilterState) {
  try {
    window.localStorage.setItem(FILTER_STORAGE_KEY, JSON.stringify(filters));
  } catch {
    /* ignore */
  }
}
