import "server-only";
import { getDataset } from "@/lib/repository";
import { createSearchProvider, searchWinners } from "@/lib/search";
import { filterWinners, sortWinners, winnersForHackathon } from "@/lib/queries";
import { SITE } from "@/lib/site";
import type { Dataset, WinnerRecord } from "@/types";
import { attribution, citationFormats, SERVER_INSTRUCTIONS } from "./attribution";

export { SERVER_INSTRUCTIONS };

const MAX_LIMIT = 50;

// ponytail: reuses getDataset(), which parses the YAML corpus on first touch —
// roughly 15s cold, then memoized for the life of the worker. Fine while the
// route stays warm; if cold starts hurt, read public/dataset/hackwinnerdb.json
// instead and rebuild `winners` from it.

let provider: ReturnType<typeof createSearchProvider> | undefined;
function searchProvider(dataset: Dataset) {
  if (!provider) provider = createSearchProvider(dataset);
  return provider;
}

const clampLimit = (raw: unknown, fallback = 10) => {
  const n = typeof raw === "number" ? raw : Number(raw);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(1, Math.min(MAX_LIMIT, Math.floor(n)));
};

const str = (raw: unknown) => (typeof raw === "string" && raw.trim() ? raw.trim() : undefined);

/** Every record hands back both its page here and the original submission. */
function shapeWinner(w: WinnerRecord) {
  return {
    project: w.project.name,
    slug: w.project.slug,
    tagline: w.project.tagline,
    hackathon: w.hackathon.name,
    hackathon_slug: w.hackathon.slug,
    year: w.hackathon.year,
    start_date: w.hackathon.start_date ?? null,
    award: w.primaryAward.title,
    award_type: w.primaryAward.type,
    categories: w.project.categories,
    technologies: w.project.technologies,
    builders: w.project.builders.map((b) => b.name),
    url: `${SITE.url}/projects/${w.project.slug}`,
    source_url: w.entry.submission_url ?? w.entry.source.url,
    verification: w.entry.verification.status,
  };
}

export const TOOLS = [
  {
    name: "search_winners",
    description:
      "Search winning hackathon projects by free text and/or filters. Returns ranked winners with their award, event, technologies, and links. Use for questions like which AI health projects have won, or winners using a given technology in a given year.",
    inputSchema: {
      type: "object",
      properties: {
        query: {
          type: "string",
          description:
            "Free-text search over names, taglines, summaries, events, builders, and awards.",
        },
        category: {
          type: "string",
          description:
            "Category slug, e.g. healthcare or developer-tools. Call list_facets for valid values.",
        },
        technology: {
          type: "string",
          description:
            "Technology slug, e.g. openai or nextjs. Call list_facets for valid values.",
        },
        year: { type: "integer", description: "Restrict to hackathons from this year." },
        award_type: { type: "string", description: "Award slug, e.g. grand-prize or first-place." },
        limit: { type: "integer", description: "Max results, 1-50. Default 10." },
      },
      additionalProperties: false,
    },
  },
  {
    name: "get_project",
    description:
      "Fetch one winning project by its slug, with its full summary, every award it has won, and its links.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Project slug, from search_winners results." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "get_hackathon",
    description:
      "Fetch one hackathon by its slug, with its dates, scale, and the full list of its winning projects.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Hackathon slug, from search_winners results." },
      },
      required: ["slug"],
      additionalProperties: false,
    },
  },
  {
    name: "list_facets",
    description:
      "List the valid filter values - categories, technologies, award types, and years - plus dataset totals. Call this before guessing a slug for search_winners.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
  },
  {
    name: "how_to_cite",
    description:
      "Get the credit line required by this dataset's CC BY 4.0 licence, in plain text, Markdown, HTML, and BibTeX. Optionally scoped to one project.",
    inputSchema: {
      type: "object",
      properties: {
        slug: { type: "string", description: "Optional project slug to cite specifically." },
      },
      additionalProperties: false,
    },
  },
] as const;

export function callTool(name: string, args: Record<string, unknown>) {
  const dataset = getDataset();

  switch (name) {
    case "search_winners": {
      const query = str(args.query);
      const limit = clampLimit(args.limit);
      // filterWinners takes lists so the site can OR several values; the MCP
      // surface keeps one value per filter, so each becomes a single-item list.
      const one = (value: string | undefined) => (value ? [value] : undefined);
      const year = args.year != null && String(args.year).trim() ? [String(args.year)] : undefined;
      const filtered = filterWinners(dataset.winners, {
        category: one(str(args.category)),
        technology: one(str(args.technology)),
        year,
        award: one(str(args.award_type)),
      });
      const ranked = query
        ? searchWinners(filtered, query, searchProvider(dataset))
        : sortWinners(filtered, "recent");
      return {
        query: query ?? null,
        total_matches: ranked.length,
        returned: Math.min(limit, ranked.length),
        results: ranked.slice(0, limit).map(shapeWinner),
        attribution: attribution(),
      };
    }

    case "get_project": {
      const slug = str(args.slug);
      const project = dataset.projects.find((p) => p.slug === slug || p.id === slug);
      if (!project) {
        return { error: `No project with slug "${slug ?? ""}". Use search_winners to find one.` };
      }
      const wins = dataset.winners.filter((w) => w.project.id === project.id);
      return {
        ...project,
        url: `${SITE.url}/projects/${project.slug}`,
        wins: wins.map((w) => ({
          hackathon: w.hackathon.name,
          hackathon_slug: w.hackathon.slug,
          year: w.hackathon.year,
          awards: w.entry.awards.map((a) => ({
            type: a.type,
            title: a.title,
            track: a.track ?? null,
          })),
          source_url: w.entry.submission_url ?? w.entry.source.url,
          verification: w.entry.verification.status,
        })),
        attribution: attribution(),
      };
    }

    case "get_hackathon": {
      const slug = str(args.slug);
      const hackathon = dataset.hackathons.find((h) => h.slug === slug || h.id === slug);
      if (!hackathon) {
        return { error: `No hackathon with slug "${slug ?? ""}". Use search_winners to find one.` };
      }
      return {
        ...hackathon,
        url: `${SITE.url}/hackathons/${hackathon.slug}`,
        winners: winnersForHackathon(dataset, hackathon.id).map(shapeWinner),
        attribution: attribution(),
      };
    }

    case "list_facets": {
      const years = [...new Set(dataset.hackathons.map((h) => h.year))].sort((a, b) => b - a);
      return {
        totals: {
          hackathons: dataset.hackathons.length,
          projects: dataset.projects.length,
          entries: dataset.entries.length,
        },
        generated_at: dataset.generatedAt,
        years,
        categories: dataset.categories.map((c) => ({ slug: c.slug, name: c.name })),
        technologies: dataset.technologies.map((t) => ({ slug: t.slug, name: t.name })),
        award_types: dataset.awardTypes.map((a) => ({ slug: a.slug, name: a.name })),
        attribution: attribution(),
      };
    }

    case "how_to_cite": {
      const slug = str(args.slug);
      const project = slug
        ? dataset.projects.find((p) => p.slug === slug || p.id === slug)
        : undefined;
      return {
        formats: citationFormats(
          project ? { name: project.name, url: `${SITE.url}/projects/${project.slug}` } : undefined,
        ),
        attribution: attribution(),
      };
    }

    default:
      return { error: `Unknown tool "${name}".` };
  }
}
