# Navigation

**Purpose:** Two persistent destinations — Nearby and My Fixes — flank Report, a larger icon-only pill, in one floating dock.

**Anatomy:** inset floating dock · Nearby · Report pill · My Fixes

**Variants:** inactive destination | active destination | Report action

**States:** default, pressed, focus-visible. Destinations also have an active state. Report does not.

**Tokens:** `nav.height`, `nav.heightLandscape`, `nav.inset`, `nav.insetX`, `nav.gap`, `nav.shadow`, `nav.reportWidth`, `nav.reportHeight`, `nav.reportWidthLandscape`, `nav.reportHeightLandscape`, `touch.min`, `action.primary`, `feedback.infoSoft`, `font-weight.medium`

**Sizing:** Dock is 72px tall. Horizontal inset 16px, vertical inset 12px, plus `safe-area-inset-bottom`. Report pill 80×52 px (72×44 in landscape), fully rounded. Destination icons 22×22 px. All controls ≥48×48 px (44×44 in landscape).

**Responsive:** Stays a bottom dock in the phone frame. Do not convert to a sidebar in this product. At 320–359 px, reduce horizontal inset to 8 px. Destination labels stay on one line. Report is icon-only.

**Motion:** Color, background, and press scale at `motion.fast` / `motion.instant`. No layout shift. Reduced motion removes scale.

**Accessibility:** `nav` with aria-label. Persistent destinations use `aria-current="page"`. Report uses `aria-label` “Report a problem”. Semantic buttons, not tabs.

**Content:** Curated English, Hindi, and Kannada strings from i18n. Visible labels: Nearby, My Fixes. Report is icon-only.

**Edge cases:** Offline banner sits above content, not over the dock. Safe area padding on notched devices. Hide the dock when the on-screen keyboard opens. The issues sheet stops above the dock and does not move it. Map and list content extend behind the glass.
