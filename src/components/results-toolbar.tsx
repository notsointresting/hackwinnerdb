"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { SORT_OPTIONS } from "@/lib/queries";

export function ResultsToolbar({ total }: { total: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [query, setQuery] = useState(params.get("q") ?? "");

  function submit(event: React.FormEvent) {
    event.preventDefault();
    const next = new URLSearchParams(params.toString());
    if (query.trim()) next.set("q", query.trim());
    else next.delete("q");
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  function changeSort(value: string) {
    const next = new URLSearchParams(params.toString());
    next.set("sort", value);
    next.delete("page");
    router.push(`${pathname}?${next.toString()}`, { scroll: false });
  }

  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-line/70 bg-bg-subtle/50 p-3 backdrop-blur-md">
      <form role="search" onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
        <label htmlFor="results-search" className="sr-only">
          Search HackWinnerDB
        </label>
        <div className="relative flex min-w-0 flex-1 items-center">
          <svg aria-hidden="true" viewBox="0 0 16 16" className="absolute left-3 size-4 fill-current text-fg-muted">
            <path d="M7 2a5 5 0 1 0 3.1 8.9l3 3 1.1-1.1-3-3A5 5 0 0 0 7 2m0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
          </svg>
          <input
            id="results-search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search within winners…"
            className="w-full min-w-0 rounded-xl border border-line/80 bg-bg/80 py-2 pl-9 pr-8 text-sm text-fg outline-none transition-all duration-200 placeholder:text-fg-muted/60 focus:border-accent focus:ring-1 focus:ring-accent/40"
          />
          {query ? (
            <button
              type="button"
              onClick={() => {
                setQuery("");
                const next = new URLSearchParams(params.toString());
                next.delete("q");
                next.delete("page");
                router.push(`${pathname}?${next.toString()}`, { scroll: false });
              }}
              className="absolute right-2.5 rounded-full p-1 text-fg-muted hover:bg-bg-subtle hover:text-fg"
              aria-label="Clear search query"
            >
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06" />
              </svg>
            </button>
          ) : null}
        </div>
        <button
          type="submit"
          className="rounded-xl bg-fg px-4 py-2 text-sm font-semibold text-bg transition-all duration-200 hover:bg-fg/90 motion-safe:active:scale-95"
        >
          Search
        </button>
      </form>

      <div className="flex items-center gap-3">
        <p aria-live="polite" className="text-xs font-medium text-fg-muted">
          <span className="font-mono font-bold text-accent">{total}</span> result{total === 1 ? "" : "s"}
        </p>

        <label className="flex items-center gap-2 text-xs font-medium text-fg-muted">
          <span>Sort by</span>
          <select
            value={params.get("sort") ?? "recent"}
            onChange={(event) => changeSort(event.target.value)}
            className="rounded-xl border border-line/80 bg-bg/90 px-3 py-1.5 text-xs text-fg outline-none transition-colors duration-200 focus:border-accent"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>
    </div>
  );
}
