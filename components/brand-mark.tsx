/* eslint-disable @next/next/no-img-element -- static SVG brand assets; next/image is not used for SVG in the static export */

import { assetPath, brand } from "@/lib/assets";

const marks = {
  purple: brand.markPurple,
  black: brand.markBlack,
  white: brand.markWhite,
  app: brand.appIcon,
} as const;

export function BrandMark({
  variant = "purple",
  size = 28,
  alt = "",
  className,
}: {
  variant?: keyof typeof marks;
  size?: number;
  alt?: string;
  className?: string;
}) {
  return (
    <img
      src={assetPath(marks[variant])}
      alt={alt}
      width={size}
      height={size}
      className={className}
      draggable={false}
    />
  );
}

export function BrandLockup({
  label,
  variant = "purple",
  size = 28,
  className,
}: {
  label: string;
  variant?: "purple" | "black" | "white";
  size?: number;
  className?: string;
}) {
  return (
    <div className={className ? `brand-lockup ${className}` : "brand-lockup"}>
      <BrandMark variant={variant} size={size} alt="" />
      <span>{label}</span>
    </div>
  );
}

export function BrandWordmark({
  alt,
  height = 36,
  className,
}: {
  alt: string;
  height?: number;
  className?: string;
}) {
  const width = Math.round((321 / 154) * height);
  return (
    <img
      src={assetPath(brand.logoHorizontal)}
      alt={alt}
      width={width}
      height={height}
      className={className}
      draggable={false}
    />
  );
}
