import { describe, expect, it } from "vitest";
import { yamlRepository, computeStats } from "@/lib/load-dataset";
import { filterWinners, paginate, sortWinners } from "@/lib/queries";
import { searchWinners } from "@/lib/search";
import { normalizeUrl, similarity, slugify } from "@/lib/utils";

const dataset = yamlRepository.getDataset();

describe("production dataset", () => {
  it("resolves every entry to a project and hackathon", () => {
    expect(dataset.winners).toHaveLength(dataset.entries.length);
  });

  it("gives every winner a source URL", () => {
    for (const winner of dataset.winners) {
      expect(winner.entry.source.url).toMatch(/^https?:/);
    }
  });

  it("uses only canonical category and technology slugs", () => {
    const categories = new Set(dataset.categories.map((c) => c.slug));
    const technologies = new Set(dataset.technologies.map((t) => t.slug));
    for (const project of dataset.projects) {
      for (const slug of project.categories) expect(categories.has(slug)).toBe(true);
      for (const slug of project.technologies) expect(technologies.has(slug)).toBe(true);
    }
  });

  it("computes stats from real records", () => {
    const stats = computeStats(dataset);
    expect(stats.projects).toBe(dataset.projects.length);
    expect(stats.hackathons).toBe(dataset.hackathons.length);
  });
});

describe("queries", () => {
  it("filters by technology", () => {
    const tech = dataset.projects[0].technologies[0];
    const filtered = filterWinners(dataset.winners, { technology: [tech] });
    expect(filtered.length).toBeGreaterThan(0);
    for (const winner of filtered) expect(winner.project.technologies).toContain(tech);
  });

  it("filters by year and award together", () => {
    const sample = dataset.winners[0];
    const filtered = filterWinners(dataset.winners, {
      year: [String(sample.hackathon.year)],
      award: [sample.primaryAward.type],
    });
    expect(filtered).toContain(sample);
  });

  it("sorts A–Z", () => {
    const sorted = sortWinners(dataset.winners, "az").map((w) => w.project.name);
    expect(sorted).toEqual([...sorted].sort((a, b) => a.localeCompare(b)));
  });

  it("paginates without losing records", () => {
    const first = paginate(dataset.winners, 1, 5);
    expect(first.items.length).toBeLessThanOrEqual(5);
    expect(first.total).toBe(dataset.winners.length);
  });
});

describe("search", () => {
  it("returns all winners for an empty query", () => {
    expect(searchWinners(dataset.winners, "")).toHaveLength(dataset.winners.length);
  });

  it("finds a project by name", () => {
    const target = dataset.projects[0];
    const results = searchWinners(dataset.winners, target.name);
    expect(results.some((w) => w.project.id === target.id)).toBe(true);
  });

  it("tolerates a typo", () => {
    const target = dataset.projects[0];
    const typo = target.name.slice(0, -1) + "x";
    const results = searchWinners(dataset.winners, typo);
    expect(results.some((w) => w.project.id === target.id)).toBe(true);
  });
});

describe("utils", () => {
  it("slugifies names", () => {
    expect(slugify("Gemini Movie Detectives!")).toBe("gemini-movie-detectives");
    expect(slugify("C++")).toBe("c-plus-plus");
  });

  it("normalizes URLs for duplicate detection", () => {
    expect(normalizeUrl("https://www.Example.com/Path/")).toBe("example.com/path");
  });

  it("scores similar names highly", () => {
    expect(similarity("medsafe", "med-safe")).toBeGreaterThan(0.8);
  });
});
