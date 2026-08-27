import type { LText, Locale } from "./types";

/** Jayanagar 4th Block, Bengaluru — compact enough for ward-level zoom. */
export const WARD_CENTER: [number, number] = [12.9254, 77.5838];

function L(en: string, hi: string, kn: string): LText {
  return { en, hi, kn };
}

/**
 * Named streets and landmarks inside the demo ward. GPS and the map pin
 * resolve to the nearest of these so the report names a road, not only the area.
 */
const WARD_PLACES: { lat: number; lng: number; name: LText }[] = [
  { lat: 12.9254, lng: 77.5838, name: L("36th Cross, 4th Block", "36वीं क्रॉस, चौथा ब्लॉक", "36ನೇ ಕ್ರಾಸ್, 4ನೇ ಬ್ಲಾಕ್") },
  { lat: 12.9271, lng: 77.5811, name: L("4th Block Complex", "चौथा ब्लॉक कॉम्प्लेक्स", "4ನೇ ಬ್ಲಾಕ್ ಕಾಂಪ್ಲೆಕ್ಸ್") },
  { lat: 12.9232, lng: 77.5857, name: L("9th Main, 4th T Block", "9वीं मेन, चौथा टी ब्लॉक", "9ನೇ ಮೇನ್, 4ನೇ ಟಿ ಬ್ಲಾಕ್") },
  { lat: 12.9283, lng: 77.5863, name: L("Madhavan Park", "माधवन पार्क", "ಮಾಧವನ್ ಪಾರ್ಕ್") },
  { lat: 12.9255, lng: 77.5802, name: L("Jayanagar Metro Gate 2", "जयनगर मेट्रो गेट 2", "ಜಯನಗರ ಮೆಟ್ರೋ ಗೇಟ್ 2") },
  { lat: 12.9211, lng: 77.5818, name: L("32nd Cross", "32वीं क्रॉस", "32ನೇ ಕ್ರಾಸ್") },
  { lat: 12.9278, lng: 77.5836, name: L("38th Cross", "38वीं क्रॉस", "38ನೇ ಕ್ರಾಸ್") },
  { lat: 12.9250, lng: 77.5868, name: L("11th Main", "11वीं मेन", "11ನೇ ಮೇನ್") },
  { lat: 12.9234, lng: 77.5832, name: L("34th Cross", "34वीं क्रॉस", "34ನೇ ಕ್ರಾಸ್") },
  { lat: 12.9304, lng: 77.5842, name: L("South End Circle", "साउथ एंड सर्कल", "ಸೌತ್ ಎಂಡ್ ಸರ್ಕಲ್") },
  { lat: 12.9196, lng: 77.5805, name: L("27th Cross", "27वीं क्रॉस", "27ನೇ ಕ್ರಾಸ್") },
  { lat: 12.9260, lng: 77.5785, name: L("4th Main", "चौथी मेन", "4ನೇ ಮೇನ್") },
];

const PLACE_MATCH_M = 450;

/** Nearest named street or landmark, or the area name if nothing is close. */
export function namedPlace(lat: number, lng: number, locale: Locale, fallback: string) {
  let nearest = WARD_PLACES[0];
  let nearestM = Infinity;
  for (const place of WARD_PLACES) {
    const meters = distanceMeters(lat, lng, place.lat, place.lng);
    if (meters < nearestM) {
      nearest = place;
      nearestM = meters;
    }
  }
  return nearestM <= PLACE_MATCH_M ? nearest.name[locale] : fallback;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface MapViewport {
  bounds: MapBounds;
  center: [number, number];
}

export function inMapBounds(lat: number, lng: number, bounds: MapBounds, pad = 0.08) {
  const latPad = (bounds.north - bounds.south) * pad;
  const lngPad = (bounds.east - bounds.west) * pad;
  return lat <= bounds.north + latPad && lat >= bounds.south - latPad && lng <= bounds.east + lngPad && lng >= bounds.west - lngPad;
}

export function isValidBounds(bounds?: MapBounds | null): bounds is MapBounds {
  if (!bounds) return false;
  const latSpan = bounds.north - bounds.south;
  const lngSpan = bounds.east - bounds.west;
  return Number.isFinite(latSpan) && Number.isFinite(lngSpan) && latSpan > 0.0005 && lngSpan > 0.0005;
}

/** Ray-cast test. Polygon vertices are [lat, lng]. */
export function pointInPolygon(lat: number, lng: number, polygon: [number, number][]) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [latI, lngI] = polygon[i];
    const [latJ, lngJ] = polygon[j];
    const crosses = (latI > lat) !== (latJ > lat);
    if (!crosses) continue;
    const atLng = ((lngJ - lngI) * (lat - latI)) / (latJ - latI || Number.EPSILON) + lngI;
    if (lng < atLng) inside = !inside;
  }
  return inside;
}

const EARTH_M = 6371000;

export function distanceMeters(lat1: number, lng1: number, lat2: number, lng2: number) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_M * Math.asin(Math.min(1, Math.sqrt(a)));
}

export function distanceFromWard(lat: number, lng: number) {
  return distanceMeters(WARD_CENTER[0], WARD_CENTER[1], lat, lng);
}

/** Keep a live pin inside the demo ward when GPS is elsewhere. */
const WARD_LOCATE_M = 2500;

export function locateInWard(lat: number, lng: number): [number, number] {
  return distanceFromWard(lat, lng) <= WARD_LOCATE_M ? [lat, lng] : WARD_CENTER;
}

export function formatDistance(meters: number, locale: string) {
  if (meters < 950) {
    const rounded = Math.max(10, Math.round(meters / 10) * 10);
    return `${rounded.toLocaleString(locale)} m`;
  }
  const km = meters / 1000;
  const value = km >= 10 ? Math.round(km) : Math.round(km * 10) / 10;
  return `${value.toLocaleString(locale)} km`;
}

/** Approximate Jayanagar 4th Block / Ward 14 outline for the demo map. */
export const WARD_POLYGON: [number, number][] = [
  [12.9312, 77.5780],
  [12.9316, 77.5888],
  [12.9268, 77.5906],
  [12.9204, 77.5894],
  [12.9188, 77.5824],
  [12.9206, 77.5768],
  [12.9262, 77.5758],
];
