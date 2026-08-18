# Staging area for imported drafts

`scripts/import/*` writes **drafts** here. Nothing in this directory is published:
the site and `npm run validate:data` only read `data/hackathons`, `data/projects`,
and `data/entries`.

Generated `.yaml` files here are gitignored — they are working notes, not data.

## Promoting a draft

1. Open the source URL and confirm the award is real and matches the title.
2. Replace every `TODO`, including an **original** summary in your own words.
   Never paste the description from the source page.
3. Choose the award `type`, the `categories`, and the hackathon `year`.
4. Map or add any technologies to `data/taxonomies/technologies.yaml`.
5. Set `verification.status: verified` only after *you* checked the source.
6. Move the file into `data/projects/`, `data/entries/`, or
   `data/hackathons/<year>/` and drop the filename prefix.
7. Run `npm run validate:data && npm run check:duplicates`.

An import is a research shortcut, not a substitute for verification.
