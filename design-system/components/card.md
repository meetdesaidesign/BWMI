# Issue card

**Purpose:** Represent one canonical civic issue in a list or sheet so a resident can open it.

**Anatomy:** media (evidence) · category · status · title · support/metadata

**Variants:** default | selected

**States:** default, hover, focus, pressed, selected

**Tokens:** `card.radius`, `card.padding`, `card.gap`, `card.imageRadius`, `card.mediaSize`, `type.headingSm`, `type.caption`

**Sizing:** Media 88×88 px, radius `--card-image-radius`. Whole card is the hit target (≥44px). Title uses 2-line clamp.

**Responsive:** One column in the sheet. Do not drop the media slot — show the fallback icon if the image fails.

**Motion:** Selected elevation at `motion.fast`. Reduced motion: border/background only.

**Accessibility:** Native button. `aria-pressed` when selected in the map list. Media is decorative when the title is present (`alt=""`).

**Content:** Title from locale. Support count uses tabular numerals.

**Edge cases:** Missing image → category icon in the media slot. Long titles wrap to two lines. Zero supporters still render `0`.
