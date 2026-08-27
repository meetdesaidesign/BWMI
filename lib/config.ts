export const PRODUCT_NAME = "fixo";
export const LOCALE_STORAGE_KEY = "fixo.locale";
export const FILTER_STORAGE_KEY = "fixo.filters";
export const PROFILE_VERIFIED_STORAGE_KEY = "fixo.profile.verified";

/** GPS accuracy above this (metres) is presented as an approximate location. */
export const LOCATION_ACCURACY_LIMIT_M = 50;

/**
 * Shortest edge below this (pixels) is too small to read as civic evidence, so
 * the preview carries a concise note and a Change action — UX spec section 8.
 */
export const PHOTO_MIN_EDGE_PX = 320;
