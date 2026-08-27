import { Construction, Droplets, Lightbulb, Trash2, Waves } from "lucide-react";
import type { Category } from "@/lib/types";

const icons = {
  Roads: Construction,
  Waste: Trash2,
  Water: Droplets,
  Lighting: Lightbulb,
  Drainage: Waves,
} as const;

export function CategoryIcon({ category, size = 16 }: { category: Category; size?: number }) {
  const Icon = icons[category];
  return <Icon size={size} aria-hidden />;
}
