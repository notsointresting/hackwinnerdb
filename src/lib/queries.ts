import type { Dataset, WinnerRecord } from "@/types";

export interface WinnerFilters {
  q?: string;
  year?: string[];
  award?: string[];
  category?: string[];
  technology?: string[];
  source?: string[];
  hasGithub?: boolean;
  hasDemo?: boolean;
  hasVideo?: boolean;
  verified?: boolean;
}

export type SortKey = "recent" | "oldest" | "award" | "added" | "az";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recent", label: "Most Recent" },
  { value: "oldest", label: "Oldest" },
  { value: "award", label: "Award Rank" },
  { value: "added", label: "Recently Added" },
  { value: "az", label: "A–Z" },
];

const some = (list: string[] | undefined) => list && list.length > 0;

export function filterWinners(winners: WinnerRecord[], f: WinnerFilters): WinnerRecord[] {
  return winners.filter((w) => {
    if (some(f.year) && !f.year!.includes(String(w.hackathon.year))) return false;
    if (some(f.award) && !w.entry.awards.some((a) => f.award!.includes(a.type))) return false;
    if (some(f.category) && !w.project.categories.some((c) => f.category!.includes(c))) return false;
    if (some(f.technology) && !w.project.technologies.some((t) => f.technology!.includes(t)))
      return false;
    if (some(f.source) && !f.source!.includes(w.entry.source.platform)) return false;
    if (f.hasGithub && !w.project.github_url) return false;
    if (f.hasDemo && !w.project.demo_url) return false;
    if (f.hasVideo && !w.project.video_url) return false;
    if (f.verified && w.entry.verification.status !== "verified") return false;
    return true;
  });
}

export function sortWinners(winners: WinnerRecord[], sort: SortKey): WinnerRecord[] {
  const list = [...winners];
  switch (sort) {
    case "oldest":
      return list.sort((a, b) => a.hackathon.year - b.hackathon.year || a.awardWeight - b.awardWeight);
    case "award":
      return list.sort((a, b) => a.awardWeight - b.awardWeight || b.hackathon.year - a.hackathon.year);
    case "added":
      return list.sort((a, b) =>
        b.entry.verification.checked_at.localeCompare(a.entry.verification.checked_at),
      );
    case "az":
      return list.sort((a, b) => a.project.name.localeCompare(b.project.name));
    case "recent":
    default:
      return list.sort((a, b) => b.hackathon.year - a.hackathon.year || a.awardWeight - b.awardWeight);
  }
}

export function paginate<T>(items: T[], page: number, perPage: number) {
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const current = Math.min(Math.max(1, page), totalPages);
  return {
    items: items.slice((current - 1) * perPage, current * perPage),
    page: current,
    totalPages,
    total: items.length,
  };
}

/** Winners of a single project, best award first. */
export function winnersForProject(dataset: Dataset, projectId: string) {
  return dataset.winners
    .filter((w) => w.project.id === projectId)
    .sort((a, b) => b.hackathon.year - a.hackathon.year || a.awardWeight - b.awardWeight);
}

export function winnersForHackathon(dataset: Dataset, hackathonId: string) {
  return dataset.winners
    .filter((w) => w.hackathon.id === hackathonId)
    .sort((a, b) => a.awardWeight - b.awardWeight || a.project.name.localeCompare(b.project.name));
}

export function countBy<T>(items: T[], key: (item: T) => string[] | string): Map<string, number> {
  const counts = new Map<string, number>();
  for (const item of items) {
    const raw = key(item);
    for (const k of Array.isArray(raw) ? raw : [raw]) {
      counts.set(k, (counts.get(k) ?? 0) + 1);
    }
  }
  return counts;
}

export function topEntries(counts: Map<string, number>, limit: number) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit);
}

/** Technologies most often shipped alongside `slug`, computed from the dataset. */
export function pairedTechnologies(dataset: Dataset, slug: string, limit = 8) {
  const counts = new Map<string, number>();
  for (const project of dataset.projects) {
    if (!project.technologies.includes(slug)) continue;
    for (const tech of project.technologies) {
      if (tech === slug) continue;
      counts.set(tech, (counts.get(tech) ?? 0) + 1);
    }
  }
  return topEntries(counts, limit);
}
