import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Chip, Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WinnerBrowser } from "@/components/winner-browser";
import { getDataset } from "@/lib/repository";
import { labelMaps } from "@/lib/labels";
import { pairedTechnologies } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import type { RawParams } from "@/lib/search-params";

export function generateStaticParams() {
  const dataset = getDataset();
  const used = new Set(dataset.projects.flatMap((p) => p.technologies));
  return [...used].map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tech = getDataset().technologies.find((t) => t.slug === slug);
  if (!tech) return {};
  return {
    title: `${tech.name} Hackathon Winners`,
    description: `Hackathon-winning projects built with ${tech.name}, with source-verified awards.`,
    alternates: { canonical: `/technology/${tech.slug}` },
  };
}

export default async function TechnologyPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<RawParams>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const dataset = getDataset();
  const tech = dataset.technologies.find((t) => t.slug === slug);
  if (!tech) notFound();

  const labels = labelMaps(dataset);
  const winners = dataset.winners.filter((w) => w.project.technologies.includes(slug));
  if (winners.length === 0) notFound();

  const hackathons = new Set(winners.map((w) => w.hackathon.id));
  const years = winners.map((w) => w.hackathon.year);
  const paired = pairedTechnologies(dataset, slug);

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/technologies", label: "Technologies" },
          { href: `/technology/${tech.slug}`, label: tech.name },
        ]}
      />
      <h1 className="text-3xl font-semibold tracking-tight">{tech.name}</h1>
      <p className="mt-2 font-mono text-sm text-fg-muted">
        {formatNumber(new Set(winners.map((w) => w.project.id)).size)} winning projects ·{" "}
        {formatNumber(hackathons.size)} hackathons ·{" "}
        {Math.min(...years)}–{Math.max(...years)} · {tech.type}
      </p>

      {paired.length ? (
        <section className="mt-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
            Frequently paired with
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {paired.map(([pairedSlug, count]) => (
              <Chip key={pairedSlug} href={`/technology/${pairedSlug}`} className="font-mono">
                {labels.technologies.get(pairedSlug) ?? pairedSlug}
                <span className="text-fg-muted">·{count}</span>
              </Chip>
            ))}
          </div>
        </section>
      ) : null}

      <div className="mt-10">
        <WinnerBrowser
          dataset={dataset}
          candidates={winners}
          params={query}
          basePath={`/technology/${tech.slug}`}
          omitFacets={["technology"]}
        />
      </div>
    </Container>
  );
}
