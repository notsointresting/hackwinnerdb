#!/usr/bin/env tsx
/**
 * Interactive CLI that turns answers into hackathon/project/entry YAML files.
 * Never overwrites an existing record: it reuses matching hackathons/projects
 * and refuses to clobber files it did not create.
 */
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";
import { stdin as input, stdout as output } from "node:process";
import { stringify } from "yaml";
import { AWARD_TYPES, SOURCE_PLATFORMS } from "../src/schemas";
import { ENTRIES_DIR, HACKATHONS_DIR, PROJECTS_DIR, TAXONOMIES_DIR } from "../src/lib/paths";
import { readYaml } from "../src/lib/yaml-files";
import { normalizeName, similarity, slugify } from "../src/lib/utils";
import { loadRaw, rel } from "./lib-load";

const rl = readline.createInterface({ input, output, terminal: false });
const created: string[] = [];

// A small line queue instead of readline/promises: on Windows the promises API
// stops resolving after the first question when stdin is a pipe rather than a TTY.
const pending: ((line: string) => void)[] = [];
const buffered: string[] = [];
let closed = false;
rl.on("line", (line) => {
  const next = pending.shift();
  if (next) next(line);
  else buffered.push(line);
});
rl.on("close", () => {
  closed = true;
  while (pending.length) pending.shift()!("");
});

function readLine(): Promise<string> {
  if (buffered.length) return Promise.resolve(buffered.shift()!);
  if (closed) return Promise.resolve("");
  return new Promise((resolve) => pending.push(resolve));
}

async function ask(question: string, fallback = ""): Promise<string> {
  const suffix = fallback ? ` [${fallback}]` : "";
  output.write(`${question}${suffix}: `);
  const answer = (await readLine()).trim();
  output.write(`${answer}
`);
  return answer || fallback;
}

async function askRequired(question: string): Promise<string> {
  for (;;) {
    const answer = await ask(question);
    if (answer) return answer;
    if (closed) {
      console.error(`
✖ Missing required answer for "${question}" (input ended).`);
      process.exit(1);
    }
    console.log("  This field is required.");
  }
}

async function askList(question: string): Promise<string[]> {
  const answer = await ask(`${question} (comma separated)`);
  return answer
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

async function askChoice(question: string, choices: readonly string[], fallback: string) {
  console.log(`  options: ${choices.join(", ")}`);
  for (;;) {
    const answer = (await ask(question, fallback)).toLowerCase();
    if (choices.includes(answer)) return answer;
    console.log("  Not one of the options.");
  }
}

function writeNew(file: string, data: unknown) {
  if (fs.existsSync(file)) {
    console.error(`\n✖ Refusing to overwrite existing file: ${rel(file)}`);
    console.error("  Edit it by hand, or pick a different id.");
    process.exit(1);
  }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, stringify(data, { lineWidth: 100 }));
  created.push(rel(file));
}

function knownSlugs(file: string): Set<string> {
  const list = (readYaml<{ slug: string }[]>(path.join(TAXONOMIES_DIR, file)) ?? []) as {
    slug: string;
  }[];
  return new Set(list.map((item) => item.slug));
}

async function main() {
  const raw = loadRaw();
  const hackathons = raw.hackathons.map((h) => h.data as Record<string, unknown>);
  const projects = raw.projects.map((p) => p.data as Record<string, unknown>);
  const categories = knownSlugs("categories.yaml");
  const technologies = knownSlugs("technologies.yaml");

  console.log("\nHackWinnerDB — add a winner\n");

  const hackathonName = await askRequired("Hackathon name");
  const year = await askRequired("Year");
  const hackathonId = slugify(`${hackathonName}-${year}`);
  let hackathon = hackathons.find((h) => h.id === hackathonId);

  if (hackathon) {
    console.log(`  Using existing hackathon: ${hackathonId}`);
  } else {
    const organizer = await askList("Organizer");
    const websiteUrl = await ask("Official hackathon URL");
    const sourceUrl = await askRequired("Source URL confirming this hackathon");
    const platform = await askChoice("Source platform", SOURCE_PLATFORMS, "devpost");
    hackathon = {
      id: hackathonId,
      name: hackathonName,
      slug: hackathonId,
      organizer,
      year: Number(year),
      mode: "online",
      website_url: websiteUrl || null,
      sources: [sourceUrl],
      platform,
    };
    writeNew(path.join(HACKATHONS_DIR, String(year), `${hackathonId}.yaml`), hackathon);
  }

  const projectName = await askRequired("Project name");
  const projectId = slugify(projectName);
  const near = projects
    .map((p) => ({
      id: String(p.id),
      score: similarity(normalizeName(String(p.name ?? "")), normalizeName(projectName)),
    }))
    .filter((p) => p.score >= 0.85 && p.id !== projectId);
  if (near.length) {
    console.log("\n  Possible duplicates already in the database:");
    for (const match of near) {
      console.log(`    ${match.id} (${Math.round(match.score * 100)}% similar)`);
    }
    const proceed = await ask("  Continue anyway? (y/N)", "n");
    if (proceed.toLowerCase() !== "y") process.exit(1);
  }

  let project = projects.find((p) => p.id === projectId);
  if (project) {
    console.log(`  Using existing project: ${projectId}`);
  } else {
    const tagline = await askRequired("Tagline (short, original wording)");
    const summary = await askRequired("Summary (2-3 sentences, original wording)");
    const projectCategories = await askList("Categories");
    const projectTechnologies = await askList("Technologies");
    for (const slug of projectCategories) {
      if (!categories.has(slug)) console.log(`  ! Unknown category "${slug}" — validation will fail.`);
    }
    for (const slug of projectTechnologies) {
      if (!technologies.has(slug)) {
        console.log(`  ! Unknown technology "${slug}" — add it to data/taxonomies/technologies.yaml.`);
      }
    }
    project = {
      id: projectId,
      name: projectName,
      slug: projectId,
      tagline,
      summary,
      website_url: (await ask("Project website")) || null,
      github_url: (await ask("GitHub URL")) || null,
      demo_url: (await ask("Demo URL")) || null,
      video_url: (await ask("Video URL")) || null,
      categories: projectCategories,
      technologies: projectTechnologies,
      builders: (await askList("Builder names")).map((name) => ({ name })),
    };
    writeNew(path.join(PROJECTS_DIR, `${projectId}.yaml`), project);
  }

  const awardType = await askChoice("Award type", AWARD_TYPES, "winner");
  const awardTitle = await askRequired("Award title as published");
  const rankInput = await ask("Rank (blank if not ranked)");
  const submissionUrl = await ask("Submission URL");
  const sourceUrl = await askRequired("Official source confirming this win");
  const platform = await askChoice("Source platform", SOURCE_PLATFORMS, "devpost");

  const entryId = `${projectId}-${hackathonId}`;
  writeNew(path.join(ENTRIES_DIR, `${entryId}.yaml`), {
    id: entryId,
    project_id: projectId,
    hackathon_id: hackathonId,
    submission_url: submissionUrl || null,
    source: { platform, url: sourceUrl },
    awards: [
      {
        type: awardType,
        title: awardTitle,
        ...(rankInput ? { rank: Number(rankInput) } : {}),
      },
    ],
    verification: {
      status: "verified",
      checked_at: new Date().toISOString().slice(0, 10),
    },
  });

  rl.close();
  console.log("\n✓ Created:");
  for (const file of created) console.log(`  ${file}`);
  console.log("\nNext: npm run validate:data && npm run check:duplicates, then open a pull request.");
}

main().catch((error) => {
  rl.close();
  console.error(error);
  process.exit(1);
});
