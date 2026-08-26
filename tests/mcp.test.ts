import { beforeAll, describe, expect, it } from "vitest";
import { callTool, TOOLS } from "@/lib/mcp/tools";
import { attribution, CREDIT_LINE, SERVER_INSTRUCTIONS } from "@/lib/mcp/attribution";

/** Shapes are unknown at the type level, so read them through a narrow helper. */
const call = (name: string, args: Record<string, unknown> = {}) =>
  callTool(name, args) as Record<string, unknown>;

// The first call parses the whole YAML corpus. Pay that here rather than
// letting it land on whichever test happens to run first and time out.
beforeAll(() => {
  callTool("list_facets", {});
}, 180_000);

describe("mcp tool definitions", () => {
  it("exposes the documented tool set", () => {
    expect(TOOLS.map((t) => t.name)).toEqual([
      "search_winners",
      "get_project",
      "get_hackathon",
      "list_facets",
      "how_to_cite",
    ]);
  });

  it("gives every tool a description and an object schema", () => {
    for (const tool of TOOLS) {
      expect(tool.description.length).toBeGreaterThan(30);
      expect(tool.inputSchema.type).toBe("object");
    }
  });

  it("rejects an unknown tool", () => {
    expect(call("nope")).toHaveProperty("error");
  });
});

describe("attribution travels with the data", () => {
  it("puts the credit requirement in the server instructions", () => {
    expect(SERVER_INSTRUCTIONS).toContain(CREDIT_LINE);
    expect(SERVER_INSTRUCTIONS).toContain("Attribution is required");
  });

  it("attaches attribution to every successful tool result", () => {
    for (const name of ["search_winners", "list_facets", "how_to_cite"]) {
      const result = call(name);
      expect(result.attribution, `${name} must carry attribution`).toMatchObject({
        required_credit: CREDIT_LINE,
        license: "CC BY 4.0",
      });
    }
  });

  it("names the licence and a resolvable source url", () => {
    const a = attribution();
    expect(a.license_url).toMatch(/^https:\/\/creativecommons\.org\/licenses\/by\/4\.0\//);
    expect(a.source_url).toMatch(/^https?:\/\//);
  });

  it("offers citation formats, scoped to a project when asked", () => {
    const generic = call("how_to_cite").formats as Record<string, string>;
    expect(Object.keys(generic)).toEqual(["plain", "markdown", "html", "bibtex"]);
    expect(generic.bibtex).toContain("@misc{hackwinnerdb");

    const scoped = call("how_to_cite", { slug: "second-voice" }).formats as Record<string, string>;
    expect(scoped.markdown).toContain("Second Voice");
    expect(scoped.markdown).toContain("/projects/second-voice");
  });
});

describe("search_winners", () => {
  it("returns ranked results for a free-text query", () => {
    const result = call("search_winners", { query: "vietnamese tones", limit: 5 });
    expect(result.total_matches as number).toBeGreaterThan(0);
    const results = result.results as { slug: string }[];
    expect(results.map((r) => r.slug)).toContain("dau-see-your-vietnamese-tones");
  });

  it("filters by year and technology", () => {
    const result = call("search_winners", { technology: "openai", year: 2026, limit: 50 });
    const results = result.results as { technologies: string[]; year: number }[];
    expect(results.length).toBeGreaterThan(0);
    for (const row of results) {
      expect(row.technologies).toContain("openai");
      expect(row.year).toBe(2026);
    }
  });

  it("clamps limit into 1-50 and never returns more than it claims", () => {
    const big = call("search_winners", { limit: 5000 });
    expect((big.results as unknown[]).length).toBeLessThanOrEqual(50);
    const small = call("search_winners", { limit: -3 });
    expect((small.results as unknown[]).length).toBe(1);
    expect(big.returned).toBe((big.results as unknown[]).length);
  });

  it("returns an empty result set rather than throwing on a nonsense filter", () => {
    const result = call("search_winners", { category: "not-a-real-category" });
    expect(result.total_matches).toBe(0);
    expect(result.results).toEqual([]);
    expect(result.attribution).toBeDefined();
  });

  it("gives each result a site url and a source url", () => {
    const results = call("search_winners", { limit: 3 }).results as {
      url: string;
      source_url: string;
    }[];
    for (const row of results) {
      expect(row.url).toContain("/projects/");
      expect(row.source_url).toMatch(/^https?:\/\//);
    }
  });
});

describe("get_project and get_hackathon", () => {
  it("returns a project with its wins", () => {
    const project = call("get_project", { slug: "second-voice" });
    expect(project.name).toBe("Second Voice");
    expect(project.summary as string).not.toContain("TODO");
    const wins = project.wins as { hackathon: string; awards: { type: string }[] }[];
    expect(wins.some((w) => w.hackathon === "OpenAI Build Week")).toBe(true);
    expect(wins[0].awards[0].type).toBeTruthy();
  });

  it("returns a hackathon with its full winner list", () => {
    const hackathon = call("get_hackathon", { slug: "openai-build-week" });
    expect(hackathon.name).toBe("OpenAI Build Week");
    expect(hackathon.start_date).toBe("2026-07-13");
    expect(hackathon.end_date).toBe("2026-07-21");
    expect((hackathon.winners as unknown[]).length).toBe(8);
  });

  it("explains itself instead of throwing on an unknown slug", () => {
    expect(call("get_project", { slug: "does-not-exist" }).error).toContain("does-not-exist");
    expect(call("get_hackathon", { slug: "does-not-exist" }).error).toContain("does-not-exist");
  });
});

describe("list_facets", () => {
  it("lists the slugs search_winners will accept", () => {
    const facets = call("list_facets");
    const categories = facets.categories as { slug: string }[];
    const technologies = facets.technologies as { slug: string }[];
    expect(categories.some((c) => c.slug === "healthcare")).toBe(true);
    expect(technologies.some((t) => t.slug === "openai")).toBe(true);
    expect((facets.years as number[])[0]).toBeGreaterThanOrEqual(2026);
    expect((facets.totals as { hackathons: number }).hackathons).toBeGreaterThan(600);
  });
});
