export const PRODUCT_NAME = "fixo";
export const LOCALE_STORAGE_KEY = "fixo.locale";
export const FILTER_STORAGE_KEY = "fixo.filters";
export const PROFILE_VERIFIED_STORAGE_KEY = "fixo.profile.verified";

/**
 * Demo-only affordances (sample report shortcut). Off unless a build opts in,
 * so the shortcut never reaches production — UX spec section 4.5.
 */
export const DEMO_SAMPLE_ENABLED = process.env.NEXT_PUBLIC_DEMO_SAMPLE === "true";

/** GPS accuracy above this (metres) is presented as an approximate location. */
export const LOCATION_ACCURACY_LIMIT_M = 50;
