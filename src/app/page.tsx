import Link from "next/link";
import { Container, Chip, SectionHeading, Stat, EmptyState } from "@/components/ui";
import { HeroSearch } from "@/components/hero-search";
import { WinnerCard } from "@/components/winner-card";
import { getDataset, computeStats } from "@/lib/repository";
import { labelMaps } from "@/lib/labels";
import { countBy, topEntries } from "@/lib/queries";
import { formatNumber } from "@/lib/utils";
import { SITE } from "@/lib/site";

const QUICK_CATEGORIES = [
  "artificial-intelligence",
  "healthcare",
  "developer-tools",
  "web3",
  "climate",
  "education",
];

export default function HomePage() {
  const dataset = getDataset();
  const stats = computeStats(dataset);
  const labels = labelMaps(dataset);
  const catCounts = countBy(dataset.projects, (p) => p.categories);
  const techCounts = countBy(dataset.projects, (p) => p.technologies);
  const years = [...new Set(dataset.hackathons.map((h) => h.year))].sort((a, b) => b - a);
  const recent = dataset.winners.slice(0, 6);

  const yearsLabel =
    stats.minYear && stats.maxYear
      ? stats.minYear === stats.maxYear
        ? String(stats.minYear)
        : `${stats.minYear}–${stats.maxYear}`
      : "—";

  return (
    <>
      <section className="border-b border-line">
        <Container className="flex flex-col items-start py-16 sm:py-24">
          <p className="font-mono text-xs uppercase tracking-widest text-fg-muted">{SITE.name}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">
            {SITE.headline}
          </h1>
          <p className="mt-4 max-w-2xl text-base text-fg-muted sm:text-lg">
            The open-source database of hackathon-winning projects — searchable by technology,
            category, year, event, award, and source.
          </p>
          <HeroSearch />
          <div className="mt-4 flex flex-wrap gap-2">
            {QUICK_CATEGORIES.filter((slug) => labels.categories.has(slug)).map((slug) => (
              <Chip key={slug} href={`/category/${slug}`}>
                {labels.categories.get(slug)}
              </Chip>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/projects"
              className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
            >
              Explore Winners
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium hover:bg-bg-subtle"
            >
              Contribute on GitHub
            </a>
          </div>
        </Container>
      </section>

      <section className="border-b border-line bg-bg-subtle">
        <Container className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          <Stat value={formatNumber(stats.projects)} label="Winning Projects" />
          <Stat value={formatNumber(stats.hackathons)} label="Hackathons" />
          <Stat value={formatNumber(stats.technologies)} label="Technologies" />
          <Stat value={yearsLabel} label="Years Covered" />
        </Container>
      </section>

      <Container className="py-12">
        <SectionHeading title="Recent Winners" href="/projects">
          The most recently awarded projects in the database.
        </SectionHeading>
        {recent.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((winner) => (
              <WinnerCard key={winner.entry.id} winner={winner} labels={labels} />
            ))}
          </div>
        ) : (
          <EmptyState
            title="No winners recorded yet."
            hint={<Link href="/contribute">Add the first one →</Link>}
          />
        )}
      </Container>

      <Container className="py-12">
        <SectionHeading title="Explore by Category" href="/categories" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topEntries(catCounts, 8).map(([slug, count]) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="rounded-lg border border-line p-4 hover:border-line-strong"
            >
              <span className="block font-medium">{labels.categories.get(slug) ?? slug}</span>
              <span className="mt-1 block text-sm text-fg-muted">
                {formatNumber(count)} project{count === 1 ? "" : "s"}
              </span>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="py-12">
        <SectionHeading title="Popular Technologies" href="/technologies" />
        <div className="flex flex-wrap gap-2">
          {topEntries(techCounts, 16).map(([slug, count]) => (
            <Chip key={slug} href={`/technology/${slug}`} className="font-mono">
              {labels.technologies.get(slug) ?? slug}
              <span className="text-fg-muted">·{count}</span>
            </Chip>
          ))}
        </div>
      </Container>

      <Container className="py-12">
        <SectionHeading title="Browse Hackathons" href="/hackathons" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dataset.hackathons.slice(0, 6).map((hackathon) => (
            <Link
              key={hackathon.id}
              href={`/hackathons/${hackathon.slug}`}
              className="rounded-lg border border-line p-4 hover:border-line-strong"
            >
              <span className="block font-medium">{hackathon.name}</span>
              <span className="mt-1 block text-sm text-fg-muted">
                {hackathon.year} · {hackathon.organizer.join(", ")}
              </span>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="py-12">
        <SectionHeading title="Explore by Year" />
        <div className="flex flex-wrap gap-2">
          {years.map((year) => (
            <Chip key={year} href={`/year/${year}`} className="font-mono">
              {year}
            </Chip>
          ))}
        </div>
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "Recent hackathon winners",
            numberOfItems: recent.length,
            itemListElement: recent.map((winner, i) => ({
              "@type": "ListItem",
              position: i + 1,
              name: winner.project.name,
              url: `${SITE.url}/projects/${winner.project.slug}`,
            })),
          }),
        }}
      />

      <Container className="pb-20">
        <div className="rounded-lg border border-line bg-bg-subtle p-8">
          <h2 className="text-xl font-semibold tracking-tight">
            HackWinnerDB belongs to the community.
          </h2>
          <p className="mt-2 max-w-xl text-sm text-fg-muted">
            Found a winner we are missing? Every record lives in git — add one through a pull
            request or an issue form, no account on this site required.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contribute"
              className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
            >
              Add a winner
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium hover:bg-bg"
            >
              View GitHub
            </a>
          </div>
        </div>
      </Container>
    </>
  );
}
