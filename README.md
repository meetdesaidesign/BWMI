# Pakka

A mobile-first civic reporting prototype built around one rule: a repair is not finished until a resident confirms it.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without an `OPENAI_API_KEY`, image analysis uses a clearly labelled deterministic demo result so the full hackathon path still works. Add a key to enable real image extraction through the server-only Responses API route.

## Demo path

1. Open a nearby issue to inspect its public proof trail or back it.
2. Tap the orange Report control, choose/take a photo, allow or decline location, and review AI suggestions.
3. Enter any demo contact value and submit.
4. Open “Overflowing bin near metro gate” to confirm or contest the claimed fix.
5. Confirm it to generate, share, or download the 1080×1920 Proof Keeper card.
6. Toggle English/Hindi from the header.

All ward, official, contact, issue, and performance data is fictional and labelled as illustrative. Browser state is intentionally local for a self-contained judge demo; [`supabase/schema.sql`](supabase/schema.sql) contains the production persistence/RLS foundation.

## Environment

- `OPENAI_API_KEY`: enables real vision extraction.
- `OPENAI_MODEL`: defaults to `gpt-5.4-mini`.
- Supabase variables are reserved for the persistence phase after the self-contained hackathon demo.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
