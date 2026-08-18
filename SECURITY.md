# Security policy

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Use GitHub's private vulnerability reporting on this repository
(Security → Report a vulnerability), or contact a maintainer directly. Include:

- what you found and where
- steps to reproduce
- the impact you think it has

You can expect an initial response within seven days. Valid reports are fixed on `main` and
deployed automatically.

## Scope

In scope:

- the Next.js website in `src/`
- the CLI and CI scripts in `scripts/`
- the GitHub Actions workflows in `.github/workflows/`

Out of scope:

- vulnerabilities in third-party sites we link to
- factual errors in the dataset — use the
  [correction issue form](../../issues/new?template=correct-data.yml) instead

## Data integrity

HackWinnerDB stores no user accounts, no credentials, and no personal data beyond publicly published
builder names and profile links. Every data change is reviewed in a pull request and validated by CI
before it can reach production.
