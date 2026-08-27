# Navigation

**Purpose:** Three stable destinations — Nearby, Report, My reports.

**Anatomy:** icon · label; Report uses a filled action glyph

**Variants:** inactive | active

**States:** default, hover, focus, pressed, selected

**Tokens:** `nav.height`, `touch.min`, `action.primary`, `type.caption`

**Sizing:** Bar height 72px plus `safe-area-inset-bottom`. Each item ≥44×44 px. Labels always visible.

**Responsive:** Stays a bottom bar in the phone frame. Do not convert to a sidebar in this product.

**Motion:** Color/icon at `motion.fast`. No layout shift.

**Accessibility:** `nav` with aria-label. Current item exposed by the tab primitive. Labels are not icon-only.

**Content:** Curated English/Hindi strings from i18n.

**Edge cases:** Offline banner sits above content, not over the bar. Safe area padding on notched devices.
