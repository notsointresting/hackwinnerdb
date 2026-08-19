"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function HeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [isFocused, setIsFocused] = useState(false);

  return (
    <form
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        const q = value.trim();
        router.push(q ? `/projects?q=${encodeURIComponent(q)}` : "/projects");
      }}
      className={`group relative mt-8 flex w-full max-w-2xl items-center gap-2.5 rounded-2xl border bg-bg-subtle/90 px-4 py-2.5 shadow-[0_10px_30px_-15px_rgba(0,0,0,0.7)] backdrop-blur-xl transition-all duration-300 ${
        isFocused
          ? "border-accent shadow-[0_0_25px_-5px_rgba(185,139,255,0.35)] ring-1 ring-accent/50"
          : "border-line-strong/80 hover:border-accent-line hover:shadow-[0_0_20px_-8px_rgba(123,63,242,0.25)]"
      }`}
    >
      <label htmlFor="hero-search" className="sr-only">
        Search projects, technologies, hackathons
      </label>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className={`size-4.5 shrink-0 fill-current transition-colors duration-200 ${
          isFocused ? "text-accent" : "text-fg-muted group-hover:text-fg"
        }`}
      >
        <path d="M7 2a5 5 0 1 0 3.1 8.9l3 3 1.1-1.1-3-3A5 5 0 0 0 7 2m0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
      </svg>
      <input
        id="hero-search"
        value={value}
        onChange={(event) => setValue(event.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Search projects, technologies, hackathons…"
        className="w-full bg-transparent py-1 text-sm text-fg placeholder:text-fg-muted/60 outline-none"
      />
      {value ? (
        <button
          type="button"
          onClick={() => setValue("")}
          className="rounded-full p-1 text-fg-muted transition-colors hover:bg-bg-raised hover:text-fg"
          aria-label="Clear search input"
        >
          <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3.5 fill-current">
            <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
          </svg>
        </button>
      ) : null}
      <kbd className="hidden shrink-0 rounded-md border border-line/80 bg-bg-raised/70 px-2 py-0.5 font-mono text-[10px] font-medium text-fg-muted sm:block">
        ⌘K
      </kbd>
      <button
        type="submit"
        className="shrink-0 rounded-xl bg-fg px-4 py-1.5 text-sm font-medium text-bg shadow-sm transition-all duration-200 hover:bg-fg/90 hover:shadow-md motion-safe:active:scale-95"
      >
        Search
      </button>
    </form>
  );
}
