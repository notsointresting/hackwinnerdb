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
        className="rounded-md border border-line p-1.5 text-fg-muted"
      >
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
          <path d="M1 3h14v1.5H1zm0 4.25h14v1.5H1zM1 11.5h14V13H1z" />
        </svg>
      </button>
      {open ? (
        <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setOpen(false)}>
          <nav
            aria-label="Mobile"
            className="ml-auto flex h-full w-72 flex-col gap-1 border-l border-line bg-bg p-4"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="mb-4 self-end rounded-md border border-line px-2 py-1 text-sm"
            >
              Close
            </button>
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-3 py-2 text-sm hover:bg-bg-subtle"
              >
                {link.label}
              </Link>
            ))}
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-2 text-sm text-fg-muted hover:bg-bg-subtle"
            >
              GitHub ↗
            </a>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
