import { describe, expect, it } from "vitest";
import { entrySchema, hackathonSchema, projectSchema } from "@/schemas";

const hackathon = {
  id: "example-hack-2026",
  name: "Example Hack",
  slug: "example-hack-2026",
  year: 2026,
  sources: ["https://example.com/winners"],
};

const project = {
  id: "medsafe",
  name: "MedSafe",
  slug: "medsafe",
  tagline: "AI-assisted medication safety platform",
  summary: "Checks prescriptions against a patient's history and flags interactions.",
  categories: ["healthcare"],
  technologies: ["python"],
};

const entry = {
  id: "medsafe-example-hack-2026",
  project_id: "medsafe",
  hackathon_id: "example-hack-2026",
  source: { platform: "devpost", url: "https://devpost.com/software/example" },
  awards: [{ type: "grand-prize", title: "Grand Prize", rank: 1 }],
  verification: { status: "verified", checked_at: "2026-08-18" },
};

describe("hackathon schema", () => {
  it("accepts a minimal valid record", () => {
    expect(hackathonSchema.parse(hackathon).id).toBe("example-hack-2026");
  });

  it("requires at least one source", () => {
    expect(hackathonSchema.safeParse({ ...hackathon, sources: [] }).success).toBe(false);
  });

  it("rejects an end date before the start date", () => {
    const result = hackathonSchema.safeParse({
      ...hackathon,
      start_date: "2026-05-10",
      end_date: "2026-05-01",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a prize pool without a currency", () => {
    expect(hackathonSchema.safeParse({ ...hackathon, prize_pool: 1000 }).success).toBe(false);
  });

  it("rejects an implausible year", () => {
    expect(hackathonSchema.safeParse({ ...hackathon, year: 1888 }).success).toBe(false);
  });
});

describe("project schema", () => {
  it("accepts a valid record", () => {
    expect(projectSchema.parse(project).slug).toBe("medsafe");
  });

  it("rejects a non-kebab-case slug", () => {
    expect(projectSchema.safeParse({ ...project, slug: "Med Safe" }).success).toBe(false);
  });

  it("requires at least one category", () => {
    expect(projectSchema.safeParse({ ...project, categories: [] }).success).toBe(false);
  });
});

describe("entry schema", () => {
  it("accepts a valid record", () => {
    expect(entrySchema.parse(entry).awards).toHaveLength(1);
  });

  it("requires a source URL", () => {
    const { ...withoutSource } = entry;
    expect(entrySchema.safeParse({ ...withoutSource, source: undefined }).success).toBe(false);
  });

  it("rejects an unknown award type", () => {
    const result = entrySchema.safeParse({
      ...entry,
      awards: [{ type: "best-vibes", title: "Best Vibes" }],
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one award", () => {
    expect(entrySchema.safeParse({ ...entry, awards: [] }).success).toBe(false);
  });
});
