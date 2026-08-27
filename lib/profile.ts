import { PROFILE_VERIFIED_STORAGE_KEY } from "./config";

export const residentProfile = {
  displayName: "Riya M.",
  initials: "RM",
  phone: "98765 43210",
} as const;

export function readStoredPhoneVerified(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(PROFILE_VERIFIED_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
}

export function writeStoredPhoneVerified(verified: boolean) {
  try {
    window.localStorage.setItem(PROFILE_VERIFIED_STORAGE_KEY, verified ? "true" : "false");
  } catch {
    /* ignore quota / private mode */
  }
}
