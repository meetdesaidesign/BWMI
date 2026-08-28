<div align="center">
  <img src="public/brand/fixo-logo-horizontal.svg" alt="Fixo" width="220">

  <h3>Report it. Track it. Confirm it.</h3>

  <p>A mobile-first civic reporting prototype where a repair is not finished until a resident confirms it.</p>
</div>

## About

Fixo helps residents report public infrastructure problems, follow the public proof trail, and verify that repairs were actually completed. The prototype is designed for Indian cities and supports English and Hindi.

> [!IMPORTANT]
> Fixo is a hackathon prototype, not an official municipal service or an emergency reporting channel. All ward, official, contact, issue, and performance data in the demo is fictional and illustrative.

### What you can do

- Report an issue using a photo and optional location.
- Review and edit AI-suggested issue details before submitting.
- Find nearby reports and support an existing issue instead of creating a duplicate.
- Follow a chronological, evidence-based status trail.
- Confirm a completed repair or reopen one that is still broken.
- Generate a privacy-safe social card for a verified fix.
- Switch between English and Hindi.

For the product goals and complete feature requirements, see the [product requirements document](docs/PRD.md).

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22 or later
- npm (included with Node.js)

### Installation

```bash
npm ci --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

An OpenAI API key is **not required** to explore the full demo. Without one, image analysis returns a clearly labelled deterministic sample result. Add a key only when you want to use live image extraction through the server-only Responses API route.

## Demo walkthrough

1. Open a nearby issue to inspect its updates, or select **I see this too**.
2. Select **Report**, add a photo, and allow or decline location access.
3. Review the suggested details and submit the report.
4. Open the waste issue near the metro gate and confirm the fix or reopen it.
5. Confirm the fix to create, share, or download a 1080 × 1920 card.
6. Use the labelled **Language** control in the header to switch between हिंदी and English.

Browser state is intentionally stored locally to keep the judge demo self-contained. [`supabase/schema.sql`](supabase/schema.sql) provides the production persistence and row-level security foundation.

## Configuration

Copy [`.env.example`](.env.example) to `.env.local` and set only the values you need:

| Variable | Required | Purpose |
| --- | :---: | --- |
| `OPENAI_API_KEY` | No | Enables live image analysis. Never expose this server-side secret in the browser. |
| `OPENAI_MODEL` | No | Selects the image-analysis model; defaults to `gpt-5.4-mini`. |
| `NEXT_PUBLIC_CARTO_API_KEY` | No | Loads CARTO Voyager map tiles. The app falls back to Esri World Street Map tiles. |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Reserved for the future persistence integration. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | Reserved for the future persistence integration. |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Reserved server-side credential for the future persistence integration. |
| `NEXT_PUBLIC_DEMO_SAMPLE` | No | Shows the sample-report shortcut when explicitly set to `true`. |

Do not commit `.env.local` or any real credentials. If a secret is exposed, rotate it immediately.

## Available scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server. |
| `npm run build` | Create a production build. |
| `npm run start` | Serve the production build. |
| `npm run lint` | Run ESLint across the repository. |
| `npm run typecheck` | Check TypeScript without emitting files. |
| `npm run tokens` | Regenerate design-token artifacts. |

## Project structure

```text
app/            Next.js routes, layouts, and server endpoints
components/     Shared product components
design-system/  Design tokens and generated theme assets
docs/           Product documentation
lib/            Domain data, utilities, and integrations
public/         Static images, icons, and brand assets
supabase/       Database schema and row-level security foundation
types/          Shared TypeScript declarations
```

## Quality checks

Before opening a pull request, run:

```bash
npm run typecheck
npm run lint
npm run build
```

## Deployment

The workflow in [`.github/workflows/pages.yml`](.github/workflows/pages.yml) publishes a static demo to GitHub Pages on pushes to `main`. The static build excludes the server-only image-analysis endpoint and uses demo analysis instead. Configure `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` as a GitHub Actions secret if the deployment should use Google Maps.

## Contributing and security

Contributions are welcome. Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request, and use the repository templates when reporting bugs or proposing improvements.

Please do not disclose vulnerabilities in a public issue. Follow the private reporting guidance in [SECURITY.md](SECURITY.md).

## Project status

Fixo is an experimental hackathon MVP. It is not production-ready, does not replace a municipal system of record, and should not be used to report police, fire, medical, or other emergencies.
