import "server-only";
import { generatedRepository, yamlRepository } from "./load-dataset";
import type { Dataset } from "@/types";

export { computeStats, type DataRepository } from "./load-dataset";

// Module-level singleton: `react`'s `cache()` only dedupes within a single
// request, but static-gen renders thousands of pages as separate render
// passes in the same worker process — that re-parsed the entire YAML corpus
// per page. Cache once per worker process instead.
let dataset: Dataset | undefined;

export function getDataset(): Dataset {
  if (!dataset) dataset = yamlRepository.getDataset();
  return dataset;
}

// Separate singleton: the MCP route reads the build artifact so a request is not
// paying for a full YAML parse, while page rendering keeps reading YAML.
let generated: Dataset | undefined;

export function getGeneratedDataset(): Dataset {
  if (!generated) generated = generatedRepository.getDataset();
  return generated;
}
