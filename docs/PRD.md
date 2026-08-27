# Pakka — Product Requirements Document

**Status:** Hackathon MVP  
**Product type:** Mobile-first civic issue reporting web app  
**Primary market:** Indian cities and urban wards  
**Demo location:** Fictional Ward 14, Model Town  
**Last updated:** 25 August 2026

## 1. Product summary

Pakka helps residents report public infrastructure and municipal problems, follow what happens after reporting, and verify whether the problem was actually fixed.

The product is built around one principle:

> A repair is not finished until a resident confirms it.

Residents can photograph a pothole, waste pile, water leak, broken streetlight, or drainage problem. Pakka uses the photo and location to prepare most of the report automatically. Reports about the same physical problem are consolidated so neighbours can support one canonical issue instead of creating duplicates.

Government updates are recorded in a public proof trail. When a department marks work complete, residents can confirm the fix or contest it with current photographic evidence. Confirmed fixes can generate a privacy-safe social card that residents may share.

## 2. Problem

Existing civic reporting systems frequently optimize for accepting complaints rather than establishing trustworthy resolution.

Residents commonly experience:

- Long forms and uncertainty about the responsible department.
- Duplicate complaints that fragment visible public demand.
- Status labels that do not explain what work was performed.
- Complaints being closed without resident verification.
- No simple way to contest an incorrect closure.
- Limited visibility into responsibility and escalation paths.
- Little motivation to report another issue after a poor first experience.

For occasional users, every extra field and decision increases abandonment. Pakka must therefore work for someone standing outdoors, using one hand, who wants to report a problem and continue with their day.

## 3. Product goals

### Primary goals

1. Let a first-time resident file a useful report in under one minute.
2. Minimize typing by deriving category and description from a photograph.
3. Reduce duplicate complaints by consolidating nearby reports.
4. Make progress and organizational responsibility understandable.
5. Give residents meaningful control over case closure.
6. Encourage repeat civic participation by celebrating verified outcomes rather than complaint volume.

### Non-goals for the MVP

- Replacing municipal grievance systems of record.
- Verifying a resident's legal identity.
- Publishing personal performance scores for named officials.
- Building a complete officer operations console.
- Supporting emergency, police, fire, or medical reporting.
- Automatically deciding whether government work is complete.
- Providing legally binding service-level commitments.

## 4. Target users

### Primary user: occasional resident reporter

- Encounters a visible problem while travelling through their area.
- May have little knowledge of municipal departments or ward structures.
- Uses the product infrequently and should not need training.
- Expects camera-first interaction, clear progress, and minimal typing.
- May prefer English or Hindi.
- May browse anonymously and may not want their name made public.

### Secondary user: supporting neighbour

- Sees an existing problem on the nearby map or through a shared link.
- Wants to signal that the issue affects more than one person.
- May later help verify whether the repair was completed.

### Future user: municipal operator

- Receives, routes, updates, and closes assigned cases.
- Uploads evidence of completed work.
- Is outside the citizen-only hackathon MVP.

## 5. Product principles

### Photo first

The photograph should do most of the work. Text entry is a correction mechanism, not the default reporting method.

### One problem, one public record

Reports that refer to the same physical problem should strengthen one canonical issue instead of creating parallel tickets.

### Evidence over status labels

Every meaningful change should appear in a chronological proof trail with a timestamp, public explanation, and evidence when applicable.

### Residents close the loop

An agency may mark work complete, but final confirmed closure belongs to residents.

### Organizational accountability, not personal blame

Pakka identifies the responsible department, operational role, response window, and escalation channel. It does not publish speculative rankings or blame individual officials.

### Privacy by default

Public participation counts should not require public personal identities. Contact details are optional and private.

## 6. Core user journeys

### 6.1 Report a new issue

1. Resident opens Pakka as a guest.
2. Resident taps **Report** in the persistent bottom navigation.
3. Resident takes a photo or selects one from the gallery.
4. Pakka requests location permission and captures an approximate location when granted.
5. AI suggests category, bilingual title, description, and severity.
6. Pakka checks for a likely nearby duplicate.
7. Resident reviews and may edit every suggested field.
8. Resident optionally enters a phone number or email for updates.
9. Resident submits the report.
10. Pakka creates a public issue and saves it under **My reports**.

### 6.2 Support an existing issue

1. Resident selects an issue from the map, list, or duplicate suggestion.
2. Resident taps **I see this too**.
3. Pakka increments the public support count and records the issue under the resident's local activity.
4. Only an alias or anonymous resident label may be displayed publicly.

### 6.3 Track progress

1. Resident opens an issue.
2. Pakka displays its current state and chronological proof trail.
3. Resident can see the assigned department, responsible role, expected response window, and escalation contact.
4. New status events preserve earlier events rather than replacing them.

### 6.4 Confirm a fix

1. Department marks the issue complete and supplies completion evidence where available.
2. Issue enters **Awaiting resident confirmation**.
3. Resident checks the physical location.
4. Resident selects **Yes, it's fixed**.
5. Pakka records the confirmation and moves the issue to **Confirmed fixed**.
6. Resident may generate a shareable Proof Keeper story card.

### 6.5 Contest an incorrect fix

1. Resident opens an issue awaiting confirmation.
2. Resident selects **No, still broken**.
3. Resident supplies a current photograph.
4. Pakka appends the new evidence to the same public issue.
5. Status changes to **Contested** and the case is reopened.
6. Existing supporters and the complete history remain intact.

## 7. Functional requirements

### Nearby discovery

- Show open and recently resolved issues in the selected ward.
- Provide an interactive map and ranked issue list.
- Encode public support through visible counts and map marker size.
- Allow residents to open an issue from either a map marker or list row.
- Provide a meaningful empty state when no nearby issues exist.

### Reporting

- Support camera capture and gallery upload on mobile browsers.
- Accept common image formats with a maximum upload size of 8 MB.
- Request camera and location permissions only after explicit user action.
- Allow reporting when location permission is denied.
- Allow every AI-generated value to be corrected.
- Require confirmation of the review screen before submission.
- Keep phone or email optional.
- Provide recoverable states for failed uploads, AI errors, offline use, and missing browser capabilities.

### AI-assisted extraction

The extraction response must contain:

```text
category
title_en
title_hi
description_en
description_hi
severity: low | medium | high
confidence: 0–1
needs_user_review
duplicate_id: string | null
```

- Allowed categories in the MVP are Roads, Waste, Water, Lighting, and Drainage.
- AI output is always a suggestion and never authoritative government data.
- Low-confidence results must remain editable and may fall back to manual category selection.
- The AI must not identify people or infer sensitive personal traits from photographs.
- AI processing must occur through a server-controlled route in deployments that support a backend.
- The static GitHub Pages demo uses a deterministic result for its prepared pothole image.

### Duplicate consolidation

- Suggest an existing issue when category and approximate location indicate a likely match.
- Show the existing issue's title, location, and support count.
- Make supporting the existing issue the recommended action.
- Preserve **This is different** so the resident can submit a distinct issue.
- Never merge reports irreversibly based only on an AI decision.

### Issue record

Each issue must show:

- Public issue ID.
- Category and bilingual title/description.
- Report evidence and approximate public location.
- Current status and age.
- Public support count.
- Proof trail with timestamps and public notes.
- Assigned department and operational role.
- Expected response window.
- Escalation role and public contact channel.

### Status model

Supported states are:

```text
Reported
Acknowledged
In progress
Awaiting resident confirmation
Confirmed fixed
Contested
```

- Status changes must create events; they must not erase history.
- **Contested** returns the issue to an actionable state.
- Only an explicit resident confirmation may produce **Confirmed fixed**.

### Sharing and recognition

- Recognition is awarded after a confirmed fix, not after filing a report.
- Generate a 1080 × 1920 story card suitable for social sharing.
- Include the ward, verified outcome count, award name, and Pakka URL.
- Exclude reporter names, contact details, and precise issue locations.
- Use the Web Share API when supported.
- Provide download and copy-link fallbacks.

### Localization

- Provide complete English and Hindi UI copy.
- Navigation, status, permission, safety, and privacy copy must be curated rather than machine-translated at runtime.
- User-generated issue summaries may be translated with AI but remain editable.
- Layouts must tolerate longer Hindi strings without clipping or reducing touch targets.

## 8. Information and privacy model

### Public information

- Issue category, summary, approximate location, evidence, and status.
- Support count and optional public aliases.
- Department, responsible role, response window, and escalation channel.
- Status history and public resolution evidence.

### Private information

- Phone numbers and email addresses.
- Internal reporter identifiers.
- Exact location metadata when publishing it could create a safety risk.
- Raw image metadata that is not needed for verification.

### Privacy requirements

- Browsing must not require an account.
- Contact information must remain optional.
- Reporter identity must be private by default.
- Remove unnecessary EXIF metadata before long-term image storage.
- Store private identity mappings separately from public issue records.
- Production writes must pass through validated server actions and database access policies.

## 9. Experience and design requirements

Pakka uses the **Civic Signal** visual language on top of the governed design system in `/design-system`.

- Tokens are the source of truth: primitives → semantic tokens → component tokens → components → patterns → screens.
- Mobile-first with a persistent three-item bottom navigation.
- Map-first nearby screen: interactive map plus a results sheet with collapsed / medium / expanded snaps.
- Infrastructure blue for primary actions and navigation.
- Reflective yellow for evidence and resident checkpoints.
- Safety orange for contested, overdue, or destructive states.
- Repair green only for verified success.
- Compact sans-serif typography suitable for English and Devanagari, never below the 12px caption role.
- Minimum 44 × 44 px interactive hit areas.
- High contrast, visible focus states, keyboard support, and reduced-motion support.
- Desktop judges see a centered mobile application with supporting demo context.
- Content scrolls independently while primary navigation remains visible.

## 10. Data model

### Issue

Canonical problem record containing category, bilingual content, approximate location, department, responsible role, status, severity, and timestamps.

### Evidence

Image and associated metadata attached during initial reporting, completion, or contest.

### Support

Private relationship between a reporter and an issue, exposed publicly only as a count or optional alias.

### StatusEvent

Immutable transition event containing previous status, new status, public note, optional evidence, and timestamp.

### Confirmation

Resident decision that a repair is fixed or contested, with new evidence when required.

### ShareAward

Generated recognition asset linked to a confirmed outcome and ward.

## 11. Success metrics

### MVP usability

- Median report completion time below 60 seconds when photo analysis and location succeed.
- At least 80% of test users submit without typing a description.
- At least 90% of test users correctly understand the current issue status.
- At least 80% can identify the responsible department and escalation path.
- At least 90% can distinguish confirming a fix from contesting it.

### Product outcomes for a real pilot

- Report completion rate.
- Duplicate reports consolidated into existing issues.
- Time from report to acknowledgement and completion.
- Percentage of claimed fixes confirmed by residents.
- Percentage of claimed fixes contested.
- Repeat reporting rate after a confirmed fix.
- Share-card generation and share completion rates.
- Satisfaction with resolution, separated from satisfaction with intake.

Volume of filed reports alone is not a success metric because it can reward duplication and unresolved demand.

## 12. MVP acceptance criteria

- A guest can complete the prepared photo-reporting flow without entering contact information.
- The camera/gallery, location, AI review, duplicate suggestion, and submission steps are functional.
- A resident can support an existing issue without exposing personal information.
- All seeded statuses render correctly.
- The public proof trail preserves chronological events.
- An awaiting-confirmation issue can be confirmed or contested.
- Contesting appends evidence and reopens the same issue.
- A confirmed issue can generate and download/share a story card.
- English and Hindi flows remain usable without clipped content.
- The bottom navigation remains visible while screen content scrolls.
- The production build passes linting and TypeScript checks.
- The static demo is available through GitHub Pages.

## 13. Technical implementation

- **Frontend:** Next.js, React, TypeScript.
- **Mobile components:** Ant Design Mobile.
- **Mapping:** Leaflet with OpenStreetMap tiles.
- **Localization:** Curated English/Hindi dictionaries.
- **AI:** OpenAI Responses API with image input and structured JSON output in server-capable deployments.
- **Persistence foundation:** Supabase Postgres, Storage, and row-level security schema.
- **Static demo hosting:** GitHub Pages with deterministic prepared-image analysis.
- **Server-capable hosting:** A Next.js-compatible host is required for live OpenAI processing and persistent writes.

## 14. Risks and mitigations

### Incorrect AI classification

**Mitigation:** Treat all extracted fields as editable suggestions and require resident review.

### Duplicate suggestion is wrong

**Mitigation:** Keep an explicit path to submit a distinct issue and avoid automatic irreversible merges.

### False confirmation or malicious contest

**Mitigation:** Preserve evidence and full event history; add rate limiting, verified accounts, and consensus rules during a real pilot.

### Misleading government accountability data

**Mitigation:** Show departments and operational roles rather than fabricated individual performance scores. Verify all real-world routing data before launch.

### Privacy leakage through photos

**Mitigation:** Remove metadata, moderate uploads, avoid identifying people, and provide reporting/removal mechanisms before production.

### Static demo mistaken for a live government service

**Mitigation:** Keep the hackathon environment clearly separated from any real municipal deployment and do not submit demo cases to government systems.

## 15. Post-hackathon roadmap

### Phase 1 — Functional pilot

- Connect reports, evidence, supports, and status events to Supabase.
- Add secure anonymous sessions and optional OTP verification.
- Integrate live AI extraction and image moderation.
- Add real duplicate detection using location radius and image/text similarity.
- Build operational audit logs and abuse controls.

### Phase 2 — Municipal integration

- Select one partner ward or city.
- Verify jurisdiction, department, escalation, and service-window data.
- Integrate with the municipality's grievance system where APIs exist.
- Add a lightweight officer queue and completion-proof workflow.
- Pilot resident confirmation rules and disputed-closure escalation.

### Phase 3 — Scale and participation

- Add push, SMS, WhatsApp, or email updates based on resident consent.
- Support more Indian languages.
- Add accessibility testing with residents using assistive technology.
- Add ward-level service analytics without ranking individual residents or incentivizing complaint spam.
- Introduce recognition based on verified outcomes and constructive participation.

## 16. Open product decisions before a real pilot

- Which city and ward will provide authoritative jurisdiction data?
- Which system is the official source of case status?
- Who is eligible to confirm a fix: original reporter, any supporter, nearby verified residents, or a defined quorum?
- How long should a claimed fix remain open for resident confirmation?
- What evidence is mandatory for each issue category?
- What moderation and appeals process applies to harmful or misleading uploads?
- What retention period applies to contact information and photographs?
- Which channels are legally and operationally approved for escalation?

These decisions require municipal, legal, privacy, and resident input and must not be inferred from the hackathon prototype.
