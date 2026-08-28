export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string) {
  // Issue data is normalized when the seed is created, but some consumers also
  // call assetPath before rendering. Keep that safe on sub-path deployments so
  // an already-prefixed URL does not become `/BWMI/BWMI/...`.
  if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(path)) return path;

  const normalizedBase = basePath.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  if (
    !normalizedBase
    || normalizedPath === normalizedBase
    || normalizedPath.startsWith(`${normalizedBase}/`)
  ) {
    return normalizedPath;
  }

  return `${normalizedBase}${normalizedPath}`;
}

export const brand = {
  markPurple: "/brand/fixo-mark-purple.svg",
  markBlack: "/brand/fixo-mark-black.svg",
  markWhite: "/brand/fixo-mark-white.svg",
  logoHorizontal: "/brand/fixo-logo-horizontal.svg",
  logoHorizontalPng: "/brand/fixo-logo-horizontal.png",
  appIcon: "/brand/fixo-app-icon.svg",
  faviconLight: "/brand/favicon-light.svg",
  faviconDark: "/brand/favicon-dark.svg",
  icon192: "/brand/icon-192.png",
  icon512: "/brand/icon-512.png",
} as const;
