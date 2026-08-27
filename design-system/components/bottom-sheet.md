# Bottom sheet

**Purpose:** Hold the nearby issue list over an interactive map without covering the map as a static page.

**Anatomy:** handle · header · scrollable results

**Variants:** snap `collapsed` | `medium` | `expanded`

**States:** idle, dragging, snapping

**Tokens:** `sheet.radiusTop`, `sheet.handleWidth`, `sheet.padding`, `sheet.collapsed`, `elevation.2`, `overlay.scrim`

**Sizing:** Handle 40×4 px. Collapsed peek `--sheet-collapsed`. Expanded leaves an 80px map peek.

**Responsive:** Constrained to the nearby stage (not the viewport) so the desktop phone frame still works.

**Motion:** Follow the pointer while dragging. Snap with `motion.standard` / `ease.enter`. Reduced motion: instant snap, no travel.

**Accessibility:** `role="region"` labelled “Nearby issues”. List inside remains keyboard reachable. Drag is supplementary.

**Content:** Header states count + section title.

**Edge cases:** Short lists still fill collapsed peek. Map remains pannable beside the peek. Bottom nav is a sibling, not inside the sheet.
