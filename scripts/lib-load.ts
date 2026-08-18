/** Shared raw loader for the CLI scripts: reads YAML without Zod parsing so the
 * validator can report every problem itself. */
import path, { sep } from "node:path";
import {
  ENTRIES_DIR,
  HACKATHONS_DIR,
  PROJECTS_DIR,
  SOURCES_FILE,
  TAXONOMIES_DIR,
} from "../src/lib/paths";
import { readYaml, readYamlDir } from "../src/lib/yaml-files";

export function loadRaw() {
  return {
    categories: readYaml(path.join(TAXONOMIES_DIR, "categories.yaml")) ?? [],
    technologies: readYaml(path.join(TAXONOMIES_DIR, "technologies.yaml")) ?? [],
    awardTypes: readYaml(path.join(TAXONOMIES_DIR, "award-types.yaml")) ?? [],
    sources: readYaml(SOURCES_FILE) ?? [],
    hackathons: readYamlDir(HACKATHONS_DIR),
    projects: readYamlDir(PROJECTS_DIR),
    entries: readYamlDir(ENTRIES_DIR),
  };
}

export const rel = (file: string) => path.relative(process.cwd(), file).split(sep).join("/");
