import {
  awardTypesFileSchema,
  categoriesFileSchema,
  entrySchema,
  hackathonSchema,
  projectSchema,
  sourcesFileSchema,
  technologiesFileSchema,
} from "@/schemas";
import type { Dataset, DataStats, WinnerRecord } from "@/types";
import {
  DATASET_DIR,
  ENTRIES_DIR,
  HACKATHONS_DIR,
  PROJECTS_DIR,
  SOURCES_FILE,
  TAXONOMIES_DIR,
} from "./paths";
import { readYaml, readYamlDir } from "./yaml-files";
import fs from "node:fs";
import path from "node:path";

/**
 * The one seam between the UI and storage. Today it reads YAML from git;
 * swapping in Postgres/Meilisearch later only means writing another loader
 * that returns the same `Dataset`.
 */
export interface DataRepository {
  getDataset(): Dataset;
}

function loadDataset(): Dataset {
  const categories = categoriesFileSchema.parse(
    readYaml(path.join(TAXONOMIES_DIR, "categories.yaml")),
  );
  const technologies = technologiesFileSchema.parse(
    readYaml(path.join(TAXONOMIES_DIR, "technologies.yaml")),
  );
  const awardTypes = awardTypesFileSchema.parse(
    readYaml(path.join(TAXONOMIES_DIR, "award-types.yaml")),
  );
  const sources = sourcesFileSchema.parse(readYaml(SOURCES_FILE));

  const hackathons = readYamlDir(HACKATHONS_DIR).map(({ data }) => hackathonSchema.parse(data));
  const projects = readYamlDir(PROJECTS_DIR).map(({ data }) => projectSchema.parse(data));
  const entries = readYamlDir(ENTRIES_DIR).map(({ data }) => entrySchema.parse(data));

  return assembleDataset({
    hackathons,
    projects,
    entries,
    categories,
    technologies,
    awardTypes,
    sources,
  });
}

type DatasetParts = Omit<Dataset, "winners" | "generatedAt">;

/** Joins entries to their project and hackathon, then ranks them by award. */
export function assembleDataset(parts: DatasetParts): Dataset {
  const { hackathons, projects, entries, awardTypes } = parts;
  const weights = new Map(awardTypes.map((a) => [a.slug, a.weight]));
  const projectById = new Map(projects.map((p) => [p.id, p]));
  const hackathonById = new Map(hackathons.map((h) => [h.id, h]));

  const winners: WinnerRecord[] = [];
  for (const entry of entries) {
    const project = projectById.get(entry.project_id);
    const hackathon = hackathonById.get(entry.hackathon_id);
    // Referential integrity is enforced by `npm run validate:data`; skip orphans here
    // so a bad record can never crash a page render.
    if (!project || !hackathon) continue;
    const sorted = [...entry.awards].sort(
      (a, b) => (weights.get(a.type) ?? 100) - (weights.get(b.type) ?? 100),
    );
    winners.push({
      entry,
      project,
      hackathon,
      primaryAward: sorted[0],
      awardWeight: weights.get(sorted[0].type) ?? 100,
    });
  }

  winners.sort(
    (a, b) => b.hackathon.year - a.hackathon.year || a.awardWeight - b.awardWeight ||
      a.project.name.localeCompare(b.project.name),
  );

  return { ...parts, winners, generatedAt: new Date().toISOString() };
}

export const yamlRepository: DataRepository = { getDataset: loadDataset };

/**
 * Reads the dataset the build already generated instead of re-parsing several
 * thousand YAML files. Parsing the corpus takes roughly fifteen seconds, which
 * is fine for a static build but not for an API route answering a request.
 *
 * The generated file is gitignored and absent until `generate:data` has run, so
 * fall back to YAML rather than failing - that is the normal case in `next dev`.
 */
function loadGeneratedDataset(): Dataset {
  const file = path.join(DATASET_DIR, "hackwinnerdb.json");
  if (!fs.existsSync(file)) return loadDataset();

  const raw = JSON.parse(fs.readFileSync(file, "utf8")) as Record<string, unknown>;
  return assembleDataset({
    hackathons: raw.hackathons as Dataset["hackathons"],
    projects: raw.projects as Dataset["projects"],
    entries: raw.entries as Dataset["entries"],
    categories: raw.categories as Dataset["categories"],
    technologies: raw.technologies as Dataset["technologies"],
    awardTypes: raw.award_types as Dataset["awardTypes"],
    sources: raw.sources as Dataset["sources"],
  });
}

/** Same `Dataset`, loaded from the build artifact. Used by the MCP route. */
export const generatedRepository: DataRepository = { getDataset: loadGeneratedDataset };

export function computeStats(dataset: Dataset): DataStats {
  const years = dataset.hackathons.map((h) => h.year);
  const usedTech = new Set(dataset.projects.flatMap((p) => p.technologies));
  const usedCats = new Set(dataset.projects.flatMap((p) => p.categories));
  return {
    projects: dataset.projects.length,
    hackathons: dataset.hackathons.length,
    entries: dataset.entries.length,
    technologies: usedTech.size,
    categories: usedCats.size,
    minYear: years.length ? Math.min(...years) : null,
    maxYear: years.length ? Math.max(...years) : null,
  };
}
