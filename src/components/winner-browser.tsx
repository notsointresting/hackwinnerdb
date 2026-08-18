import { Suspense } from "react";
import { EmptyState } from "./ui";
import { FilterPanel, type FacetGroup } from "./filter-panel";
import { ResultsToolbar } from "./results-toolbar";
import { Pagination } from "./pagination";
import { WinnerCard } from "./winner-card";
import { filterWinners, paginate, sortWinners } from "@/lib/queries";
import { searchWinners } from "@/lib/search";
import { parseFilters, parsePage, parseSort, type RawParams } from "@/lib/search-params";
import { labelMaps } from "@/lib/labels";
import { PER_PAGE } from "@/lib/site";
import type { Dataset, WinnerRecord } from "@/types";

function facets(
  dataset: Dataset,
  winners: WinnerRecord[],
  omit: Set<string>,
): FacetGroup[] {
  const labels = labelMaps(dataset);
  const count = (pick: (w: WinnerRecord) => string[]) => {
    const map = new Map<string, number>();
    for (const w of winners) for (const v of pick(w)) map.set(v, (map.get(v) ?? 0) + 1);
    return map;
  };

  const years = count((w) => [String(w.hackathon.year)]);
  const awards = count((w) => w.entry.awards.map((a) => a.type));
  const categories = count((w) => w.project.categories);
  const technologies = count((w) => w.project.technologies);
  const sources = count((w) => [w.entry.source.platform]);

  const toOptions = (map: Map<string, number>, label: (slug: string) => string, numeric = false) =>
    [...map.entries()]
      .sort((a, b) => (numeric ? Number(b[0]) - Number(a[0]) : b[1] - a[1] || a[0].localeCompare(b[0])))
      .map(([value, c]) => ({ value, label: label(value), count: c }));

  return (
    [
      { param: "year", title: "Year", options: toOptions(years, (y) => y, true) },
      {
        param: "award",
        title: "Award",
        options: toOptions(awards, (slug) => labels.awardTypes.get(slug) ?? slug),
      },
      {
        param: "category",
        title: "Category",
        options: toOptions(categories, (slug) => labels.categories.get(slug) ?? slug),
      },
      {
        param: "technology",
        title: "Technology",
        searchable: true,
        options: toOptions(technologies, (slug) => labels.technologies.get(slug) ?? slug),
      },
      {
        param: "source",
        title: "Source",
        options: toOptions(sources, (slug) => labels.sources.get(slug) ?? slug),
      },
    ] as FacetGroup[]
  ).filter((group) => !omit.has(group.param));
}

export function WinnerBrowser({
  dataset,
  candidates,
  params,
  basePath,
  omitFacets = [],
}: {
  dataset: Dataset;
  candidates: WinnerRecord[];
  params: RawParams;
  basePath: string;
  omitFacets?: string[];
}) {
  const labels = labelMaps(dataset);
  const filters = parseFilters(params);
  const sort = parseSort(params);
  const page = parsePage(params);

  const searched = searchWinners(candidates, filters.q ?? "");
  const filtered = filterWinners(searched, filters);
  const ordered = filters.q ? filtered : sortWinners(filtered, sort);
  const result = paginate(ordered, page, PER_PAGE);

  const makeHref = (nextPage: number) => {
    const next = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
      if (key === "page" || value === undefined) continue;
      for (const v of Array.isArray(value) ? value : [value]) next.append(key, v);
    }
    next.set("page", String(nextPage));
    return `${basePath}?${next.toString()}`;
  };

  return (
    <div className="grid gap-8 lg:grid-cols-[220px_minmax(0,1fr)]">
      <Suspense fallback={null}>
        <FilterPanel groups={facets(dataset, candidates, new Set(omitFacets))} />
      </Suspense>
      <div>
        <Suspense fallback={null}>
          <ResultsToolbar total={result.total} />
        </Suspense>
        {result.items.length ? (
          <div className="hw-stagger mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {result.items.map((winner, i) => (
              <WinnerCard
                key={winner.entry.id}
                winner={winner}
                labels={labels}
                priority={i < 3}
              />
            ))}
          </div>
        ) : (
          <div className="mt-6">
            <EmptyState
              title="No winners match these filters."
              hint="Try clearing a filter or searching for something broader."
            />
          </div>
        )}
        <Pagination page={result.page} totalPages={result.totalPages} makeHref={makeHref} />
      </div>
    </div>
  );
}
