# Status pill

**Purpose:** Name the current public status of an issue without relying on color alone.

**Anatomy:** label

**Variants:** reported · acknowledged · in_progress · awaiting · confirmed · contested

**Tokens:** `type.caption`, `radius.8`, `feedback.*`

**Sizing:** Padding `--space-1` / `--space-2`. Text ≥12px. Not itself the only hit target.

**Accessibility:** Status text is the name; color is reinforcement.

**Content:** Canonical bilingual labels from `lib/i18n.ts`: Submitted, Under review, Work in progress, Check the fix, Confirmed, Reopened. Must tolerate Hindi length.
