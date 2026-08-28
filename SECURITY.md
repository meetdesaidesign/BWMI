# Security policy

## Supported versions

Fixo is a hackathon prototype and does not currently publish supported release versions or security updates. The latest commit on the default branch is the only version considered for fixes.

## Reporting a vulnerability

Please **do not open a public GitHub issue** for a suspected vulnerability.

Use GitHub's **Report a vulnerability** option in the repository's **Security** tab to submit a private report. If private vulnerability reporting is unavailable, contact a repository maintainer privately and ask for a secure reporting channel without including exploit details in the initial message.

Include, when possible:

- A clear description of the issue and its potential impact.
- The affected route, component, configuration, or commit.
- Reproduction steps or a minimal proof of concept.
- Any conditions required for exploitation.
- Suggested mitigations, if known.

Do not access, modify, or retain data that does not belong to you. Give maintainers reasonable time to investigate before discussing the report publicly.

## Secrets and personal data

Never commit API keys, service-role credentials, `.env.local` files, or real resident data. If a credential is exposed, revoke or rotate it immediately; removing it from the latest commit is not sufficient because it may remain in Git history.
