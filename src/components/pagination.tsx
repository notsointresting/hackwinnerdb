import Link from "next/link";

export function Pagination({
  page,
  totalPages,
  makeHref,
}: {
  page: number;
  totalPages: number;
  makeHref: (page: number) => string;
  }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 2,
  );

  return (
    <nav aria-label="Pagination" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link
          href={makeHref(page - 1)}
          className="rounded-xl border border-line/80 bg-bg-subtle/60 px-3.5 py-2 text-xs font-semibold text-fg-muted backdrop-blur-sm transition-all duration-200 hover:border-accent-line hover:bg-bg-subtle hover:text-fg motion-safe:hover:-translate-y-0.5"
        >
          ← Previous
        </Link>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1.5">
          {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-xs text-fg-muted">…</span> : null}
          <Link
            href={makeHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`min-w-9 rounded-xl border px-3 py-2 text-center font-mono text-xs font-semibold transition-all duration-200 ${
              p === page
                ? "border-accent-line bg-accent-bg text-accent shadow-[0_0_12px_rgba(185,139,255,0.2)]"
                : "border-line/80 bg-bg-subtle/60 text-fg-muted backdrop-blur-sm hover:border-accent-line hover:text-fg motion-safe:hover:-translate-y-0.5"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link
          href={makeHref(page + 1)}
          className="rounded-xl border border-line/80 bg-bg-subtle/60 px-3.5 py-2 text-xs font-semibold text-fg-muted backdrop-blur-sm transition-all duration-200 hover:border-accent-line hover:bg-bg-subtle hover:text-fg motion-safe:hover:-translate-y-0.5"
        >
          Next →
        </Link>
      ) : null}
    </nav>
  );
}
