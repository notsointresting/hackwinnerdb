import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { getDataset } from "@/lib/repository";
import { countBy } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Categories",
  description: "Browse hackathon winners by category.",
  alternates: { canonical: "/categories" },
};

export default function CategoriesPage() {
  const dataset = getDataset();
  const counts = countBy(dataset.projects, (p) => p.categories);

  return (
    <Container className="py-12">
      <div className="border-b border-line/60 pb-6">
        <span className="hw-eyebrow text-xs font-bold text-accent">Taxonomy</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">Categories</h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Curated collection of domain categories across all hackathon submissions and winning projects.
        </p>
      </div>

      <ul className="hw-stagger mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {dataset.categories.map((category) => {
          const count = counts.get(category.slug) ?? 0;
          return (
            <li key={category.slug}>
              {count > 0 ? (
                <Link
                  href={`/category/${category.slug}`}
                  className="hw-reveal group block rounded-2xl border border-line/70 bg-bg-subtle/60 p-5 backdrop-blur-sm transition-all duration-300 ease-out hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_20px_rgba(123,63,242,0.18)] motion-safe:hover:-translate-y-1"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="block font-semibold text-fg transition-colors group-hover:text-accent">
                        {category.name}
                      </span>
                      <span className="mt-1.5 block text-xs text-fg-muted">
                        <span className="font-mono font-medium text-accent">{count}</span> winning project{count === 1 ? "" : "s"}
                      </span>
                    </div>
                    <span
                      aria-hidden="true"
                      className="text-fg-muted transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-hover:text-accent"
                    >
                      →
                    </span>
                  </div>
                </Link>
              ) : (
                <div className="rounded-2xl border border-dashed border-line/60 bg-bg-subtle/30 p-5 opacity-50">
                  <span className="block font-medium text-fg">{category.name}</span>
                  <span className="mt-1.5 block text-xs text-fg-muted">No winners yet</span>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
