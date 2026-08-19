import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Chip, Container } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { WinnerBrowser } from "@/components/winner-browser";
import { getDataset } from "@/lib/repository";
import { labelMaps } from "@/lib/labels";
import { countBy, topEntries } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import type { RawParams } from "@/lib/search-params";

export function generateStaticParams() {
  const years = new Set(getDataset().hackathons.map((h) => String(h.year)));
  return [...years].map((year) => ({ year }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ year: string }>;
}): Promise<Metadata> {
  const { year } = await params;
  return {
    title: `${year} Hackathon Winners`,
    description: `Hackathon-winning projects from ${year}, with source-verified awards.`,
    alternates: { canonical: `/year/${year}` },
  };
}

export default async function YearPage({
  params,
  searchParams,
}: {
  params: Promise<{ year: string }>;
  searchParams: Promise<RawParams>;
}) {
  const [{ year }, query] = await Promise.all([params, searchParams]);
  const dataset = getDataset();
  const numericYear = Number(year);
  const winners = dataset.winners.filter((w) => w.hackathon.year === numericYear);
  if (!Number.isFinite(numericYear) || winners.length === 0) notFound();

  const labels = labelMaps(dataset);
  const projects = winners.map((w) => w.project);
  const topCategories = topEntries(countBy(projects, (p) => p.categories), 6);
  const topTech = topEntries(countBy(projects, (p) => p.technologies), 10);
  const hackathons = [...new Set(winners.map((w) => w.hackathon.id))];

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { href: `/year/${year}`, label: year },
        ]}
      />
      <div className="border-b border-line/60 pb-8 pt-2">
        <span className="hw-eyebrow text-xs font-bold text-accent">Yearly Archive</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">{year} Hackathon Winners</h1>
        <div className="mt-4 flex flex-wrap items-center gap-3 font-mono text-xs text-fg-muted">
          <span className="rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-fg">
            <span className="font-bold text-accent">{formatNumber(new Set(projects.map((p) => p.id)).size)}</span> winning projects
          </span>
          <span className="rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-fg">
            <span className="font-bold text-accent">{formatNumber(hackathons.length)}</span> hackathons
          </span>
        </div>

        <div className="mt-8 grid gap-6 sm:grid-cols-2">
          <section className="rounded-2xl border border-line/60 bg-bg-subtle/40 p-5 backdrop-blur-sm">
            <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">
              Leading Categories
            </h2>
            <div className="hw-stagger mt-3 flex flex-wrap gap-1.5">
              {topCategories.map(([slug, count]) => (
                <Chip key={slug} href={`/category/${slug}`}>
                  {labels.categories.get(slug) ?? slug}
                  <span className="text-accent">·{count}</span>
                </Chip>
              ))}
            </div>
          </section>
          <section className="rounded-2xl border border-line/60 bg-bg-subtle/40 p-5 backdrop-blur-sm">
            <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">
              Most Used Technologies
            </h2>
            <div className="hw-stagger mt-3 flex flex-wrap gap-1.5">
              {topTech.map(([slug, count]) => (
                <Chip key={slug} href={`/technology/${slug}`} className="font-mono">
                  {labels.technologies.get(slug) ?? slug}
                  <span className="text-accent">·{count}</span>
                </Chip>
              ))}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-line/60 bg-bg-subtle/40 p-5 backdrop-blur-sm">
          <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">Hackathons in {year}</h2>
          <div className="hw-stagger mt-3 flex flex-wrap gap-2">
            {hackathons.map((id) => {
              const hackathon = dataset.hackathons.find((h) => h.id === id)!;
              return (
                <Link
                  key={id}
                  href={`/hackathons/${hackathon.slug}`}
                  className="rounded-xl border border-line/70 bg-bg-raised/60 px-3 py-1.5 text-xs font-semibold text-fg backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent motion-safe:hover:-translate-y-0.5"
                >
                  {hackathon.name}
                </Link>
              );
            })}
          </div>
        </section>
      </div>

      <div className="mt-8">
        <WinnerBrowser
          dataset={dataset}
          candidates={winners}
          params={query}
          basePath={`/year/${year}`}
          omitFacets={["year"]}
        />
      </div>
    </Container>
  );
}
