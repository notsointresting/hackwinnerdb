#!/usr/bin/env tsx
/**
 * Backfills project technologies against the current taxonomy.
 *
 *   npx tsx scripts/import/backfill-tech.ts [--limit N] [--dry-run]
 *
 * Two earlier bugs left the corpus under-tagged: `mapTechnologies` compared
 * slugs exactly, so hyphenation differences like "node-js" were discarded, and
 * the taxonomy simply did not carry a lot of the tools projects were built
 * with. Both are fixed going forward, but a tag that was dropped at import was
 * never stored, so the only way to recover it is to read the source again.
 *
 * `fetchPage` throttles to one request per second on purpose and caches to
 * disk, so this is slow by design and cheap to resume. Progress is written
 * after every project; re-running picks up where it stopped.
 *
 * Only ever adds slugs. Nothing is removed, so a maintainer's hand-curated
 * technology list cannot be clobbered by a bad parse.
 */
import fs from "node:fs";
import path from "node:path";
import { parse, stringify } from "yaml";
import { fetchPage } from "./http";
import { mapTechnologies, parseProject } from "./devpost-parse";
import { ENTRIES_DIR, PROJECTS_DIR } from "../../src/lib/paths";
import { loadRaw } from "../lib-load";

const STATE_FILE = path.join(process.cwd(), ".cache", "backfill-tech-state.json");

interface State {
  done: string[];
  added: number;
  touched: number;
}

function loadState(): State {
  if (!fs.existsSync(STATE_FILE)) return { done: [], added: 0, touched: 0 };
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as State;
  } catch {
    return { done: [], added: 0, touched: 0 };
  }
}

function saveState(state: State) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state));
}

const numericArg = (flag: string) => {
  const index = process.argv.indexOf(flag);
  if (index === -1) return null;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) ? value : null;
};

/** Devpost is the only source whose project pages carry a "built with" list. */
function devpostUrlByProject(): Map<string, string> {
  const urls = new Map<string, string>();
  for (const file of fs.readdirSync(ENTRIES_DIR)) {
    if (!file.endsWith(".yaml")) continue;
    const entry = parse(fs.readFileSync(path.join(ENTRIES_DIR, file), "utf8")) as {
      project_id?: string;
      submission_url?: string | null;
      source?: { platform?: string; url?: string };
    };
    if (entry.source?.platform !== "devpost") continue;
    const url = entry.submission_url ?? entry.source?.url;
    if (entry.project_id && url && !urls.has(entry.project_id)) urls.set(entry.project_id, url);
  }
  return urls;
}

async function main() {
  const isDryRun = process.argv.includes("--dry-run");
  const limit = numericArg("--limit") ?? Infinity;

  const raw = loadRaw();
  const known = new Set((raw.technologies as { slug: string }[]).map((t) => t.slug));
  const urls = devpostUrlByProject();

  const state = loadState();
  const done = new Set(state.done);

  const queue = [...urls.keys()].filter((id) => !done.has(id)).sort();
  console.log(
    `${urls.size} Devpost-sourced project(s); ${done.size} already checked, ${queue.length} remaining.`,
  );
  if (limit !== Infinity) console.log(`Processing at most ${limit} this run.`);
  if (!queue.length) {
    console.log("Nothing left to do.");
    return;
  }

  let processed = 0;
  for (const projectId of queue) {
    if (processed >= limit) break;
    processed++;

    const file = path.join(PROJECTS_DIR, `${projectId}.yaml`);
    if (!fs.existsSync(file)) {
      done.add(projectId);
      continue;
    }

    let detail;
    try {
      detail = parseProject(await fetchPage(urls.get(projectId)!));
    } catch (error) {
      // A dead or moved submission should not stop the run; mark it done so a
      // resume does not keep retrying the same broken URL.
      console.log(`  ! ${projectId}: ${error instanceof Error ? error.message : error}`);
      done.add(projectId);
      state.done = [...done];
      if (!isDryRun) saveState(state);
      continue;
    }

    const project = parse(fs.readFileSync(file, "utf8")) as { technologies?: string[] };
    const existing = new Set(project.technologies ?? []);
    const { mapped } = mapTechnologies(detail.technologies, known);
    const fresh = mapped.filter((slug) => !existing.has(slug));

    if (fresh.length) {
      project.technologies = [...existing, ...fresh].sort();
      if (!isDryRun) fs.writeFileSync(file, stringify(project, { lineWidth: 100 }));
      state.added += fresh.length;
      state.touched++;
      console.log(`  + ${projectId}: ${fresh.join(", ")}`);
    }

    done.add(projectId);
    state.done = [...done];
    if (!isDryRun) saveState(state);
  }

  console.log(
    `\nChecked ${processed} project(s) this run. ` +
      `${state.touched} project(s) gained ${state.added} technology reference(s) in total.`,
  );
  const left = queue.length - processed;
  if (left > 0) console.log(`${left} still to go - run again to continue.`);
  if (isDryRun) console.log("Dry run: nothing was written.");
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
