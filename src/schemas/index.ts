import { z } from "zod";

export const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const Slug = z.string().regex(slugRegex, "must be a lowercase kebab-case slug");
const Url = z.url();
const NullableUrl = Url.nullable().optional();
const IsoDate = z.iso.date();

export const CURRENT_YEAR = new Date().getUTCFullYear();
const Year = z.int().min(1990).max(CURRENT_YEAR + 1);

export const SOURCE_PLATFORMS = [
  "devpost",
  "dorahacks",
  "mlh",
  "unstop",
  "hackerearth",
  "lablab",
  "hackquest",
  "ethglobal",
  "organizer",
  "github",
  "other",
] as const;
export type SourcePlatform = (typeof SOURCE_PLATFORMS)[number];

export const AWARD_TYPES = [
  "grand-prize",
  "winner",
  "first-place",
  "second-place",
  "third-place",
  "category-winner",
  "track-winner",
  "sponsor-prize",
  "audience-choice",
  "community-choice",
  "honorable-mention",
  "finalist",
  "other",
] as const;
export type AwardType = (typeof AWARD_TYPES)[number];

export const TECHNOLOGY_TYPES = [
  "language",
  "framework",
  "ai-model",
  "ai-platform",
  "database",
  "cloud",
  "hardware",
  "blockchain",
  "api",
  "tool",
  "platform",
  "other",
] as const;

export const HACKATHON_MODES = ["online", "in-person", "hybrid"] as const;

/** ISO 4217-ish: three uppercase letters. */
const Currency = z.string().regex(/^[A-Z]{3}$/, "must be a 3-letter ISO 4217 code");

export const categorySchema = z.object({
  slug: Slug,
  name: z.string().min(1),
  description: z.string().optional(),
});
export const categoriesFileSchema = z.array(categorySchema).min(1);

export const technologySchema = z.object({
  slug: Slug,
  name: z.string().min(1),
  type: z.enum(TECHNOLOGY_TYPES),
  aliases: z.array(z.string()).optional(),
});
export const technologiesFileSchema = z.array(technologySchema).min(1);

export const awardTypeSchema = z.object({
  slug: z.enum(AWARD_TYPES),
  name: z.string().min(1),
  /** Lower sorts first when ranking awards. */
  weight: z.int().min(0),
});
export const awardTypesFileSchema = z.array(awardTypeSchema).min(1);

export const sourceEntrySchema = z.object({
  slug: z.enum(SOURCE_PLATFORMS),
  name: z.string().min(1),
  homepage: NullableUrl,
});
export const sourcesFileSchema = z.array(sourceEntrySchema).min(1);

export const hackathonSchema = z
  .object({
    id: Slug,
    name: z.string().min(1),
    slug: Slug,
    organizer: z.array(z.string().min(1)).default([]),
    year: Year,
    start_date: IsoDate.nullable().optional(),
    end_date: IsoDate.nullable().optional(),
    mode: z.enum(HACKATHON_MODES).nullable().optional(),
    location: z.string().nullable().optional(),
    website_url: NullableUrl,
    sources: z.array(Url).min(1, "at least one source URL is required"),
    platform: z.enum(SOURCE_PLATFORMS).nullable().optional(),
    participant_count: z.int().positive().nullable().optional(),
    total_submissions: z.int().positive().nullable().optional(),
    prize_pool: z.number().nonnegative().nullable().optional(),
    currency: Currency.nullable().optional(),
    description: z.string().nullable().optional(),
  })
  .refine((h) => !h.start_date || !h.end_date || h.start_date <= h.end_date, {
    message: "start_date must be on or before end_date",
    path: ["start_date"],
  })
  .refine((h) => h.prize_pool == null || h.currency != null, {
    message: "currency is required when prize_pool is set",
    path: ["currency"],
  });

export const builderSchema = z.object({
  name: z.string().min(1),
  github: z.string().nullable().optional(),
  linkedin: NullableUrl,
  website: NullableUrl,
});

export const projectSchema = z.object({
  id: Slug,
  name: z.string().min(1),
  slug: Slug,
  tagline: z.string().min(1).max(160),
  summary: z.string().min(1),
  problem: z.string().nullable().optional(),
  solution: z.string().nullable().optional(),
  website_url: NullableUrl,
  github_url: NullableUrl,
  demo_url: NullableUrl,
  video_url: NullableUrl,
  categories: z.array(Slug).min(1),
  technologies: z.array(Slug).default([]),
  builders: z.array(builderSchema).default([]),
});

export const awardSchema = z.object({
  type: z.enum(AWARD_TYPES),
  title: z.string().min(1),
  rank: z.int().min(1).max(100).nullable().optional(),
  track: z.string().nullable().optional(),
  sponsor: z.string().nullable().optional(),
  prize_amount: z.number().nonnegative().nullable().optional(),
  currency: Currency.nullable().optional(),
});

export const entrySchema = z.object({
  id: Slug,
  project_id: Slug,
  hackathon_id: Slug,
  submission_url: NullableUrl,
  source: z.object({
    platform: z.enum(SOURCE_PLATFORMS),
    url: Url,
    external_id: z.string().nullable().optional(),
  }),
  awards: z.array(awardSchema).min(1, "an entry must record at least one award"),
  verification: z.object({
    status: z.enum(["verified", "unverified", "disputed"]),
    checked_at: IsoDate,
    notes: z.string().nullable().optional(),
  }),
});

export type Hackathon = z.infer<typeof hackathonSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Entry = z.infer<typeof entrySchema>;
export type Award = z.infer<typeof awardSchema>;
export type Category = z.infer<typeof categorySchema>;
export type Technology = z.infer<typeof technologySchema>;
export type Builder = z.infer<typeof builderSchema>;
