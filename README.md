<h1 align="center">🏆 HackWinnerDB</h1>

<p align="center"><strong>The open-source database of hackathon winners.</strong></p>
<p align="center">Explore what wins hackathons — by technology, category, year, event, award, and source.</p>

<p align="center">
  <a href="https://github.com/notsointresting/hackwinnerdb/actions/workflows/ci.yml"><img alt="CI" src="https://github.com/notsointresting/hackwinnerdb/actions/workflows/ci.yml/badge.svg"></a>
  <a href="LICENSE"><img alt="Code license: MIT" src="https://img.shields.io/badge/code-MIT-blue.svg"></a>
  <a href="DATA_LICENSE.md"><img alt="Data license: CC BY 4.0" src="https://img.shields.io/badge/data-CC%20BY%204.0-green.svg"></a>
  <a href="../../issues/new?template=add-winner.yml"><img alt="Add a winner" src="https://img.shields.io/badge/contribute-add%20a%20winner-a86a00.svg"></a>
</p>

<p align="center">
  <a href="#-add-a-winner-2-minutes">Add a winner</a> ·
  <a href="CONTRIBUTING.md">Contributing</a> ·
  <a href="DATA_GUIDELINES.md">Data schema</a> ·
  <a href="#-dataset">Dataset</a> ·
  <a href="#-model-context-protocol-mcp">MCP</a> ·
  <a href="#-local-development">Development</a>
</p>

---

## 🏁 Add a winner (2 minutes)

**You do not need to code, and you do not need an account anywhere except GitHub.**

Know a project that won a hackathon? Add it:

### → [Open the "Add a hackathon winner" form](../../issues/new?template=add-winner.yml)

You need exactly four things:

| Field | Example |
| --- | --- |
| Hackathon + year | Google AI Hackathon, 2024 |
| Project name | Nested |
| Award, as published | First Place Overall |
| **A public source URL that proves it** | https://devpost.com/software/nested |

A maintainer turns your issue into data, and the site updates on merge. That is the whole loop.

Prefer a pull request? Run `npm run add:winner` — see [CONTRIBUTING.md](CONTRIBUTING.md).

Found something wrong? → [Suggest a correction](../../issues/new?template=correct-data.yml)

## 🤔 What is HackWinnerDB?

A community-maintained open database of projects that have **won** hackathons — Devpost, DoraHacks,
MLH, Unstop, HackerEarth, lablab.ai, university and company events, anywhere.

The repository contains two products:

1. **The dataset** — plain YAML in `data/`, usable without ever running the website.
2. **The website** — a Next.js app that indexes, searches, and presents that data.

**GitHub is the source of truth.** No CMS, no database, no login. A winner enters through a pull
request, CI validates it, a maintainer checks the source, and merging to `main` deploys the site.

## 🧭 Why it exists

Hackathon winners are scattered across event sites that expire, Devpost galleries, blog posts,
social threads, and README files. A year later the project is hard to find and the award is
impossible to confirm.

**Every published winner carries a public source. No source, no entry.**

## 🔍 Search the database

- Full-text search across project names, taglines, summaries, hackathons, organizers, technologies,
  categories, builders, and awards — with typo tolerance.
- `⌘K` / `Ctrl K` command palette anywhere on the site.
- Filters for year, award, category, technology, source, and has GitHub / demo / video / verified.
- Every filter lives in the URL, so any view is shareable:

```
/projects?year=2024&technology=gemini&category=accessibility
```

<!-- Screenshots go here once the site is deployed. -->

## 📦 Dataset

Regenerated from `data/` on every build, into `public/dataset/`:

| File | Contents |
| --- | --- |
| `hackwinnerdb.json` | everything, including taxonomies |
| `hackathons.json` / `.csv` | events |
| `projects.json` / `.csv` | projects |
| `entries.json` / `.csv` | award records linking projects to hackathons |

Data license: **CC BY 4.0** ([DATA_LICENSE.md](DATA_LICENSE.md)) · Code license: **MIT**
([LICENSE](LICENSE)). Never edit `public/dataset/` by hand — it is generated.

## 🔌 Model Context Protocol (MCP)

The database is queryable by AI coding tools and agents over MCP, so an assistant can
look up prior art without leaving the editor. The endpoint is read-only, needs no key,
and is free.

Endpoint: `https://hackwinnerdb.netlify.app/api/mcp` (streamable HTTP)

Add it to Claude Code:

```bash
claude mcp add --transport http hackwinnerdb https://hackwinnerdb.netlify.app/api/mcp
```

Or add it to any client that reads an `mcpServers` config (Cursor, Windsurf, VS Code):

```json
{
  "mcpServers": {
    "hackwinnerdb": {
      "type": "http",
      "url": "https://hackwinnerdb.netlify.app/api/mcp"
    }
  }
}
```

| Tool | What it does |
| --- | --- |
| `search_winners` | search winners by text, category, technology, year, or award |
| `get_project` | one project, its full summary, and every award it has won |
| `get_hackathon` | one event, its dates and scale, and its full winner list |
| `list_facets` | the valid filter slugs, plus dataset totals |
| `how_to_cite` | the required credit line in plain text, Markdown, HTML, and BibTeX |

### Attribution

The dataset is **CC BY 4.0**, so credit is a licence term rather than a courtesy, and the
server is built so an agent cannot miss it. The requirement is stated in the instructions
the client reads on connect, and every single tool result carries an `attribution` block
with the exact line to reproduce:

> Data from HackWinnerDB (https://hackwinnerdb.netlify.app), licensed CC BY 4.0.

Every record also carries its own page `url` and the `source_url` of the original
submission, so an assistant can link the record instead of presenting the facts as its own.

## 🗂 Repository structure

```
data/
  hackathons/<year>/   event records
  projects/            project records
  entries/             project + hackathon + awards + source evidence
  taxonomies/          categories, technologies, award types
  sources.yaml         accepted source platforms
src/
  app/                 Next.js App Router routes
  app/api/mcp/         Model Context Protocol endpoint (JSON-RPC over HTTP)
  components/          UI components
  lib/                 repository, search, queries, helpers
  lib/mcp/             MCP tool definitions and the CC BY attribution they carry
  schemas/             Zod schemas — the contract for all data
scripts/
  add-winner.ts        interactive contribution CLI
  validate-data.ts     schema + cross-file validation
  check-duplicates.ts  duplicate detection
  generate-dataset.ts  JSON/CSV dataset build
  data-summary.ts      PR summary for data changes
public/dataset/        generated dataset artifacts
tests/                 Vitest unit tests + Playwright smoke tests
```

## 💻 Local development

```bash
npm install
npm run dev          # http://localhost:3000
```

Node 20+ (CI runs Node 22). No environment variables required; set `NEXT_PUBLIC_SITE_URL` if you
deploy your own copy.

## 🧬 Data schema

```
Project  ->  Entry  ->  Hackathon
                 \
                  ->  Award(s)
```

A project is **not** owned by one hackathon. It can enter many and win many awards; an **entry**
links one project to one hackathon with its awards and its source evidence.

Full field-by-field reference: [DATA_GUIDELINES.md](DATA_GUIDELINES.md).

## ✅ Validation

```bash
npm run validate:data     # Zod + referential integrity + uniqueness; non-zero exit on failure
npm run check:duplicates  # fuzzy duplicate warnings, hard constraint failures
npm run generate:data     # rebuild public/dataset
npm run typecheck && npm run lint && npm test && npm run test:e2e
```

Invalid data cannot merge: CI runs typecheck → lint → validate → duplicate check → unit tests →
build → Playwright smoke tests on every pull request.

## 🙌 Ways to contribute

| I want to… | Do this |
| --- | --- |
| Add one winner I know about | [Add-winner issue form](../../issues/new?template=add-winner.yml) |
| Add several winners from one event | `npm run add:winner`, then one PR per event |
| Fix a wrong award, link, or spelling | [Correction form](../../issues/new?template=correct-data.yml) or edit the YAML |
| Add a missing technology or category | PR against `data/taxonomies/` |
| Write code | Pick a [good first issue](../../labels/good%20first%20issue) |
| Report a bug or request a feature | [Issue templates](../../issues/new/choose) |

Read [CONTRIBUTING.md](CONTRIBUTING.md) before your first pull request ·
[CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) · [SECURITY.md](SECURITY.md)

**House rules:** every winner needs a public source; write your own summaries (never paste from
Devpost or blogs); use canonical slugs from `data/taxonomies/`.

## 🏗 Architecture

```
Contributor -> Pull request -> CI validation -> Maintainer review -> merge to main
                                                                        |
                                                  Vercel build (generate:data + next build)
                                                                        |
                                                                 Production website
```

The MCP endpoint (`src/app/api/mcp/route.ts`) is a third consumer of the same seams, so agents and
the website read identical data with no separate pipeline.

Git stays canonical. The UI talks to two seams — `DataRepository` (`src/lib/load-dataset.ts`) and
`SearchProvider` (`src/lib/search.ts`) — so a Postgres or Meilisearch mirror can be added later
without rewriting a single component.

### Deploying your own copy

Import the repository in Vercel and accept the defaults (framework Next.js, build command
`npm run build`, which runs `generate:data` first). Vercel builds every pull request as a preview and
deploys `main` to production automatically.

## 🗺 Roadmap

- [ ] Broaden coverage beyond the seed corpus — more platforms, regions, and years
- [ ] Richer hackathon metadata (tracks, sponsors, judges) where sources exist
- [ ] Maintainer script that converts an add-winner issue into YAML
- [x] MCP endpoint so AI coding tools can query the database directly
- [x] Serve the MCP endpoint from the prebuilt dataset JSON to cut its cold start
- [ ] Optional Postgres/Meilisearch mirror behind the existing interfaces
- [ ] Assisted (never fully automatic) import tooling once the schema has proven itself

Scrapers are deliberately **not** in V1 — the schema gets proven against hand-curated records first.

## 📄 License

Code: [MIT](LICENSE). Data: [CC BY 4.0](DATA_LICENSE.md).

## 👥 Contributors

Every record in here was added by a person. Thank you →
[contributors graph](../../graphs/contributors).
