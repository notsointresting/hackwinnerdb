"use client";

import { useState } from "react";
import Link from "next/link";
import { NAV_LINKS } from "@/lib/nav";
import { SITE } from "@/lib/site";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        aria-expanded={open}
        className="rounded-xl border border-line/80 bg-bg-subtle/70 p-2 text-fg-muted backdrop-blur-sm transition-colors hover:border-accent-line hover:text-fg"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
          <path d="M1 3h14v1.5H1zm0 4.25h14v1.5H1zM1 11.5h14V13H1z" />
        </svg>
      </button>
      {open ? (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
          onClick={() => setOpen(false)}
        >
          <nav
            aria-label="Mobile"
            className="hw-rise ml-auto flex h-full w-72 flex-col gap-1 border-l border-line/80 bg-bg-raised/95 p-5 shadow-2xl backdrop-blur-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between border-b border-line/60 pb-3">
              <span className="hw-display text-lg font-bold text-fg">Navigation</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg border border-line/80 bg-bg px-2.5 py-1 font-mono text-xs font-semibold text-fg-muted hover:text-fg"
              >
                ✕
              </button>
            </div>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-xl px-3.5 py-2.5 text-sm font-medium text-fg-muted transition-colors hover:bg-bg-subtle hover:text-fg"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="mt-2 inline-flex items-center justify-between rounded-xl border border-line/80 bg-bg px-3.5 py-2.5 text-sm font-medium text-fg hover:border-accent hover:text-accent"
            >
              <span>GitHub Repository</span>
              <span aria-hidden="true">↗</span>
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
