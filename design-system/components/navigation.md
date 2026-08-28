# Navigation

**Purpose:** Two persistent destinations — Nearby and My Reports — flank Report, an icon-only circle, on a flat bottom bar.

**Anatomy:** full-width bar · Nearby · Report circle · My Reports

**Variants:** inactive destination | active destination | Report action

**States:** default, pressed, focus-visible. Destinations also have an active state. Report does not.

**Tokens:** `nav.height`, `nav.heightLandscape`, `nav.safeInset`, `nav.safeInsetLandscape`, `nav.touchMin`, `nav.itemGap`, `nav.reportWidth`, `nav.reportHeight`, `nav.reportShadow`, `nav.iconSize`, `text.secondary`, `action.primary`, `border.subtle`, `font-weight.medium`, `font-weight.semibold`

**Sizing:** Bar content is 64px tall (56px landscape). Bottom padding is `max(nav.safeInset 20px, safe-area-inset-bottom)` — 16px in landscape — so the bar reads 80–88px on a typical phone. Report circle 56×56 px (48×48 in landscape), optically centred on the bar’s top edge, with `nav.reportShadow`. Destination icons 24×24 px, 4px from the 12px medium label. Inactive destinations use `text.secondary`. All controls ≥48×48 px.

**Responsive:** Stays a bottom bar in the phone frame. Do not convert to a sidebar in this product. Destination labels stay on one line. Report is icon-only.

**Motion:** Color and press scale at `motion.fast` / `motion.instant`. No layout shift. Reduced motion removes scale.

**Accessibility:** `nav` with aria-label. Persistent destinations use `aria-current="page"`. Report uses `aria-label` “Report a problem”. Semantic buttons, not tabs.

**Content:** Curated English, Hindi, and Kannada strings from i18n. Visible labels: Nearby, My Reports. Report is icon-only. Active destination uses the primary colour on the icon and label only.

**Edge cases:** Offline banner sits above content, not over the bar. Safe area padding on notched devices. Hide the bar when the on-screen keyboard opens. Map and list content extend behind the bar and clear it with `--nav-clearance` plus `--nav-report-rise`.
