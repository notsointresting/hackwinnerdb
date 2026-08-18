"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = value.trim();
        router.push(q ? `/projects?q=${encodeURIComponent(q)}` : "/projects");
      }}
      className="mt-8 flex w-full max-w-2xl items-center gap-2 rounded-lg border border-line-strong bg-bg px-3 py-2"
    >
      <label htmlFor="hero-search" className="sr-only">
        Search projects, technologies, hackathons
      </label>
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 shrink-0 fill-current text-fg-muted">
        <path d="M7 2a5 5 0 1 0 3.1 8.9l3 3 1.1-1.1-3-3A5 5 0 0 0 7 2m0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
      </svg>
      <input
        id="hero-search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        placeholder="Search projects, technologies, hackathons…"
        className="w-full bg-transparent py-1 text-sm outline-none"
      />
      <kbd className="hidden shrink-0 rounded border border-line px-1.5 py-0.5 font-mono text-[10px] text-fg-muted sm:block">
        ⌘K
      </kbd>
      <button
        type="submit"
        className="shrink-0 rounded-md bg-fg px-3 py-1.5 text-sm font-medium text-bg"
      >
        Search
      </button>
    </form>
  );
}
