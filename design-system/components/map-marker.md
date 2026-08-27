# Map marker

**Purpose:** Show one civic issue on the ward map as an evidence photo, so the problem is recognizable before opening the record and cannot be mistaken for a basemap POI.

**Anatomy:** media (evidence thumbnail) · support-count badge · title label under the card

**Variants:** default | selected

**States:** default, focus, selected

**Tokens:** `marker.size`, `marker.sizeSelected`, `marker.radius`, `marker.radiusSelected`, `marker.border`, `marker.borderSelected`, `elevation.1–2`, `surface.primary` (card ring)

**Sizing:** Default media 30px with 3px stroke and 8px corners; selected media 48px with 4px stroke and 12px corners. Shape is a rounded square, never a circle. Outer ring uses `surface.primary`. Whole control is the hit target and stays ≥44px. Both states show the evidence photo.

**Responsive:** Same sizes on all viewports. Do not shrink below `--touch-min`.

**Motion:** Selection size/shadow at `motion.fast`. Reduced motion: instant swap, no scale travel.

**Accessibility:** Map markers are pointer/touch. Keyboard users use the issue list (required equivalent). The visible label is the issue title; the badge is the support count. Photo is decorative when the title is present (`alt=""`).

**Content:** Locale title under the card. Support count as a tabular badge on the photo. Status color lives on the badge (brand / repair green / destructive), not on the card chrome.

**Edge cases:** Missing image → category icon on the same rounded square, never collapse. Selected marker uses `elevation.2` and a stronger ring so it stays visible against the light basemap (EX-004). Overlapping photos: selected wins z-index.
