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
    <div className="flex flex-wrap items-center gap-3 border-b border-line pb-4">
      <form role="search" onSubmit={submit} className="flex min-w-0 flex-1 items-center gap-2">
        <label htmlFor="results-search" className="sr-only">
          Search HackWinnerDB
        </label>
        <input
          id="results-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search HackWinnerDB"
          className="w-full min-w-0 rounded-md border border-line bg-bg px-3 py-1.5 text-sm outline-none focus:border-line-strong"
        />
        <button type="submit" className="rounded-md border border-line px-3 py-1.5 text-sm">
          Search
        </button>
      </form>
      <p aria-live="polite" className="text-sm text-fg-muted">
        {total} result{total === 1 ? "" : "s"}
      </p>
      <label className="flex items-center gap-2 text-sm">
        <span className="text-fg-muted">Sort</span>
        <select
          value={params.get("sort") ?? "recent"}
          onChange={(event) => changeSort(event.target.value)}
          className="rounded-md border border-line bg-bg px-2 py-1.5 text-sm"
        >
          {SORT_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
