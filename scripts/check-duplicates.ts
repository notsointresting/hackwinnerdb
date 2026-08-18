#!/usr/bin/env tsx
/**
 * Warns about probable duplicates. Exact unique-constraint violations exit
 * non-zero; fuzzy matches are warnings so CI stays usable for humans.
 */
import { entrySchema, projectSchema } from "../src/schemas";
import { normalizeName, normalizeUrl, similarity } from "../src/lib/utils";
import { loadRaw, rel } from "./lib-load";

const SIMILARITY_THRESHOLD = 0.88;

function main() {
  const raw = loadRaw();
  const projects = raw.projects.flatMap(({ file, data }) => {
    const parsed = projectSchema.safeParse(data);
    return parsed.success ? [{ file, value: parsed.data }] : [];
  });
  const entries = raw.entries.flatMap(({ file, data }) => {
    const parsed = entrySchema.safeParse(data);
    return parsed.success ? [{ file, value: parsed.data }] : [];
  });

  const warnings: string[] = [];
  const hard: string[] = [];

  // Fuzzy project-name collisions.
  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const a = projects[i];
      const b = projects[j];
      const score = similarity(normalizeName(a.value.name), normalizeName(b.value.name));
      if (score >= SIMILARITY_THRESHOLD) {
        warnings.push(
          `Possible duplicate project:\n\n  ${a.value.id}  (${rel(a.file)})\n  ${b.value.id}  (${rel(b.file)})\n\n  Similarity: ${Math.round(score * 100)}%`,
        );
      }
    }
  }

  // Exact shared URLs across different projects.
  const byUrl = new Map<string, { id: string; file: string }[]>();
  for (const { file, value } of projects) {
    for (const url of [value.github_url, value.website_url]) {
      const key = normalizeUrl(url ?? null);
      if (!key) continue;
      byUrl.set(key, [...(byUrl.get(key) ?? []), { id: value.id, file }]);
    }
  }
  for (const [url, owners] of byUrl) {
    const ids = new Set(owners.map((o) => o.id));
    if (ids.size > 1) {
      warnings.push(
        `Shared project URL "${url}" across: ${[...ids].join(", ")}`,
      );
    }
  }

  // Hard constraints: one entry per project+hackathon, one entry per source URL.
  const pairs = new Map<string, string>();
  const sourceUrls = new Map<string, string>();
  for (const { file, value } of entries) {
    const pair = `${value.project_id}::${value.hackathon_id}`;
    if (pairs.has(pair)) {
      hard.push(`Duplicate entry for ${pair}: ${rel(file)} and ${rel(pairs.get(pair)!)}`);
    } else pairs.set(pair, file);

    const src = normalizeUrl(value.source.url);
    const sub = normalizeUrl(value.submission_url ?? null);
    for (const key of [src, sub].filter(Boolean) as string[]) {
      const prev = sourceUrls.get(key);
      if (prev && prev !== value.id) {
        warnings.push(`Source/submission URL "${key}" reused by entries ${prev} and ${value.id}`);
      } else sourceUrls.set(key, value.id);
    }
  }

  for (const w of warnings) console.warn(`\n⚠ ${w}\n`);
  if (hard.length) {
    console.error(`\n✖ Duplicate constraint violations:\n`);
    for (const h of hard) console.error(`  - ${h}`);
    process.exit(1);
  }
  console.log(
    `✓ Duplicate check complete — ${projects.length} projects, ${entries.length} entries, ${warnings.length} warning(s).`,
  );
}

main();
