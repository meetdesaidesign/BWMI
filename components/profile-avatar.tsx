import { residentProfile } from "@/lib/profile";

export function ProfileAvatar({
  size,
  alt,
}: {
  size: number;
  alt: string;
}) {
  const labelled = Boolean(alt);

  return (
    <span
      className="profile-avatar"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
      role={labelled ? "img" : undefined}
      aria-label={labelled ? alt : undefined}
      aria-hidden={labelled ? undefined : true}
    >
      <span className="profile-avatar-initials">{residentProfile.initials}</span>
    </span>
  );
}
