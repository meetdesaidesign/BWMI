# Fixo

<img src="public/brand/fixo-mark-purple.svg" alt="Fixo" width="72" height="72">

A mobile-first civic reporting prototype built around one rule: a repair is not finished until a resident confirms it.

## Run locally

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000`. Without an `OPENAI_API_KEY`, image analysis uses a clearly labelled deterministic demo result so the full hackathon path still works. Add a key to enable real image extraction through the server-only Responses API route.

## Demo path

1. Open a nearby issue to see its updates, or tap **I see this too**.
2. Tap Report, add a photo, allow or decline location, and check the details.
3. Check the details and submit the report.
4. Open the waste issue near the metro gate to confirm the fix or reopen it.
5. Confirm it to make, share, or download a 1080×1920 card.
6. Switch language from the header. The control is labelled Language and shows हिंदी / English.

All ward, official, contact, issue, and performance data is fictional and labelled as illustrative. Browser state is intentionally local for a self-contained judge demo; [`supabase/schema.sql`](supabase/schema.sql) contains the production persistence/RLS foundation.

## Environment

- `OPENAI_API_KEY`: enables real vision extraction.
- `OPENAI_MODEL`: defaults to `gpt-5.4-mini`.
- `NEXT_PUBLIC_CARTO_API_KEY`: optional. Loads CARTO Voyager tiles. Without it, Nearby uses Esri World Street Map tiles (no key, no watermark). Request a free CARTO key at https://carto.com/basemaps/apikey.
- Supabase variables are reserved for the persistence phase after the self-contained hackathon demo.

## Checks

```bash
npm run typecheck
npm run lint
npm run build
```
