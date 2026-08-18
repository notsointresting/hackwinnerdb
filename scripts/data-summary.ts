#!/usr/bin/env tsx
/** Renders the "HackWinnerDB Data Change" summary used by the PR workflow. */
import { execSync } from "node:child_process";
import { yamlRepository } from "../src/lib/load-dataset";

const base = process.argv[2] ?? "origin/main";

function changedFiles(): string[] {
  try {
    return execSync(`git diff --name-only --diff-filter=A ${base}...HEAD -- data`, {
      encoding: "utf8",
    })
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean);
  } catch {
    return [];
  }
}

const added = changedFiles();
const addedHackathons = added.filter((f) => f.startsWith("data/hackathons/")).length;
const addedProjects = added.filter((f) => f.startsWith("data/projects/")).length;
const addedEntries = added.filter((f) => f.startsWith("data/entries/"));

const dataset = yamlRepository.getDataset();
const entryIds = new Set(
  addedEntries.map((file) => file.split("/").pop()!.replace(/\.ya?ml$/, "")),
);
const newEntries = dataset.entries.filter((entry) => entryIds.has(entry.id));
const withSource = newEntries.filter((entry) => Boolean(entry.source?.url)).length;
const referencedTech = new Set(
  newEntries.flatMap(
    (entry) => dataset.projects.find((p) => p.id === entry.project_id)?.technologies ?? [],
  ),
);

const lines = [
  "## HackWinnerDB Data Change",
  "",
  "```",
  `+ ${addedHackathons} Hackathon${addedHackathons === 1 ? "" : "s"}`,
  `+ ${addedProjects} Project${addedProjects === 1 ? "" : "s"}`,
  `+ ${addedEntries.length} Winning Entr${addedEntries.length === 1 ? "y" : "ies"}`,
  `+ ${referencedTech.size} Technologies referenced`,
  "",
  `Sources: ${withSource}/${newEntries.length || addedEntries.length} provided`,
  "Validation: run by the CI workflow",
  "```",
];

console.log(lines.join("\n"));
