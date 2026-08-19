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
        className="group inline-flex items-center gap-2 rounded-xl border border-line/80 bg-bg-subtle/70 px-3 py-1.5 text-sm text-fg-muted backdrop-blur-sm transition-all duration-200 hover:border-accent-line hover:bg-bg-subtle hover:text-fg motion-safe:hover:-translate-y-0.5"
        aria-label="Open search (Command or Control + K)"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="size-4 fill-current text-fg-muted transition-colors group-hover:text-accent"
        >
          <path d="M7 2a5 5 0 1 0 3.1 8.9l3 3 1.1-1.1-3-3A5 5 0 0 0 7 2m0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
        </svg>
        <span className="hidden sm:inline">Search database</span>
        <kbd className="hidden rounded-md border border-line/80 bg-bg-raised/80 px-1.5 py-0.5 font-mono text-[10px] font-medium text-fg-muted sm:inline">
          ⌘K
        </kbd>
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/60 p-4 pt-[10vh] backdrop-blur-md animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Search HackWinnerDB"
            className="hw-pop w-full max-w-xl overflow-hidden rounded-2xl border border-accent-line/70 bg-bg-raised/95 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_30px_rgba(123,63,242,0.25)] backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative flex items-center border-b border-line px-4">
              <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 fill-current text-accent">
                <path d="M7 2a5 5 0 1 0 3.1 8.9l3 3 1.1-1.1-3-3A5 5 0 0 0 7 2m0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
              </svg>
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
                className="w-full bg-transparent px-3 py-3.5 text-sm text-fg outline-none placeholder:text-fg-muted/60"
              />
              <kbd className="rounded border border-line bg-bg px-1.5 py-0.5 font-mono text-[10px] text-fg-muted">
                ESC
              </kbd>
            </div>
            <ul className="max-h-84 overflow-y-auto p-2" role="listbox">
              {results.length === 0 ? (
                <li className="px-4 py-8 text-center text-sm text-fg-muted">
                  No matching projects or hackathons found.
                </li>
              ) : (
                results.map((item, i) => (
                  <li key={item.id} role="option" aria-selected={i === active}>
                    <button
                      type="button"
                      onMouseEnter={() => setActive(i)}
                      onClick={() => go(item)}
                      className={`flex w-full items-center justify-between gap-3 rounded-xl px-3.5 py-2.5 text-left text-sm transition-colors duration-150 ${
                        i === active
                          ? "bg-accent-bg text-fg ring-1 ring-accent-line/60"
                          : "text-fg-muted hover:bg-bg-subtle hover:text-fg"
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-fg">{item.title}</span>
                        <span className="block truncate text-xs text-fg-muted">{item.subtitle}</span>
                      </span>
                      <span className="shrink-0 rounded-full border border-line bg-bg px-2 py-0.5 font-mono text-[10px] font-medium text-accent">
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
