#!/usr/bin/env tsx
/** Normalizes the YAML corpus into the downloadable JSON + CSV dataset. */
import fs from "node:fs";
import path from "node:path";
import { yamlRepository } from "../src/lib/load-dataset";
import { DATASET_DIR } from "../src/lib/paths";

function csvCell(value: unknown): string {
const chr34 = String.fromCharCode(34);
const chr10 = String.fromCharCode(10);
const chr13 = String.fromCharCode(13);

  if (value == null) return "";
  const str = Array.isArray(value) ? value.join("|") : String(value);
  const needsQuote = str.includes(chr34) || str.includes(",") || str.includes(chr10) || str.includes(chr13);
  return needsQuote ? chr34 + str.split(chr34).join(chr34 + chr34) + chr34 : str;
}

function toCsv(rows: Record<string, unknown>[], columns: string[]): string {
  const lines = [columns.join(",")];
  for (const row of rows) lines.push(columns.map((c) => csvCell(row[c])).join(","));
  return lines.join("\n") + "\n";
}

function write(file: string, contents: string) {
  fs.writeFileSync(path.join(DATASET_DIR, file), contents);
  console.log(`  wrote public/dataset/${file}`);
}

function main() {
  fs.mkdirSync(DATASET_DIR, { recursive: true });
  const dataset = yamlRepository.getDataset();
  const { hackathons, projects, entries, categories, technologies, awardTypes, sources } = dataset;

  const meta = {
    name: "HackWinnerDB",
    description: "The open-source database of hackathon winners.",
    license: "CC BY 4.0",
    generated_at: dataset.generatedAt,
    counts: {
      hackathons: hackathons.length,
      projects: projects.length,
      entries: entries.length,
    },
  };

  write("hackwinnerdb.json", JSON.stringify(
    { meta, hackathons, projects, entries, categories, technologies, award_types: awardTypes, sources },
    null,
    2,
  ));
  write("hackathons.json", JSON.stringify({ meta, hackathons }, null, 2));
  write("projects.json", JSON.stringify({ meta, projects }, null, 2));
  write("entries.json", JSON.stringify({ meta, entries }, null, 2));

  write(
    "hackathons.csv",
    toCsv(
      hackathons.map((h) => ({ ...h, organizer: h.organizer, sources: h.sources })),
      ["id", "name", "slug", "year", "organizer", "start_date", "end_date", "mode", "location",
       "website_url", "platform", "participant_count", "total_submissions", "prize_pool",
       "currency", "sources"],
    ),
  );
  write(
    "projects.csv",
    toCsv(
      projects.map((p) => ({ ...p, builders: p.builders.map((b) => b.name) })),
      ["id", "name", "slug", "tagline", "summary", "website_url", "github_url", "demo_url",
       "video_url", "categories", "technologies", "builders"],
    ),
  );
  write(
    "entries.csv",
    toCsv(
      entries.map((e) => ({
        id: e.id,
        project_id: e.project_id,
        hackathon_id: e.hackathon_id,
        submission_url: e.submission_url ?? "",
        source_platform: e.source.platform,
        source_url: e.source.url,
        awards: e.awards.map((a) => a.type),
        award_titles: e.awards.map((a) => a.title),
        verification_status: e.verification.status,
        verified_at: e.verification.checked_at,
      })),
      ["id", "project_id", "hackathon_id", "submission_url", "source_platform", "source_url",
       "awards", "award_titles", "verification_status", "verified_at"],
    ),
  );

  console.log(
    `✓ Dataset generated — ${hackathons.length} hackathons, ${projects.length} projects, ${entries.length} entries.`,
  );
}

main();
