# Carousel card

**Purpose:** Browse nearby issues one-at-a-time over the map, keeping the selected issue’s photo large on the map.

**Anatomy:** full-bleed evidence media · scrim · category · status · title · support count

**Variants:** default | selected (centered snap)

**States:** default, focus, pressed, selected

**Tokens:** `carousel.height`, `carousel.cardWidth`, `carousel.gap`, `carousel.peek`, `card.radius`, `overlay.scrimStrong`, `type.headingSm`, `type.caption`

**Sizing:** Card width `carousel.cardWidth` so neighbours peek. Height `carousel.height`. Hit target is the full card (≥44px).

**Responsive:** One card centered on the mobile baseline. Peek remains visible; do not shrink below comfortable tap size.

**Motion:** Scroll-snap after release; map marker size at `motion.fast`. Reduced motion: instant snap, no map travel.

**Accessibility:** Each card is a button. `aria-pressed` on the selected card. Region has Left/Right keyboard support. Media is decorative when the title is present.

**Content:** Locale title, category, bilingual status, tabular support count. Text sits on a scrim for contrast.

**Edge cases:** Missing image → brand-tinted slot, layout unchanged. One issue: card still centers with peek padding.
