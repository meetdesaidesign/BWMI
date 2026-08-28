# Map + list view

Map remains a first-class interactive surface. Nearby results are a horizontal, snap-scrolling card carousel above the bottom navigation — not a vertical sheet.

- Swiping the carousel selects that issue: its map photo enlarges, others stay at default size, and the map pans to it.
- Tapping a map photo snaps the carousel to that card and enlarges the photo.
- Tapping the centered carousel card opens the issue record.
- Keyboard: Left/Right on the carousel moves selection; the list of cards remains tabbable.
- Floating chrome (brand + language) uses elevated surfaces and safe-area spacing.
- Loading the map uses a local placeholder; the rest of the app stays usable.
- Tapping the locate control returns to the resident's live location and updates the header.
- After a pan, the header keeps its current place name. Once the map has been still for about 650 ms, the map centre is reverse-geocoded: the same locality keeps its name, a new neighbourhood replaces it, and a civic boundary also updates the city corporation. A short dimmed state covers the swap so the header does not jump.
- “Search this area” appears after the resident moves far enough that the on-screen results no longer match the viewport. Tapping it loads reports for the new view. Results do not refresh while they are still moving.
