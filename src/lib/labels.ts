import type { Dataset } from "@/types";

export function labelMaps(dataset: Dataset) {
  return {
    categories: new Map(dataset.categories.map((c) => [c.slug, c.name])),
    technologies: new Map(dataset.technologies.map((t) => [t.slug, t.name])),
    awardTypes: new Map<string, string>(dataset.awardTypes.map((a) => [a.slug, a.name])),
    sources: new Map<string, string>(dataset.sources.map((s) => [s.slug, s.name])),
  };
}
