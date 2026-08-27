# Map marker

**Purpose:** Show one civic issue on the ward map as an evidence photo, so the problem is recognizable before opening the record.

**Anatomy:** media (evidence thumbnail) · support-count badge · title label under the card

**Variants:** default | selected

**States:** default, focus, selected

**Tokens:** `marker.size`, `marker.sizeSelected`, `marker.radius`, `marker.border`, `marker.labelWidth`, `elevation.1–2`, `surface.primary` (card ring), `type.caption`

**Sizing:** Default media 24px with 4px stroke; selected media 48px with 8px stroke. Corner radius 12px on the photo. Outer ring uses `surface.primary`. Whole control is the hit target and stays ≥44px.

**Responsive:** Same sizes on all viewports. Do not shrink below `--touch-min`.

**Motion:** Selection size/shadow at `motion.fast`. Reduced motion: instant swap, no scale travel.

**Accessibility:** Map markers are pointer/touch. Keyboard users use the issue list (required equivalent). The visible label is the issue title; the badge is the support count. Photo is decorative when the title is present (`alt=""`).

**Content:** Locale title under the card. Support count as a tabular badge on the photo. Status color lives on the badge (brand / repair green / destructive), not on the card chrome.

**Edge cases:** Missing image → neutral surface in the same slot, never collapse. Selected marker uses `elevation.2` and a stronger ring so it stays visible against the light basemap (EX-004). Overlapping photos: selected wins z-index.
