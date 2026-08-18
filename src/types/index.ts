import type {
  Award,
  AwardType,
  Category,
  Entry,
  Hackathon,
  Project,
  SourcePlatform,
  Technology,
} from "@/schemas";

export type { Award, AwardType, Category, Entry, Hackathon, Project, SourcePlatform, Technology };

export interface AwardTypeMeta {
  slug: AwardType;
  name: string;
  weight: number;
}

export interface SourceMeta {
  slug: SourcePlatform;
  name: string;
  homepage?: string | null;
}

/** A denormalized "winner" row: one entry joined with its project and hackathon. */
export interface WinnerRecord {
  entry: Entry;
  project: Project;
  hackathon: Hackathon;
  /** Highest-ranked award on the entry (lowest award-type weight). */
  primaryAward: Award;
  /** Sort weight of the primary award; lower is better. */
  awardWeight: number;
}

export interface Dataset {
  hackathons: Hackathon[];
  projects: Project[];
  entries: Entry[];
  categories: Category[];
  technologies: Technology[];
  awardTypes: AwardTypeMeta[];
  sources: SourceMeta[];
  winners: WinnerRecord[];
  generatedAt: string;
}

export interface DataStats {
  projects: number;
  hackathons: number;
  entries: number;
  technologies: number;
  categories: number;
  minYear: number | null;
  maxYear: number | null;
}
