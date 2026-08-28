# Navigation

**Purpose:** Two persistent destinations — Nearby and My Reports — flank Report, a compact icon-only circle, on a flat bottom bar.

**Anatomy:** full-width bar · Nearby · Report circle · My Reports

**Variants:** inactive destination | active destination | Report action

**States:** default, pressed, focus-visible. Destinations also have an active state. Report does not.

**Tokens:** `nav.height`, `nav.heightLandscape`, `nav.reportWidth`, `nav.reportHeight`, `touch.min`, `action.primary`, `border.subtle`, `font-weight.medium`, `font-weight.semibold`

**Sizing:** Bar is 56px tall (48px landscape) plus `safe-area-inset-bottom`. Report circle 44×44 px (40×40 in landscape), optically centred on the bar’s top edge. Destination icons 20×20 px. All controls ≥44×44 px.

**Responsive:** Stays a bottom bar in the phone frame. Do not convert to a sidebar in this product. Destination labels stay on one line. Report is icon-only.

**Motion:** Color and press scale at `motion.fast` / `motion.instant`. No layout shift. Reduced motion removes scale.

**Accessibility:** `nav` with aria-label. Persistent destinations use `aria-current="page"`. Report uses `aria-label` “Report a problem”. Semantic buttons, not tabs.

**Content:** Curated English, Hindi, and Kannada strings from i18n. Visible labels: Nearby, My Reports. Report is icon-only. Active destination uses the primary colour on the icon and label only.

**Edge cases:** Offline banner sits above content, not over the bar. Safe area padding on notched devices. Hide the bar when the on-screen keyboard opens. Map and list content extend behind the bar and clear it with `--nav-clearance` plus `--nav-report-rise`.
