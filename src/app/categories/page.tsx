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
    <Container className="py-10">
      <h1 className="hw-display text-4xl sm:text-5xl">Categories</h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">
        A controlled taxonomy — categories are curated in{" "}
        <code className="font-mono text-xs">data/taxonomies/categories.yaml</code>, never free text.
      </p>
      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {dataset.categories.map((category) => {
          const count = counts.get(category.slug) ?? 0;
          const content = (
            <>
              <span className="block font-medium">{category.name}</span>
              <span className="mt-1 block text-sm text-fg-muted">
                {count} winning project{count === 1 ? "" : "s"}
              </span>
            </>
          );
          return (
            <li key={category.slug}>
              {count > 0 ? (
                <Link
                  href={`/category/${category.slug}`}
                  className="block rounded-lg border border-line p-4 hover:border-line-strong"
                >
                  {content}
                </Link>
              ) : (
                <div className="rounded-lg border border-dashed border-line p-4 opacity-60">
                  {content}
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
