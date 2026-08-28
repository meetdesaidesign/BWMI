# Contributing to Fixo

Thank you for helping improve Fixo. This document keeps contributions focused, reviewable, and safe.

## Before you start

1. Search existing issues and pull requests to avoid duplicating work.
2. Open an issue before making a large product or architecture change.
3. Keep changes narrowly scoped; unrelated cleanup should use a separate pull request.
4. Never include real resident information, municipal credentials, or API keys in fixtures, screenshots, logs, or commits.

## Local setup

```bash
npm ci --legacy-peer-deps
cp .env.example .env.local
npm run dev
```

The app provides deterministic demo image analysis when `OPENAI_API_KEY` is unset, so a paid API account is not needed for development.

## Making a change

- Follow the existing TypeScript, React, and design-system patterns.
- Keep resident-facing text clear, inclusive, and understandable in a civic context.
- Preserve mobile usability, keyboard access, and meaningful accessible labels.
- Update both English and Hindi content when changing translated resident-facing copy.
- Add or update documentation when behavior, configuration, or workflows change.
- Do not edit generated design-token output by hand; use `npm run tokens` when appropriate.

## Validate your work

Run all checks before submitting:

```bash
npm run typecheck
npm run lint
npm run build
```

For visual changes, also check the affected flow at mobile and desktop widths and include before-and-after screenshots in the pull request.

## Pull requests

- Use a concise, action-oriented title.
- Complete the pull request template.
- Explain the user impact and any tradeoffs.
- Link the relevant issue when one exists.
- Call out skipped checks and explain why they were skipped.
- Keep generated files in the same commit as the source change that produced them.

By contributing, you agree that your contribution may be used under the repository's applicable project terms.
