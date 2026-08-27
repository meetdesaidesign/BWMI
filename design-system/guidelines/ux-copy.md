# UX copy guidelines

Follow this file as the source of truth for every user-facing string. Prefer simple public language, preserve factual meaning, use canonical terms, centralize reusable strings, and cover all system states. If policy or product behavior is unclear, flag it instead of inventing a promise.

**Core rule:** If a simpler sentence says the same thing, use the simpler sentence.

**Priority:** Accuracy > clarity > brevity > personality. Never shorten a sentence so much that the user loses an important consequence or instruction.

Version 1.0 · Mobile-first web · Adapted from the general-public UX copy guidelines for Pakka.

## How to use this guide

This is a rule system, not inspiration.

- Use the established terms in this document before inventing a new label.
- Rewrite unclear existing copy instead of preserving it for consistency.
- Do not change user-facing meaning, eligibility, legal requirement, fee, status, deadline, or consequence while simplifying.
- Do not add marketing language to task flows.
- Do not use technical, administrative, or internal terminology when a familiar public word exists.
- Keep reusable UI strings in `lib/i18n.ts`. Do not scatter similar variants across screens.
- When requirements are ambiguous, prefer neutral copy and flag the product-rule ambiguity instead of inventing policy.
- Use sentence case everywhere except proper nouns and official names.
- Do not force ALL-CAPS with CSS (`text-transform: uppercase`) on labels, eyebrows, or status text.

### Content architecture

Canonical terms → reusable strings in `lib/i18n.ts` → component copy patterns → flows → screens.

Example: define the noun “report” once, reuse “Submit report” as the action, use the same success language everywhere, and only add screen-specific context when needed.

## Audience

Write for the broadest reasonable public audience, not for product teams. Assume users may be hurried, anxious, unfamiliar with apps, or reading in a second language. They may be outdoors, on a small screen, using a screen reader or enlarged text, or briefly offline.

**Reading test:** A user should understand the main action and consequence without reading the screen twice. If a sentence sounds like an office notice, rewrite it.

| Avoid | Use instead |
| --- | --- |
| Please select the appropriate grievance category. | Choose an issue type. |
| Kindly furnish photographic evidence. | Add a photo. |
| Your submission has been successfully registered. | Report submitted. |
| Geolocation permission is required to proceed. | Allow location to continue. |
| The concerned authority will undertake necessary action. | The team will review your report. |

## Voice

Calm, practical, respectful, and direct. A capable public service — not a corporate dashboard and not a playful social app.

| Situation | Tone | Example |
| --- | --- | --- |
| Normal task | Neutral and concise | Add a photo |
| Success | Reassuring, not celebratory | Report submitted |
| Error | Helpful, non-blaming | Couldn’t upload the photo. Try again. |
| Waiting | Clear about status | Your report is waiting for review. |
| Sensitive / safety | Calm and explicit | If there is immediate danger, contact emergency services. |
| Permission | Transparent | Allow location so we can place the issue on the map. |
| Destructive action | Specific and cautionary | Delete report? This cannot be undone. |

Avoid personality that competes with the task: no “Awesome!”, “Oops!”, “Hang tight”, emoji as the only signal, or “You’re all set!”

## Canonical terms

Choose one public-facing word for each concept and use it everywhere.

| Preferred term | Meaning / rule |
| --- | --- |
| Report | A user-submitted issue. Prefer over complaint, ticket, case, grievance, request unless those are genuinely different objects. |
| Issue | The real-world problem being reported. |
| Issue type | Category the user chooses: Roads, Waste, Water, Drainage, Lighting. |
| Location | Where the issue is. Prefer over geolocation. |
| Photo | Image attached by the user. Prefer over evidence, attachment, or media. |
| Update | New information about a report. Prefer over activity event or proof trail in UI copy. |
| Status | Current state of the report. |
| Team | Public-facing default for the responsible operating group. Use a department name only if that identity matters. |
| Resolved | The team says the issue has been fixed. |
| Confirmed | A resident has checked the location and agreed the issue is fixed. Pakka-specific; do not collapse into Closed. |
| Reopen | User action when the issue still exists after the team marked it resolved. |
| I see this too | Public action for supporting an existing report. Not like, upvote, or back. |

**Words to avoid unless legally required:** grievance · lodge · furnish · concerned authority · requisite · facilitate · aforementioned · pertaining to · inconvenience caused · kindly · proceed further · initiate action · redressal · proof trail (in UI) · ticket · geolocation

### Pakka status labels

Statuses must describe a real operational state. These map to `IssueStatus` in code:

| Code | Label | Meaning |
| --- | --- | --- |
| `reported` | Submitted | We received the report. |
| `acknowledged` | Under review | The report is being checked. |
| `in_progress` | Work in progress | Work has started. |
| `awaiting_confirmation` | Check the fix | The team marked it resolved. A resident still needs to confirm or reopen. |
| `confirmed` | Confirmed | A resident confirmed the repair. |
| `contested` | Reopened | The issue was reported as still unresolved. |

Do not invent response times in chrome copy. Dates shown on a report are operational data, not a product SLA.

This app is not an emergency service. Do not imply that normal reports are monitored in real time.

## Length targets

Write the clearest version, then shorten without losing meaning. Truncation is a layout fallback, not a copy strategy.

| Element | Target | Rule |
| --- | --- | --- |
| Screen title | 1–4 words | Name the place or task: “Report an issue”. |
| Section heading | 2–6 words | Describe the group: “Add details”. |
| Button | 1–3 words | Verb-led when possible: “Submit report”. |
| Field label | 1–4 words | Use the noun: “Mobile number”. |
| Helper text | 1 short sentence | Explain why or format only when needed. |
| Error | 1–2 short sentences | Problem + recovery. |
| Success title | 2–5 words | Confirm the completed outcome. |
| Chip / filter | 1–3 words | Use familiar category labels. |

## Buttons and navigation

- Verb when the action changes something: Submit report, Add photo, Reopen report.
- Use “Next” / “Continue” only in a clear multi-step flow.
- Use the object when ambiguity exists: “Delete photo”, not “Delete”.
- Do not use “OK” when a meaningful action label is available.
- Do not use “Yes / No” for confirmations. Repeat the action: “It’s fixed” / “Still broken”.
- Navigation labels are nouns or destinations: Map/Nearby, Report, My reports.
- Label the language control “Language”. Show each language in its own script. Changing language must not reset form progress.

## Forms

- Labels stay visible; placeholders are examples, not replacements.
- Label what the information is: “Phone or email”, not “Enter phone or email”.
- Mark optional fields with “Optional”.
- Explain why sensitive information is needed next to the field.
- Validation states the requirement, not the person’s mistake: “Enter a 10-digit mobile number”, not “Invalid input”.

## Errors, loading, empty, success

**Error:** problem + recovery. When useful, say what was preserved.

**Loading:** present participles — “Uploading photo...”, “Finding your location...”. No fake percentages.

**Empty:** what is empty and what the user can do. Not an error. “No reports yet. Report an issue to see it here.”

**Success:** confirm the outcome and give the next useful step. Avoid “successfully”. Never say “submitted” until the report has been accepted.

## Location, permissions, offline

**Permission formula:** what + why + alternative.

“Allow location so we can place the issue on the map. You can also choose the location on the map.”

**Offline:** say what is saved, what is pending, and what needs a connection. “You’re offline. You can still browse reports.”

## Privacy and safety

At the moment it matters, explain what is collected, why, and who can see it when relevant.

“Your name is not shown publicly. We use this only for report updates.”

## Localization

- Keep one meaning per string. Do not concatenate fragments to build sentences.
- Use named variables: `{count}`, `{issueType}`, `{location}`.
- Allow Hindi to expand 30–50%.
- No idioms, puns, or wordplay.
- Dates in English for India: “26 Aug 2026”, “3:30 PM”. Relative time only for recent events.

## Accessibility

- Do not rely on color alone for status.
- Link text describes the destination.
- Icon-only actions need accessible names that match the visible concept.
- Numerals for quantities and steps: 2 photos, Step 1 of 2.
- Informative images get alt text; decorative images get empty alt.

## Rewrite sequence

1. Identify the user’s immediate goal on the screen.
2. Identify facts, consequences, deadlines, or policy that must not change.
3. Replace internal terms with canonical public terms.
4. Remove filler, repetition, and unnecessary politeness.
5. Convert passive sentences to direct active language where possible.
6. Break multi-action instructions into separate sentences.
7. Rewrite the primary action so its result is predictable.
8. Check that error copy includes a recovery path.
9. Check that permission copy explains why the data is needed.
10. Check that the string can be translated without idioms.
11. Check terminology against the canonical dictionary.
12. Run the lint checklist.

Do not “improve” policy. If copy exposes an unclear ownership, SLA, or contradictory status, flag it.

## Lint checklist

Every new or changed string should pass:

- A first-time user can understand it without product knowledge.
- A shorter familiar word with the same meaning is not available.
- It uses the canonical term.
- The main action is obvious; the button describes what will happen.
- It avoids blame and unnecessary urgency.
- Errors include recovery; permissions explain why.
- Status describes the real current state.
- It avoids vague words such as “process”, “action”, “request” when a specific noun is available.
- It can be translated without an idiom or sentence fragment.
- It still works with larger text and on a narrow mobile screen.
- Legal, safety, fee, eligibility, and timing details are preserved.
- Sentence case is used; punctuation is necessary and consistent.

## Definition of done

A screen is copy-complete when all user-facing strings use canonical terminology; no developer or API terms are visible; primary and destructive actions are unambiguous; validation, error, empty, loading, offline, and success states are covered; permissions include a plain-language reason; status copy matches backend states; copy lives in `lib/i18n.ts`; variables have safe fallbacks; long Hindi strings have been considered; and no text promises a response time or outcome the service cannot guarantee.
