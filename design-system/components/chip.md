# Chip

**Purpose:** Apply one reversible category or filter without leaving the current form.

**Anatomy:** optional leadingIcon · label

**Variants:** default | selected | disabled

**States:** default, hover, focus, pressed, selected (`aria-pressed`)

**Tokens:** `chip.height` 44px, `chip.radius` full, `chip.paddingX`, `chip.border`, `type.label.md`

**Sizing:** Min height 44px. Label never wraps. Row may scroll horizontally.

**Responsive:** Horizontal scroll on narrow screens rather than shrinking chips.

**Motion:** Background/color at `motion.fast`. No bounce.

**Accessibility:** `aria-pressed` when selected. Icon-only chips are not allowed.

**Content:** Category names in the UI language. Allow 30–50% expansion.

**Edge cases:** Overflow scroll, long Hindi labels, no image.
