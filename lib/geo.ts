/** Jayanagar 4th Block, Bengaluru — compact enough for ward-level zoom. */
export const WARD_CENTER: [number, number] = [12.9254, 77.5838];

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
