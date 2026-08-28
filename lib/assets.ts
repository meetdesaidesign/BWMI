export const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export function assetPath(path: string) {
  if (/^(?:data:|blob:|https?:\/\/)/i.test(path)) return path;

  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  if (!basePath || normalizedPath === basePath || normalizedPath.startsWith(`${basePath}/`)) {
    return normalizedPath;
  }

  return `${basePath}${normalizedPath}`;
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
