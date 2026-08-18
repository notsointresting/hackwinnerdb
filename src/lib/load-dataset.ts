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
  ENTRIES_DIR,
  HACKATHONS_DIR,
  PROJECTS_DIR,
  SOURCES_FILE,
  TAXONOMIES_DIR,
} from "./paths";
import { readYaml, readYamlDir } from "./yaml-files";
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

  return {
    hackathons,
    projects,
    entries,
    categories,
    technologies,
    awardTypes,
    sources,
    winners,
    generatedAt: new Date().toISOString(),
  };
}

export const yamlRepository: DataRepository = { getDataset: loadDataset };

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
