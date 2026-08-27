# Empty state

Use `asset.emptyState` (184px) so a future illustration can drop in without layout shift.

- Icon or placeholder occupies the slot.
- Heading uses `heading.sm`; body uses `body.md`. Copy: what is empty + what the user can do (`empty` / `emptyHelp` in `lib/i18n.ts`). Never treat normal emptiness as an error.
- One optional primary action.
- Decorative illustration: empty alt. Meaningful illustration: concise alt.
