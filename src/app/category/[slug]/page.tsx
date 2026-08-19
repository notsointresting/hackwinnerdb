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
      <div className="border-b border-line/60 pb-8 pt-2">
        <span className="hw-eyebrow text-xs font-bold text-accent">Category Collection</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">
          {category.name} Hackathon Winners
        </h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-fg-muted">
          <span className="rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-fg">
            <span className="font-bold text-accent">{formatNumber(new Set(winners.map((w) => w.project.id)).size)}</span> winning projects
          </span>
          <span className="rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-fg">
            <span className="font-bold text-accent">{formatNumber(hackathons.size)}</span> hackathons
          </span>
        </div>
      </div>
      <div className="mt-8">
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
