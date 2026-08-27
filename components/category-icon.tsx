import { CircleDot, Construction, Droplets, Lightbulb, TrafficCone, Trash2, Trees, Waves } from "lucide-react";
import { tokens } from "@/design-system/generated/tokens";
import type { Category } from "@/lib/types";

const icons = {
  Roads: Construction,
  Waste: Trash2,
  Water: Droplets,
  Lighting: Lightbulb,
  Drainage: Waves,
  Traffic: TrafficCone,
  Parks: Trees,
  Other: CircleDot,
} as const;

/** Each category owns one hue, so a pin reads as a kind of problem before it reads as text. */
const categoryColors: Record<Category, string> = {
  Roads: tokens.categoryRoads,
  Waste: tokens.categoryWaste,
  Water: tokens.categoryWater,
  Lighting: tokens.categoryLighting,
  Drainage: tokens.categoryDrainage,
  Traffic: tokens.categoryTraffic,
  Parks: tokens.categoryParks,
  Other: tokens.categoryOther,
};

const svgPaths: Record<Category, string> = {
  Roads: '<path d="M2 21h20"/><path d="M9 3h6l5 18H4L9 3z"/><path d="M12 9v4"/><path d="M12 16h.01"/>',
  Waste: '<path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6v14H5V6"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  Water: '<path d="M12 3s6 6.2 6 11a6 6 0 0 1-12 0c0-4.8 6-11 6-11z"/>',
  Lighting: '<path d="M9 18h6"/><path d="M10 22h4"/><path d="M12 2a7 7 0 0 0-4 12c.6.6 1 1.5 1 2.4V18h6v-1.6c0-.9.4-1.8 1-2.4A7 7 0 0 0 12 2z"/>',
  Drainage: '<path d="M2 7c3 3 5 3 8 0s5-3 8 0 5 3 8 0"/><path d="M2 12c3 3 5 3 8 0s5-3 8 0 5 3 8 0"/><path d="M2 17c3 3 5 3 8 0s5-3 8 0 5 3 8 0"/>',
  Traffic: '<path d="M9 22h6"/><path d="M12 2l6 12H6L12 2z"/><path d="M12 14v8"/>',
  Parks: '<path d="M12 22v-7"/><path d="M8 22h8"/><path d="M12 15c-4 0-6-3-6-6 3 0 6 2 6 2s3-2 6-2c0 3-2 6-6 6z"/>',
  Other: '<circle cx="12" cy="12" r="3"/><circle cx="12" cy="12" r="9"/>',
};

export function categoryColor(category: Category) {
  return categoryColors[category];
}

export function CategoryIcon({ category, size = 16 }: { category: Category; size?: number }) {
  const Icon = icons[category];
  return <Icon size={size} aria-hidden />;
}

export function categoryMarkerSvg(category: Category, color = "#fff", size = 16) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${svgPaths[category]}</svg>`;
}
