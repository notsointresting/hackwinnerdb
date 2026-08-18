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
      <h1 className="text-3xl font-semibold tracking-tight">{year} Hackathon Winners</h1>
      <p className="mt-2 font-mono text-sm text-fg-muted">
        {formatNumber(hackathons.length)} hackathons ·{" "}
        {formatNumber(new Set(projects.map((p) => p.id)).size)} winning projects
      </p>

      <div className="mt-6 grid gap-6 sm:grid-cols-2">
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
            Leading categories
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topCategories.map(([slug, count]) => (
              <Chip key={slug} href={`/category/${slug}`}>
                {labels.categories.get(slug) ?? slug}
                <span className="text-fg-muted">·{count}</span>
              </Chip>
            ))}
          </div>
        </section>
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
            Most used technologies
          </h2>
          <div className="mt-3 flex flex-wrap gap-1.5">
            {topTech.map(([slug, count]) => (
              <Chip key={slug} href={`/technology/${slug}`} className="font-mono">
                {labels.technologies.get(slug) ?? slug}
                <span className="text-fg-muted">·{count}</span>
              </Chip>
            ))}
          </div>
        </section>
      </div>

      <section className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">Hackathons</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {hackathons.map((id) => {
            const hackathon = dataset.hackathons.find((h) => h.id === id)!;
            return (
              <Link
                key={id}
                href={`/hackathons/${hackathon.slug}`}
                className="rounded-md border border-line px-2.5 py-1 text-sm hover:border-line-strong"
              >
                {hackathon.name}
              </Link>
            );
          })}
        </div>
      </section>

      <div className="mt-10">
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
