#!/usr/bin/env tsx
/**
 * Validates every YAML record against the Zod schemas plus the cross-file rules
 * (referential integrity, uniqueness, source provenance). Exits non-zero on failure.
 */
import { z } from "zod";
import {
  awardTypesFileSchema,
  categoriesFileSchema,
  entrySchema,
  hackathonSchema,
  projectSchema,
  sourcesFileSchema,
  technologiesFileSchema,
} from "../src/schemas";
import { loadRaw, rel } from "./lib-load";

const errors: string[] = [];
const fail = (where: string, message: string) => errors.push(`${where}: ${message}`);

function reportZod(where: string, error: z.ZodError) {
  for (const issue of error.issues) {
    fail(where, `${issue.path.join(".") || "(root)"} — ${issue.message}`);
  }
}

function parseEach<T>(
  files: { file: string; data: unknown }[],
  schema: z.ZodType<T>,
): { file: string; value: T }[] {
  const out: { file: string; value: T }[] = [];
  for (const { file, data } of files) {
    const result = schema.safeParse(data);
    if (!result.success) reportZod(rel(file), result.error);
    else out.push({ file, value: result.data });
  }
  return out;
}

function assertUnique(
  label: string,
  items: { file: string; key: string }[],
) {
  const seen = new Map<string, string>();
  for (const { file, key } of items) {
    const prev = seen.get(key);
    if (prev) fail(rel(file), `duplicate ${label} "${key}" (already used in ${rel(prev)})`);
    else seen.set(key, file);
  }
}

function main() {
  const raw = loadRaw();

  const taxonomy = {
    categories: categoriesFileSchema.safeParse(raw.categories),
    technologies: technologiesFileSchema.safeParse(raw.technologies),
    awardTypes: awardTypesFileSchema.safeParse(raw.awardTypes),
    sources: sourcesFileSchema.safeParse(raw.sources),
  };
  for (const [name, result] of Object.entries(taxonomy)) {
    if (!result.success) reportZod(`data/taxonomies/${name}`, result.error);
  }

  const categorySlugs = new Set(
    taxonomy.categories.success ? taxonomy.categories.data.map((c) => c.slug) : [],
  );
  const technologySlugs = new Set(
    taxonomy.technologies.success ? taxonomy.technologies.data.map((t) => t.slug) : [],
  );

  const hackathons = parseEach(raw.hackathons, hackathonSchema);
  const projects = parseEach(raw.projects, projectSchema);
  const entries = parseEach(raw.entries, entrySchema);

  assertUnique("hackathon id", hackathons.map((h) => ({ file: h.file, key: h.value.id })));
  assertUnique("hackathon slug", hackathons.map((h) => ({ file: h.file, key: h.value.slug })));
  assertUnique("project id", projects.map((p) => ({ file: p.file, key: p.value.id })));
  assertUnique("project slug", projects.map((p) => ({ file: p.file, key: p.value.slug })));
  assertUnique("entry id", entries.map((e) => ({ file: e.file, key: e.value.id })));
  assertUnique(
    "project+hackathon pair",
    entries.map((e) => ({ file: e.file, key: `${e.value.project_id}::${e.value.hackathon_id}` })),
  );

  const hackathonIds = new Set(hackathons.map((h) => h.value.id));
  const projectIds = new Set(projects.map((p) => p.value.id));

  for (const { file, value } of projects) {
    for (const c of value.categories) {
      if (!categorySlugs.has(c)) fail(rel(file), `unknown category "${c}"`);
    }
    for (const t of value.technologies) {
      if (!technologySlugs.has(t)) fail(rel(file), `unknown technology "${t}"`);
    }
  }

  for (const { file, value } of entries) {
    if (!projectIds.has(value.project_id)) fail(rel(file), `unknown project_id "${value.project_id}"`);
    if (!hackathonIds.has(value.hackathon_id))
      fail(rel(file), `unknown hackathon_id "${value.hackathon_id}"`);
    if (!value.source?.url) fail(rel(file), "a winner source URL is required");
    for (const award of value.awards) {
      if (award.prize_amount != null && !award.currency)
        fail(rel(file), `award "${award.title}" has prize_amount without currency`);
    }
  }

  for (const { file, value } of hackathons) {
    if (!value.sources.length) fail(rel(file), "at least one source URL is required");
  }

  const counts = `${hackathons.length} hackathons, ${projects.length} projects, ${entries.length} entries`;
  if (errors.length) {
    console.error(`\n✖ Data validation failed (${errors.length} problem(s))\n`);
    for (const e of errors) console.error(`  - ${e}`);
    console.error(`\nChecked ${counts}.\n`);
    process.exit(1);
  }
  console.log(`✓ Data validation passed — ${counts}.`);
}

main();
