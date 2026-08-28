# Status pill

**Purpose:** Name the current public status of an issue without relying on color alone.

**Anatomy:** label

**Variants:** reported · acknowledged · in_progress · awaiting · confirmed · contested

**Tokens:** `type.caption`, `radius.8`, `feedback.*`, `feedback.identity*`

**Sizing:** Padding 3px / `--space-2`. Text ≥12px. Not itself the only hit target.

**Accessibility:** Status text is the name; color is reinforcement.

**Content:** Canonical bilingual labels from `lib/i18n.ts`: Submitted, Under review, Work in progress, Check the fix, Confirmed, Reopened. Must tolerate Hindi length.

**Colour:** Submitted — neutral grey. Under review — soft blue (`identity`). Work in progress — muted amber. Check the fix — soft purple. Confirmed — muted green. Reopened — muted red. Do not use status colour on unrelated text, icons, or borders.
