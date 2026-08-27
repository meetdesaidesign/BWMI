# Button

**Purpose:** The one primary action on a screen — submit a report, confirm a fix, continue.

**Anatomy:** optional leading icon · label · optional trailing icon

**Variants:** `primary` · `secondary` · `destructive` · `success`

**States:** default, hover, focus, pressed, disabled, loading

**Tokens:** `button.height`, `button.radius`, `button.paddingX`, `action.*`, `type.label.md`

**Sizing:** Height 52px (above 44px min). Full width in mobile flows. Label never truncates; wrap if Hindi requires it.

**Responsive:** Stay full-width in the phone frame. Do not shrink below `--touch-min`.

**Motion:** Press scale 0.97 at `motion.fast`. Reduced motion: color only.

**Accessibility:** Native `<button>` or antd-mobile `Button`. Disabled uses `disabled`, not click-swallowing. Loading disables the control and exposes busy state.

**Content:** One primary button per view. Destructive actions use `action.destructive` and sit apart from primary.

**Edge cases:** Disabled opacity 0.4; keep layout height so the sticky action bar does not jump.
