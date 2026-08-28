# Issue card

**Purpose:** Represent one report in My Reports so a resident can scan it and open details.

**Anatomy:** evidence photo · title · location · status pill · footer (confirmations, merged count, last update)

**Variants:** default | skeleton

**States:** default, hover, focus, pressed

**Tokens:** `radius.16`, `card.mediaSize`, `border.default`, `type.bodyLg`, `type.caption`, `feedback.*`

**Sizing:** Card radius 16px. Media 88×88 px, image radius 12px. Title is 17px/22px at medium weight with a 2-line clamp. Status and review tags are 30px high with 12px horizontal padding and an 8px radius. Horizontal page padding 20px. Gap between cards 12px. Whole card is the hit target (≥44px).

**Responsive:** One column. Do not drop the media slot — show the fallback icon if the image fails.

**Motion:** Press scale from the global button rule. Reduced motion: no scale.

**Accessibility:** Native button. Media is decorative when the title is present (`alt=""`). Status colour is reinforcement for the pill label.

**Content:** Locale title. Confirmation count uses singular/plural (`1 confirmation` / `{count} confirmations`). Merged reports only when `mergedCount` is present. Tabular numerals.

**Edge cases:** Missing image → category icon in the media slot. Long titles wrap to two lines. Zero supporters still render `0 confirmations`.
