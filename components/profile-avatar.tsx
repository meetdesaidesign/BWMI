/* eslint-disable @next/next/no-img-element -- static portrait; next/image is unused in the static export */

import { Check } from "lucide-react";
import { assetPath, portraits } from "@/lib/assets";

export function ProfileAvatar({
  size,
  verified,
  alt,
}: {
  size: number;
  verified?: boolean;
  alt: string;
}) {
  return (
    <span className={`profile-avatar ${verified ? "is-verified" : ""}`} style={{ width: size, height: size }}>
      <img src={assetPath(portraits.resident)} alt={alt} width={size} height={size} draggable={false} />
      {verified ? (
        <span className="profile-avatar-badge" aria-hidden>
          <Check size={size >= 64 ? 12 : 9} strokeWidth={3} />
        </span>
      ) : null}
    </span>
  );
}
