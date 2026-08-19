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
      <div className="border-b border-line/60 pb-8 pt-2">
        <div className="flex items-center gap-2">
          <span className="hw-eyebrow text-xs font-bold text-accent">Tech Stack Index</span>
          {tech.type ? (
            <span className="rounded-full border border-line bg-bg-subtle px-2 py-0.5 font-mono text-[10px] text-accent">
              {tech.type}
            </span>
          ) : null}
        </div>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">{tech.name}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-fg-muted">
          <span className="rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-fg">
            <span className="font-bold text-accent">{formatNumber(new Set(winners.map((w) => w.project.id)).size)}</span> winning projects
          </span>
          <span className="rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-fg">
            <span className="font-bold text-accent">{formatNumber(hackathons.size)}</span> hackathons
          </span>
          <span className="rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-fg">
            <span className="font-bold text-accent">{Math.min(...years)}–{Math.max(...years)}</span>
          </span>
        </div>

        {paired.length ? (
          <div className="mt-6">
            <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">
              Frequently Paired With
            </h2>
            <div className="hw-stagger mt-2.5 flex flex-wrap gap-1.5">
              {paired.map(([pairedSlug, count]) => (
                <Chip key={pairedSlug} href={`/technology/${pairedSlug}`} className="font-mono">
                  {labels.technologies.get(pairedSlug) ?? pairedSlug}
                  <span className="text-accent">·{count}</span>
                </Chip>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-8">
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
