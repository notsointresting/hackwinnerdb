"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

export interface FacetGroup {
  param: string;
  title: string;
  options: { value: string; label: string; count: number }[];
  searchable?: boolean;
}

const FLAGS = [
  { param: "github", label: "Has GitHub" },
  { param: "demo", label: "Has Demo" },
  { param: "video", label: "Has Video" },
  { param: "verified", label: "Verified source" },
];

export function FilterPanel({ groups }: { groups: FacetGroup[] }) {
  return (
    <>
      <div className="lg:hidden">
        <details className="rounded-lg border border-line">
          <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Filters</summary>
          <div className="border-t border-line p-4">
            <FilterControls groups={groups} />
          </div>
        </details>
      </div>
      <div className="hidden lg:sticky lg:top-20 lg:block lg:self-start">
        <FilterControls groups={groups} />
      </div>
    </>
  );
}

function FilterControls({ groups }: { groups: FacetGroup[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  function selected(param: string) {
    return new Set(params.getAll(param).flatMap((v) => v.split(",")));
  }

  function update(mutate: (next: URLSearchParams) => void) {
    const next = new URLSearchParams(params.toString());
    mutate(next);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function toggle(param: string, value: string) {
    update((next) => {
      const current = new Set(next.getAll(param).flatMap((v) => v.split(",")));
      next.delete(param);
      if (current.has(value)) current.delete(value);
      else current.add(value);
      for (const v of current) next.append(param, v);
    });
  }

  function toggleFlag(param: string) {
    update((next) => {
      if (next.get(param) === "1") next.delete(param);
      else next.set(param, "1");
    });
  }

  const active = [...params.keys()].some((k) => k !== "sort" && k !== "page" && k !== "view");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-semibold uppercase tracking-widest text-fg-muted">Filters</h2>
        {active ? (
          <button
            type="button"
            onClick={() => router.push(pathname, { scroll: false })}
            className="text-xs text-fg-muted underline hover:text-fg"
          >
            Clear all
          </button>
        ) : null}
      </div>

      {groups.map((group) => (
        <FacetSection
          key={group.param}
          group={group}
          selected={selected(group.param)}
          onToggle={(value) => toggle(group.param, value)}
        />
      ))}

      <fieldset>
        <legend className="mb-2 text-sm font-medium">Additional</legend>
        <div className="space-y-1.5">
          {FLAGS.map((flag) => (
            <label key={flag.param} className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={params.get(flag.param) === "1"}
                onChange={() => toggleFlag(flag.param)}
                className="size-4 accent-current"
              />
              {flag.label}
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
}

function FacetSection({
  group,
  selected,
  onToggle,
}: {
  group: FacetGroup;
  selected: Set<string>;
  onToggle: (value: string) => void;
}) {
  const [filter, setFilter] = useState("");
  const options = group.searchable
    ? group.options.filter((o) => o.label.toLowerCase().includes(filter.toLowerCase()))
    : group.options;

  if (!group.options.length) return null;

  return (
    <fieldset>
      <legend className="mb-2 text-sm font-medium">{group.title}</legend>
      {group.searchable ? (
        <>
          <label className="sr-only" htmlFor={`filter-${group.param}`}>
            Search {group.title}
          </label>
          <input
            id={`filter-${group.param}`}
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            placeholder={`Search ${group.title.toLowerCase()}`}
            className="mb-2 w-full rounded-md border border-line bg-bg px-2 py-1 text-sm outline-none focus:border-line-strong"
          />
        </>
      ) : null}
      <div className="max-h-56 space-y-1.5 overflow-y-auto pr-1">
        {options.slice(0, 60).map((option) => (
          <label key={option.value} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.has(option.value)}
              onChange={() => onToggle(option.value)}
              className="size-4 shrink-0 accent-current"
            />
            <span className="min-w-0 flex-1 truncate">{option.label}</span>
            <span className="shrink-0 font-mono text-xs text-fg-muted">{option.count}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}
