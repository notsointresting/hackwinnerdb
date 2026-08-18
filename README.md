<h1 align="center">🏆 HackWinnerDB</h1>

<p align="center">The open-source database of hackathon winners.</p>

<p align="center">
  <a href="https://hackwinnerdb.vercel.app">Website</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="public/dataset">Dataset</a> ·
  <a href="LICENSE">License</a>
</p>

---

## What is HackWinnerDB?

HackWinnerDB is a community-maintained open database of projects that have **won** hackathons —
searchable by technology, category, year, event, award, and source. Every published winner carries a
public source that confirms the award.

The repository contains two products:

1. **The dataset** — plain YAML in `data/`, usable without ever running the website.
2. **The website** — a Next.js app that indexes, searches, and presents that data.

## Why it exists

Hackathon winners are scattered across event sites that expire, Devpost galleries, blog posts,
social threads, and README files. A year later the project is hard to find and the award is hard to
confirm. HackWinnerDB preserves them in one open, searchable index.

## Search the database

<!-- Screenshots: to be added once the site is deployed. -->

Visit the site to search projects, hackathons, technologies, and categories (⌘K anywhere), filter by
year, award, category, technology, and source, and share any filtered view as a URL:

```
/projects?year=2024&technology=gemini&category=healthcare
```

## Dataset

Generated on every build into `public/dataset/`:

| File | Contents |
| --- | --- |
| `hackwinnerdb.json` | everything, including taxonomies |
| `hackathons.json` / `.csv` | events |
| `projects.json` / `.csv` | projects |
| `entries.json` / `.csv` | award records linking projects to hackathons |

Dataset license: **CC BY 4.0** ([DATA_LICENSE.md](DATA_LICENSE.md)). Code license: **MIT**.

## Add a winner

Three ways, no account on the website required:

1. **Issue form** — [Add a hackathon winner](../../issues/new?template=add-winner.yml).
2. **CLI** — `npm run add:winner`, then open a pull request.
3. **By hand** — write the YAML against [DATA_GUIDELINES.md](DATA_GUIDELINES.md).

Every winner needs a public source that confirms the award.

## Repository structure

```
data/
  hackathons/<year>/   event records
  projects/            project records
  entries/             project + hackathon + awards + source
  taxonomies/          categories, technologies, award types
  sources.yaml         accepted source platforms
src/
  app/                 Next.js App Router routes
  components/          UI components
  lib/                 repository, search, queries, helpers
  schemas/             Zod schemas (the contract for all data)
  types/
scripts/
  add-winner.ts        interactive contribution CLI
  validate-data.ts     schema + cross-file validation
  check-duplicates.ts  duplicate detection
  generate-dataset.ts  JSON/CSV dataset build
  data-summary.ts      PR summary for data changes
public/dataset/        generated dataset artifacts
tests/                 Vitest unit tests and Playwright smoke tests
```

## Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

Requires Node 20+ (CI uses Node 22).

## Data schema

See [DATA_GUIDELINES.md](DATA_GUIDELINES.md). The model is deliberately three-part:

```
Project  ->  Entry  ->  Hackathon
                 \
                  ->  Award(s)
```

A project can enter many hackathons and win many awards; an entry ties one project to one hackathon
with its awards and its source evidence.

## Validation

```bash
npm run validate:data     # Zod + referential integrity + uniqueness; exits non-zero on failure
npm run check:duplicates  # fuzzy duplicate warnings, hard constraint failures
npm run generate:data     # rebuild public/dataset
npm run typecheck && npm run lint && npm test && npm run test:e2e
```

## Contribution guidelines

[CONTRIBUTING.md](CONTRIBUTING.md) · [DATA_GUIDELINES.md](DATA_GUIDELINES.md) ·
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

## Architecture

```
Contributor -> Pull request -> CI validation -> Review -> merge to main
                                                            |
                                             Vercel build (generate:data + next build)
                                                            |
                                                     Production website
```

Git stays canonical. The UI talks to two seams — `DataRepository` (`src/lib/load-dataset.ts`) and
`SearchProvider` (`src/lib/search.ts`) — so a Postgres or Meilisearch mirror can be added later
without rewriting components.

### Vercel deployment

Import the repository in Vercel and accept the defaults (framework: Next.js, build command
`npm run build`, which runs `generate:data` first). Vercel's Git integration then builds every pull
request as a preview and deploys `main` to production automatically. No environment variables are
required; set `NEXT_PUBLIC_SITE_URL` to your production URL so canonical links and the sitemap point
at the right host.

## Roadmap

- broaden coverage beyond the seed corpus (more platforms, more regions, more years)
- richer hackathon metadata (tracks, sponsors, judges) where sources exist
- optional Postgres/Meilisearch mirror behind the existing interfaces
- assisted (never automatic) import tooling once the schema has proven itself

## License

Code: [MIT](LICENSE). Data: [CC BY 4.0](DATA_LICENSE.md).

## Contributors

Thanks to everyone who adds a winner — see the
[contributors graph](../../graphs/contributors).
