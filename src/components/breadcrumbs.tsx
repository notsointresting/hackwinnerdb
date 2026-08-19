import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { SITE } from "@/lib/site";

export interface Crumb {
  href: string;
  label: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <>
      <nav aria-label="Breadcrumb" className="mb-6 inline-flex text-xs text-fg-muted">
        <ol className="flex flex-wrap items-center gap-1.5 rounded-full border border-line/60 bg-bg-subtle/50 px-3.5 py-1.5 backdrop-blur-md">
          {items.map((item, i) => (
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 ? (
                <ChevronRight className="h-3 w-3 text-fg-muted/60" aria-hidden="true" />
              ) : null}
              {i === items.length - 1 ? (
                <span aria-current="page" className="font-semibold text-accent">
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="font-medium text-fg-muted transition-colors hover:text-fg"
                >
                  {item.label}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: items.map((item, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: item.label,
              item: `${SITE.url}${item.href}`,
            })),
          }),
        }}
      />
    </>
  );
}
