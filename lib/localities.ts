import { areaContext } from "./authority";
import { distanceMeters, pointInPolygon, WARD_POLYGON } from "./geo";
import type { AreaContext, LText } from "./types";

function L(en: string, hi: string, kn: string): LText {
  return { en, hi, kn };
}

const SOUTH = L("Bengaluru South City Corporation", "बेंगलुरु दक्षिण शहर निगम", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ನಗರ ನಿಗಮ");
const EAST = L("Bengaluru East City Corporation", "बेंगलुरु पूर्व शहर निगम", "ಬೆಂಗಳೂರು ಪೂರ್ವ ನಗರ ನಿಗಮ");
const CENTRAL = L("Bengaluru Central City Corporation", "बेंगलुरु मध्य शहर निगम", "ಬೆಂಗಳೂರು ಮಧ್ಯ ನಗರ ನಿಗಮ");
const WEST = L("Bengaluru West City Corporation", "बेंगलुरु पश्चिम शहर निगम", "ಬೆಂಗಳೂರು ಪಶ್ಚಿಮ ನಗರ ನಿಗಮ");
const NORTH = L("Bengaluru North City Corporation", "बेंगलुरु उत्तर शहर निगम", "ಬೆಂಗಳೂರು ಉತ್ತರ ನಗರ ನಿಗಮ");

const SOUTH_ZONE = L("Bengaluru South Zone", "बेंगलुरु दक्षिण क्षेत्र", "ಬೆಂಗಳೂರು ದಕ್ಷಿಣ ವಲಯ");
const EAST_ZONE = L("Bengaluru East Zone", "बेंगलुरु पूर्व क्षेत्र", "ಬೆಂಗಳೂರು ಪೂರ್ವ ವಲಯ");
const CENTRAL_ZONE = L("Bengaluru Central Zone", "बेंगलुरु मध्य क्षेत्र", "ಬೆಂಗಳೂರು ಮಧ್ಯ ವಲಯ");
const WEST_ZONE = L("Bengaluru West Zone", "बेंगलुरु पश्चिम क्षेत्र", "ಬೆಂಗಳೂರು ಪಶ್ಚಿಮ ವಲಯ");
const NORTH_ZONE = L("Bengaluru North Zone", "बेंगलुरु उत्तर क्षेत्र", "ಬೆಂಗಳೂರು ಉತ್ತರ ವಲಯ");

export interface Locality {
  id: string;
  lat: number;
  lng: number;
  /** Inclusive match radius. Neighbouring areas overlap; nearest centre wins. */
  radiusM: number;
  name: LText;
  corporation: LText;
  ward: LText;
  zone: LText;
}

/**
 * Neighbourhood gazetteer for the demo map. A live product would reverse-geocode
 * the viewport centre; these named areas are what that lookup would return here.
 */
const LOCALITIES: Locality[] = [
  { id: "jayanagar", lat: 12.9254, lng: 77.5838, radiusM: 1100, name: L("Jayanagar", "जयनगर", "ಜಯನಗರ"), corporation: SOUTH, ward: L("Ward 14", "वार्ड 14", "ವಾರ್ಡ್ 14"), zone: SOUTH_ZONE },
  { id: "btm", lat: 12.9165, lng: 77.6102, radiusM: 1300, name: L("BTM Layout", "बीटीएम लेआउट", "ಬಿಟಿಎಂ ಲೇಔಟ್"), corporation: SOUTH, ward: L("BTM Layout ward", "बीटीएम लेआउट वार्ड", "ಬಿಟಿಎಂ ಲೇಔಟ್ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "koramangala", lat: 12.9350, lng: 77.6228, radiusM: 1400, name: L("Koramangala", "कोरमंगला", "ಕೋರಮಂಗಲ"), corporation: SOUTH, ward: L("Koramangala ward", "कोरमंगला वार्ड", "ಕೋರಮಂಗಲ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "madiwala", lat: 12.9214, lng: 77.6176, radiusM: 650, name: L("Madiwala", "मदिवाला", "ಮದಿವಾಲ"), corporation: SOUTH, ward: L("Madiwala ward", "मदिवाला वार्ड", "ಮದಿವಾಲ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "jp-nagar", lat: 12.9078, lng: 77.5926, radiusM: 1000, name: L("JP Nagar", "जेपी नगर", "ಜೆಪಿ ನಗರ"), corporation: SOUTH, ward: L("JP Nagar ward", "जेपी नगर वार्ड", "ಜೆಪಿ ನಗರ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "banashankari", lat: 12.9256, lng: 77.5508, radiusM: 1100, name: L("Banashankari", "बनशंकरी", "ಬನಶಂಕರಿ"), corporation: SOUTH, ward: L("Banashankari ward", "बनशंकरी वार्ड", "ಬನಶಂಕರಿ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "adugodi", lat: 12.9426, lng: 77.6088, radiusM: 750, name: L("Adugodi", "अडुगोडी", "ಅಡುಗೋಡಿ"), corporation: SOUTH, ward: L("Adugodi ward", "अडुगोडी वार्ड", "ಅಡುಗೋಡಿ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "ejipura", lat: 12.9434, lng: 77.6282, radiusM: 650, name: L("Ejipura", "एजीपुरा", "ಎಜಿಪುರ"), corporation: SOUTH, ward: L("Ejipura ward", "एजीपुरा वार्ड", "ಎಜಿಪುರ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "wilson-garden", lat: 12.9484, lng: 77.5972, radiusM: 750, name: L("Wilson Garden", "विल्सन गार्डन", "ವಿಲ್ಸನ್ ಗಾರ್ಡನ್"), corporation: SOUTH, ward: L("Wilson Garden ward", "विल्सन गार्डन वार्ड", "ವಿಲ್ಸನ್ ಗಾರ್ಡನ್ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "lalbagh", lat: 12.9507, lng: 77.5848, radiusM: 850, name: L("Lalbagh", "लालबाग", "ಲಾಲ್‌ಬಾಗ್"), corporation: SOUTH, ward: L("Lalbagh ward", "लालबाग वार्ड", "ಲಾಲ್‌ಬಾಗ್ ವಾರ್ಡ್"), zone: SOUTH_ZONE },
  { id: "hsr", lat: 12.9126, lng: 77.6384, radiusM: 1400, name: L("HSR Layout", "एचएसआर लेआउट", "ಎಚ್‌ಎಸ್‌ಆರ್ ಲೇಔಟ್"), corporation: EAST, ward: L("HSR Layout ward", "एचएसआर लेआउट वार्ड", "ಎಚ್‌ಎಸ್‌ಆರ್ ಲೇಔಟ್ ವಾರ್ಡ್"), zone: EAST_ZONE },
  { id: "indiranagar", lat: 12.9780, lng: 77.6408, radiusM: 1300, name: L("Indiranagar", "इंदिरानगर", "ಇಂದಿರಾನಗರ"), corporation: EAST, ward: L("Indiranagar ward", "इंदिरानगर वार्ड", "ಇಂದಿರಾನಗರ ವಾರ್ಡ್"), zone: EAST_ZONE },
  { id: "domlur", lat: 12.9608, lng: 77.6386, radiusM: 900, name: L("Domlur", "डोमलुर", "ಡೊಮ್ಲೂರು"), corporation: EAST, ward: L("Domlur ward", "डोमलुर वार्ड", "ಡೊಮ್ಲೂರು ವಾರ್ಡ್"), zone: EAST_ZONE },
  { id: "richmond-town", lat: 12.9664, lng: 77.6102, radiusM: 900, name: L("Richmond Town", "रिचमंड टाउन", "ರಿಚ್‌ಮಂಡ್ ಟೌನ್"), corporation: CENTRAL, ward: L("Richmond Town ward", "रिचमंड टाउन वार्ड", "ರಿಚ್‌ಮಂಡ್ ಟೌನ್ ವಾರ್ಡ್"), zone: CENTRAL_ZONE },
  { id: "malleshwaram", lat: 13.0055, lng: 77.5693, radiusM: 1400, name: L("Malleshwaram", "मल्लेश्वरम", "ಮಲ್ಲೇಶ್ವರಂ"), corporation: WEST, ward: L("Malleshwaram ward", "मल्लेश्वरम वार्ड", "ಮಲ್ಲೇಶ್ವರಂ ವಾರ್ಡ್"), zone: WEST_ZONE },
  { id: "hebbal", lat: 13.0358, lng: 77.5970, radiusM: 1400, name: L("Hebbal", "हेब्बाल", "ಹೆಬ್ಬಾಳ"), corporation: NORTH, ward: L("Hebbal ward", "हेब्बाल वार्ड", "ಹೆಬ್ಬಾಳ ವಾರ್ಡ್"), zone: NORTH_ZONE },
];

const CITY: Locality = {
  id: "bengaluru",
  lat: 12.9716,
  lng: 77.5946,
  radiusM: 25_000,
  name: L("Bengaluru", "बेंगलुरु", "ಬೆಂಗಳೂರು"),
  corporation: L("Greater Bengaluru Authority", "ग्रेटर बेंगलुरु प्राधिकरण", "ಗ್ರೇಟರ್ ಬೆಂಗಳೂರು ಪ್ರಾಧಿಕಾರ"),
  ward: L("Bengaluru", "बेंगलुरु", "ಬೆಂಗಳೂರು"),
  zone: L("Greater Bengaluru Authority", "ग्रेटर बेंगलुरु प्राधिकरण", "ಗ್ರೇಟರ್ ಬೆಂಗಳೂರು ಪ್ರಾಧಿಕಾರ"),
};

export const DEFAULT_LOCALITY_ID = "jayanagar";

/** Stay in the current locality until the centre has clearly left it. */
const HYSTERESIS_M = 90;

function contains(place: Locality, lat: number, lng: number, extraM = 0) {
  if (place.id === "jayanagar" && extraM === 0 && pointInPolygon(lat, lng, WARD_POLYGON)) return true;
  return distanceMeters(lat, lng, place.lat, place.lng) <= place.radiusM + extraM;
}

function byId(id: string) {
  return LOCALITIES.find((place) => place.id === id) ?? (id === CITY.id ? CITY : undefined);
}

/**
 * Reverse-geocode a map centre to a named locality and its civic body.
 * Small moves stay on the current name; a new neighbourhood or corporation
 * only appears once the centre has entered it.
 */
export function reverseGeocode(lat: number, lng: number, currentId = DEFAULT_LOCALITY_ID): Locality {
  const current = byId(currentId);
  if (current && current.id !== CITY.id && contains(current, lat, lng, HYSTERESIS_M)) {
    return current;
  }

  let nearest: Locality | null = null;
  let nearestM = Infinity;
  for (const place of LOCALITIES) {
    const meters = distanceMeters(lat, lng, place.lat, place.lng);
    if (meters <= place.radiusM && meters < nearestM) {
      nearest = place;
      nearestM = meters;
    }
  }
  if (nearest) return nearest;

  for (const place of LOCALITIES) {
    const meters = distanceMeters(lat, lng, place.lat, place.lng);
    if (meters < nearestM) {
      nearest = place;
      nearestM = meters;
    }
  }
  if (nearest && nearestM <= 1800) return nearest;
  return CITY;
}

export function areaContextFor(locality: Locality): AreaContext {
  if (locality.id === DEFAULT_LOCALITY_ID) return areaContext;

  const wardOffice = L(
    `${locality.ward.en} · ${locality.name.en}`,
    `${locality.ward.hi} · ${locality.name.hi}`,
    `${locality.ward.kn} · ${locality.name.kn}`,
  );

  return {
    ...areaContext,
    corporation: locality.corporation,
    ward: locality.ward,
    areaName: locality.name,
    authority: {
      ...areaContext.authority,
      id: `auth-${locality.id}`,
      departmentName: wardOffice,
      officerName: null,
      officerHandle: undefined,
      officerVerified: false,
      officerCurrent: false,
      wardOffice,
    },
    representatives: areaContext.representatives.map((rep) => ({
      ...rep,
      name: null,
      handle: undefined,
      vacant: true,
    })),
    escalationOffice: locality.zone,
  };
}
