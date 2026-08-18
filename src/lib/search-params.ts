import type { SortKey, WinnerFilters } from "./queries";

export type RawParams = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined): string[] =>
  value === undefined ? [] : (Array.isArray(value) ? value : [value]).flatMap((v) => v.split(","));

export function parseFilters(params: RawParams): WinnerFilters {
  return {
    q: typeof params.q === "string" ? params.q : "",
    year: list(params.year),
    award: list(params.award),
    category: list(params.category),
    technology: list(params.technology),
    source: list(params.source),
    hasGithub: params.github === "1",
    hasDemo: params.demo === "1",
    hasVideo: params.video === "1",
    verified: params.verified === "1",
  };
}

export function parseSort(params: RawParams): SortKey {
  const value = typeof params.sort === "string" ? params.sort : "recent";
  return (["recent", "oldest", "award", "added", "az"] as const).includes(value as SortKey)
    ? (value as SortKey)
    : "recent";
}

export function parsePage(params: RawParams): number {
  const value = Number(typeof params.page === "string" ? params.page : 1);
  return Number.isFinite(value) && value > 0 ? Math.floor(value) : 1;
}

export function hasActiveFilters(filters: WinnerFilters): boolean {
  return Boolean(
    filters.q ||
      filters.year?.length ||
      filters.award?.length ||
      filters.category?.length ||
      filters.technology?.length ||
      filters.source?.length ||
      filters.hasGithub ||
      filters.hasDemo ||
      filters.hasVideo ||
      filters.verified,
  );
}
