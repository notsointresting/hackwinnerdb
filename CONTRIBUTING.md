# Contributing to HackWinnerDB

Thanks for helping build an open record of what wins hackathons. There are three ways in,
depending on how much tooling you want to touch.

## Level 1 — no code required

Open the [Add a hackathon winner](../../issues/new?template=add-winner.yml) issue form and fill in
what you know. The only hard requirement is a **public source URL that confirms the award**.
A maintainer turns the issue into data.

Found a mistake instead? Use the [Suggest a correction](../../issues/new?template=correct-data.yml)
form.

## Level 2 — guided pull request

```bash
# 1. Fork, then clone your fork
git clone https://github.com/<you>/hackwinnerdb.git
cd hackwinnerdb

# 2. Install
npm install

# 3. Add a winner interactively
npm run add:winner

# 4. Validate what you added
npm run validate:data
npm run check:duplicates

# 5. Commit on a branch and open a pull request
git checkout -b add-<project>-<hackathon>
git add data
git commit -m "Add <project> — <hackathon> <year>"
git push -u origin HEAD
```

`npm run add:winner` asks for the hackathon, the project, the award, and the source, then writes the
YAML files for you. It reuses an existing hackathon or project when one already matches, warns about
near-duplicate project names, and never overwrites an existing file.

## Level 3 — write the YAML by hand

Read [DATA_GUIDELINES.md](DATA_GUIDELINES.md) for the full schema of every record type and the rules
the validator enforces. The schemas themselves live in `src/schemas/index.ts` and are the final word.

## Ground rules

- **Every winner needs a source.** No source, no entry.
- **Write your own summaries.** Do not paste descriptions from Devpost, blogs, or README files.
  Facts, URLs, and short original paraphrases only.
- **Use canonical slugs** from `data/taxonomies/categories.yaml` and
  `data/taxonomies/technologies.yaml`. Adding a new technology is fine — add it to the taxonomy file
  in the same pull request.
- **Do not edit generated files** in `public/dataset/`; they are rebuilt from `data/`.
- **No scrapers yet.** V1 is deliberately hand-curated so the schema is proven against real records.

## Local development

```bash
npm run dev            # start the site at http://localhost:3000
npm run validate:data  # Zod + cross-file validation, non-zero exit on failure
npm run check:duplicates
npm run generate:data  # regenerate public/dataset/*.json and *.csv
npm run typecheck
npm run lint
npm test               # Vitest
npm run test:e2e       # Playwright smoke tests
```

## Review

Pull requests run typecheck, lint, data validation, duplicate detection, unit tests, a production
build, and Playwright smoke tests. Data pull requests also get an automatic summary comment. A
maintainer checks that each source really confirms the award before merging.
