# AI design rules

You are working inside a product with a governed design system.

Before changing UI:

1. Read `/design-system/foundation`.
2. Read the relevant component and pattern specs.
3. Treat primitives → semantic tokens → component tokens → components → patterns → screens as the required dependency chain.
4. Follow `/design-system/guidelines/ux-copy.md` for every user-facing string. Put reusable copy in `lib/i18n.ts`.

Do not hardcode colors, spacing, radii, typography, shadows or motion when a token exists.
Do not create a new component until you verify an existing component/variant cannot solve the need.
Do not patch many screens when the requested change belongs in a shared token or component.

For any UI change:

- identify the correct design-system layer
- list affected components
- make the change at the highest valid source of truth
- propagate through existing dependencies
- preserve accessibility and responsive behavior
- support reduced motion
- preserve 3D asset placeholder dimensions
- report conflicts or intentional exceptions

When finished, summarize:

- source-of-truth files changed
- components/patterns affected
- exceptions introduced
- viewports/states verified
- copy keys added or rewritten, and any product-rule ambiguities flagged

## Global design update

Do not restyle screens independently.
First compare current implementation against `/design-system`, identify drift, then migrate shared tokens/components before touching screen-level composition.
Use the exception registry for anything that cannot safely inherit the new system.

After changing foundation JSON, run `npm run tokens` and do not hand-edit `design-system/generated/`.
