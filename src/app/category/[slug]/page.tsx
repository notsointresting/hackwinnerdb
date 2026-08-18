import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WinnerBrowser } from "@/components/winner-browser";
import { getDataset } from "@/lib/repository";
import { formatNumber } from "@/lib/utils";
import type { RawParams } from "@/lib/search-params";

export function generateStaticParams() {
  const used = new Set(getDataset().projects.flatMap((p) => p.categories));
  return [...used].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const category = getDataset().categories.find((c) => c.slug === slug);
  if (!category) return {};
  return {
    title: `${category.name} Hackathon Winners`,
    description: `Hackathon-winning ${category.name.toLowerCase()} projects, with source-verified awards.`,
    alternates: { canonical: `/category/${category.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawParams>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const dataset = getDataset();
  const category = dataset.categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const winners = dataset.winners.filter((w) => w.project.categories.includes(slug));
  if (winners.length === 0) notFound();
  const hackathons = new Set(winners.map((w) => w.hackathon.id));

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/categories", label: "Categories" },
          { href: `/category/${category.slug}`, label: category.name },
        ]}
      />
      <h1 className="hw-display text-4xl sm:text-5xl">
        {category.name} Hackathon Winners
      </h1>
      <p className="mt-2 font-mono text-sm text-fg-muted">
        {formatNumber(new Set(winners.map((w) => w.project.id)).size)} winning projects ·{" "}
        {formatNumber(hackathons.size)} hackathons
      </p>
      <div className="mt-10">
        <WinnerBrowser
          dataset={dataset}
          candidates={winners}
          params={query}
          basePath={`/category/${category.slug}`}
          omitFacets={["category"]}
        />
      </div>
    </Container>
  );
}
