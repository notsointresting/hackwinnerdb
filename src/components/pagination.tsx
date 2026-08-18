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
    <nav aria-label="Pagination" className="mt-8 flex flex-wrap items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={makeHref(page - 1)} className="rounded-md border border-line px-3 py-1.5 text-sm">
          Previous
        </Link>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - pages[i - 1] > 1 ? <span className="px-1 text-fg-muted">…</span> : null}
          <Link
            href={makeHref(p)}
            aria-current={p === page ? "page" : undefined}
            className={`rounded-md border px-3 py-1.5 text-sm ${
              p === page ? "border-line-strong bg-bg-subtle font-medium" : "border-line"
            }`}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link href={makeHref(page + 1)} className="rounded-md border border-line px-3 py-1.5 text-sm">
          Next
        </Link>
      ) : null}
    </nav>
  );
}
