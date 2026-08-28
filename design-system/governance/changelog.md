# Changelog

## 1.6.0 — 28 August 2026

My Reports became a compact tracking list: heading-md title, Raised/Supported segments with counts, and a filter/sort control. Report cards use 16px radius, 88px evidence, a status pill, and a footer for confirmations / merged reports / last update. Bottom navigation is a flat bar with a hairline top border; the primary colour is reserved for the active destination and the Report circle.

## 1.5.0 — 27 August 2026

Bottom navigation is shorter (56px, 48px landscape). Report is a 44px circle in the dock — the only purple fill. Selected destinations use a 28px tint behind the icon, not a full-slot pill. Destination label: My Reports.

## 1.4.0 — 27 August 2026

Bottom navigation became a floating dock: Nearby and My reports in a glass pill, Report as a separate circular action. Added `nav.inset`, `nav.insetX`, `nav.gap`. Control height 64px (56px landscape).

## 1.3.0 — 26 August 2026

Adopted the general-public UX copy guidelines as the copy source of truth (`guidelines/ux-copy.md`). UI strings live in `lib/i18n.ts`. Sentence case; no forced ALL-CAPS labels.

## 1.2.0 — 26 August 2026

Nearby results became a snap-scrolling card carousel. Selected card enlarges its map photo (`marker.sizeSelected` 96px). Added `carousel.height`, `carousel.cardWidth`, `carousel.gap`, `carousel.peek`.

## 1.1.0 — 26 August 2026

Map markers changed from numbered circles to evidence image cards (`marker.size`, `marker.sizeSelected`, `marker.radius`, `marker.border`, `marker.labelWidth`). Support count is a badge on the photo; the title sits under the card.

## 1.0.0 — 26 August 2026

Adopted the AI Design Foundation. Introduced primitives, semantic tokens, component tokens, generated CSS/TS, and Civic Signal mapped onto those contracts.

No prior token names to migrate.
