import MiniSearch, { type SearchResult } from "minisearch";
import type { Dataset, WinnerRecord } from "@/types";

export interface SearchDoc {
  id: string;
  name: string;
  tagline: string;
  summary: string;
  hackathon: string;
  organizer: string;
  technologies: string;
  categories: string;
  builders: string;
  awards: string;
}

/**
 * Search seam. Today it is an in-memory MiniSearch index built from the dataset;
 * a hosted engine (Meilisearch/Typesense) can implement the same interface later.
 */
export interface SearchProvider {
  search(query: string): string[];
}

export function toSearchDoc(w: WinnerRecord): SearchDoc {
  return {
    id: w.entry.id,
    name: w.project.name,
    tagline: w.project.tagline,
    summary: [w.project.summary, w.project.problem, w.project.solution].filter(Boolean).join(" "),
    hackathon: w.hackathon.name,
    organizer: w.hackathon.organizer.join(" "),
    technologies: w.project.technologies.join(" "),
    categories: w.project.categories.join(" "),
    builders: w.project.builders.map((b) => b.name).join(" "),
    awards: w.entry.awards.map((a) => `${a.title} ${a.type}`).join(" "),
  };
}

const FIELDS: (keyof SearchDoc)[] = [
  "name",
  "tagline",
  "summary",
  "hackathon",
  "organizer",
  "technologies",
  "categories",
  "builders",
  "awards",
];

export function buildIndex(docs: SearchDoc[]): MiniSearch<SearchDoc> {
  const index = new MiniSearch<SearchDoc>({
    fields: FIELDS as string[],
    storeFields: ["id"],
    searchOptions: {
      prefix: true,
      fuzzy: 0.2,
      combineWith: "AND",
      boost: { name: 4, tagline: 2, hackathon: 2, technologies: 2, categories: 2 },
    },
  });
  index.addAll(docs);
  return index;
}

/** Returns entry ids ranked by relevance. */
export function createSearchProvider(dataset: Dataset): SearchProvider {
  const index = buildIndex(dataset.winners.map(toSearchDoc));
  return {
    search(query: string) {
      const trimmed = query.trim();
      if (!trimmed) return [];
      const results = index.search(trimmed) as SearchResult[];
      return results.map((r) => String(r.id));
    },
  };
}

/** Order winners by a search query; returns all winners unchanged for an empty query. */
export function searchWinners(
  winners: WinnerRecord[],
  query: string,
  provider?: SearchProvider,
): WinnerRecord[] {
  const trimmed = query.trim();
  if (!trimmed) return winners;
  const index = provider ?? {
    search: (q: string) =>
      (buildIndex(winners.map(toSearchDoc)).search(q) as SearchResult[]).map((r) => String(r.id)),
  };
  const ranked = index.search(trimmed);
  const rank = new Map(ranked.map((id, i) => [id, i]));
  return winners
    .filter((w) => rank.has(w.entry.id))
    .sort((a, b) => rank.get(a.entry.id)! - rank.get(b.entry.id)!);
}
