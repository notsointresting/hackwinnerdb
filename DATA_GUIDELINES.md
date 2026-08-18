# Data guidelines

All data lives in `data/` as YAML. Every file is validated against a Zod schema
(`src/schemas/index.ts`) by `npm run validate:data`.

## The model

```
Project  ->  Entry  ->  Hackathon
                 \
                  ->  Award(s)
```

A project is not owned by one hackathon. It can enter several hackathons and win several awards; an
**entry** is the link between a project, a hackathon, the awards it won there, and the source that
proves it.

## Hackathon — `data/hackathons/<year>/<id>.yaml`

```yaml
id: google-ai-hackathon-2024        # required, kebab-case
name: Google AI Hackathon           # required
slug: google-ai-hackathon-2024      # required, unique
year: 2024                          # required
sources:                            # required, at least one public URL
  - https://googleai.devpost.com/
organizer:                          # optional
  - Google
start_date: 2024-03-18              # optional, YYYY-MM-DD, must precede end_date
end_date: 2024-05-03                # optional
mode: online                        # optional: online | in-person | hybrid
location: null                      # optional
website_url: https://googleai.devpost.com/   # optional
participant_count: 15476            # optional
total_submissions: null             # optional
prize_pool: 50000                   # optional, requires currency
currency: USD                       # optional, ISO 4217
platform: devpost                   # optional source platform
description: >                      # optional, original wording
  Short original summary written by a contributor.
```

## Project — `data/projects/<id>.yaml`

```yaml
id: medsafe
name: MedSafe
slug: medsafe
tagline: AI-assisted medication safety platform   # required, <= 160 chars
summary: >                                        # required, original wording
  Short original description of what the project does.
problem: null        # optional
solution: null       # optional
website_url: null
github_url: null
demo_url: null
video_url: null
categories:          # required, canonical slugs from data/taxonomies/categories.yaml
  - healthcare
technologies:        # canonical slugs from data/taxonomies/technologies.yaml
  - python
builders:
  - name: Example Builder
    github: null
    linkedin: null
    website: null
```

## Entry — `data/entries/<project-id>-<hackathon-id>.yaml`

```yaml
id: medsafe-google-ai-hackathon-2026
project_id: medsafe                 # must exist in data/projects
hackathon_id: google-ai-hackathon-2026   # must exist in data/hackathons
submission_url: https://...
source:                             # required — this is the proof
  platform: devpost
  url: https://...
  external_id: null
awards:                             # required, at least one
  - type: grand-prize               # from the award-type vocabulary
    title: Grand Prize              # the award exactly as published
    rank: 1
    track: null
    sponsor: null
    prize_amount: 10000             # requires currency when set
    currency: USD
verification:
  status: verified                  # verified | unverified | disputed
  checked_at: 2026-08-18
  notes: null
```

### Award types

`grand-prize`, `winner`, `first-place`, `second-place`, `third-place`, `category-winner`,
`track-winner`, `sponsor-prize`, `audience-choice`, `community-choice`, `honorable-mention`,
`finalist`, `other`.

## Taxonomies — `data/taxonomies/`

- `categories.yaml` — controlled category vocabulary. Categories are never free text.
- `technologies.yaml` — canonical technology slugs with a `type`
  (`language`, `framework`, `ai-model`, `ai-platform`, `database`, `cloud`, `hardware`,
  `blockchain`, `api`, `tool`, `platform`, `other`).
- `award-types.yaml` — award vocabulary plus the `weight` used to rank awards.
- `../sources.yaml` — the source platforms an entry may cite.

## What the validator enforces

- required fields, valid dates, valid URLs, ISO 4217 currency codes
- category and technology references exist in the taxonomies
- award types are known, ranks are sane, prize amounts carry a currency
- `project_id` and `hackathon_id` resolve to real records
- no duplicate ids, slugs, or project+hackathon pairs
- years within a plausible range
- every entry has a source URL

Validation failure exits non-zero, so invalid data can never merge.

## Copyright

Contribute **facts, links, and original paraphrases**. Do not copy descriptions, taglines, or
write-ups verbatim from Devpost, organizer blogs, or project pages. Link to the original instead.
