"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import MiniSearch from "minisearch";

export interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  kind: "Project" | "Hackathon" | "Technology" | "Category";
  href: string;
}

export function CommandPalette({ items }: { items: CommandItem[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const index = useMemo(() => {
    const mini = new MiniSearch<CommandItem>({
      fields: ["title", "subtitle", "kind"],
      storeFields: ["id"],
      searchOptions: { prefix: true, fuzzy: 0.2, boost: { title: 3 } },
    });
    mini.addAll(items);
    return mini;
  }, [items]);

  const results = useMemo(() => {
    if (!query.trim()) return items.slice(0, 8);
    const byId = new Map(items.map((i) => [i.id, i]));
    return index
      .search(query)
      .map((r) => byId.get(String(r.id)))
      .filter((i): i is CommandItem => Boolean(i))
      .slice(0, 12);
  }, [query, index, items]);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setActive(0);
        setOpen((prev) => !prev);
      }
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  function go(item: CommandItem | undefined) {
    if (!item) return;
    setOpen(false);
    setQuery("");
    router.push(item.href);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-md border border-line bg-bg-subtle px-2.5 py-1.5 text-sm text-fg-muted hover:border-line-strong hover:text-fg"
        aria-label="Open search (Command or Control + K)"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
          <path d="M7 2a5 5 0 1 0 3.1 8.9l3 3 1.1-1.1-3-3A5 5 0 0 0 7 2m0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
        </svg>
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden rounded border border-line px-1 font-mono text-[10px] sm:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 p-4 pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search HackWinnerDB"
            className="w-full max-w-xl overflow-hidden rounded-lg border border-line-strong bg-bg shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <input
              ref={inputRef}
              value={query}
              onChange={(event) => {
                setQuery(event.target.value);
                setActive(0);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setActive((a) => Math.min(a + 1, results.length - 1));
                } else if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setActive((a) => Math.max(a - 1, 0));
                } else if (event.key === "Enter") {
                  event.preventDefault();
                  go(results[active]);
                }
              }}
              placeholder="Search projects, hackathons, technologies…"
              aria-label="Search query"
              className="w-full border-b border-line bg-transparent px-4 py-3 text-sm outline-none"
            />
            <ul className="max-h-80 overflow-y-auto py-1" role="listbox">
              {results.length === 0 ? (
                <li className="px-4 py-6 text-center text-sm text-fg-muted">No matches.</li>
              ) : (
                results.map((item, i) => (
                  <li key={item.id} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(item)}
                      className={`flex w-full items-center justify-between gap-3 px-4 py-2 text-left text-sm ${
                        i === active ? "bg-bg-subtle" : ""
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium">{item.title}</span>
                        <span className="block truncate text-xs text-fg-muted">{item.subtitle}</span>
                      </span>
                      <span className="shrink-0 text-[11px] uppercase tracking-wide text-fg-muted">
                        {item.kind}
                      </span>
                    </button>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}
    </>
  );
}
