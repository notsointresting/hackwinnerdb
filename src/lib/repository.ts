import "server-only";
import { cache } from "react";
import { yamlRepository } from "./load-dataset";

export { computeStats, type DataRepository } from "./load-dataset";

/** Cached per request; YAML is parsed once per render pass. */
export const getDataset = cache(() => yamlRepository.getDataset());
