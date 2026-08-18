import Link from "next/link";
import { Container, Chip, SectionHeading, Stat, EmptyState } from "@/components/ui";
import { HeroSearch } from "@/components/hero-search";
import { ProjectImage } from "@/components/project-image";
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
      <section className="relative overflow-hidden border-b border-line">
        <div className="hw-aurora" aria-hidden="true" />
        <Container className="flex flex-col items-center py-20 text-center sm:py-28">
          <span className="hw-pill hw-fade">Open source · Community curated</span>

          <p className="hw-wordmark hw-rise mt-8 text-[clamp(3.5rem,17vw,13rem)]">Winners</p>

          <h1 className="hw-display hw-rise mt-2 max-w-4xl text-[clamp(1.9rem,5.2vw,3.6rem)]">
            {SITE.headline}
          </h1>

          <p className="hw-rise mt-6 max-w-2xl text-pretty text-base text-fg-muted sm:text-lg">
            The open-source database of hackathon-winning projects — searchable by technology,
            category, year, event, award, and source.
          </p>

          <div className="flex w-full justify-center">
            <HeroSearch />
          </div>

          <div className="hw-stagger mt-5 flex flex-wrap justify-center gap-2">
            {QUICK_CATEGORIES.filter((slug) => labels.categories.has(slug)).map((slug) => (
              <Chip key={slug} href={`/category/${slug}`}>
                {labels.categories.get(slug)}
              </Chip>
            ))}
          </div>

          <div className="hw-rise mt-9 flex flex-wrap justify-center gap-3">
            <Link
              href="/projects"
              className="rounded-full bg-fg px-5 py-2.5 text-sm font-medium text-bg transition-transform duration-300 motion-safe:hover:-translate-y-0.5"
            >
              Explore Winners
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-line-strong px-5 py-2.5 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              Contribute on GitHub
            </a>
          </div>

          {recent[0] ? (
            <div className="hw-pop hw-glow-frame mt-16 w-full max-w-3xl overflow-hidden rounded-2xl border border-line bg-bg-raised p-2">
              <ProjectImage
                src={recent[0].project.image_url}
                name={recent[0].project.name}
                priority
                className="rounded-xl border-0"
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <p className="px-3 py-3 text-left text-sm text-fg-muted">
                <span className="hw-eyebrow text-[0.65rem] text-accent">Latest winner</span>{" "}
                <span className="ml-2 text-fg">{recent[0].project.name}</span> ·{" "}
                {recent[0].primaryAward.title} · {recent[0].hackathon.name}
              </p>
            </div>
          ) : null}
        </Container>
      </section>

      <section className="border-b border-line bg-bg-subtle">
        <Container className="hw-stagger grid grid-cols-2 gap-6 py-10 sm:grid-cols-4">
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
            {recent.map((winner, i) => (
              <WinnerCard key={winner.entry.id} winner={winner} labels={labels} priority={i < 3} />
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
        <div className="hw-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {topEntries(catCounts, 8).map(([slug, count]) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="hw-reveal group flex items-center justify-between gap-3 rounded-xl border border-line p-4 transition-[border-color,transform] duration-300 ease-out hover:border-line-strong motion-safe:hover:-translate-y-0.5"
            >
              <span>
                <span className="block font-medium">{labels.categories.get(slug) ?? slug}</span>
                <span className="mt-1 block text-sm text-fg-muted">
                  {formatNumber(count)} project{count === 1 ? "" : "s"}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-fg-muted transition-transform duration-300 motion-safe:group-hover:translate-x-1"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="py-12">
        <SectionHeading title="Popular Technologies" href="/technologies" />
        <div className="hw-stagger flex flex-wrap gap-2">
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
        <div className="hw-stagger grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {dataset.hackathons.slice(0, 6).map((hackathon) => (
            <Link
              key={hackathon.id}
              href={`/hackathons/${hackathon.slug}`}
              className="hw-reveal rounded-xl border border-line p-4 transition-[border-color,transform] duration-300 ease-out hover:border-line-strong motion-safe:hover:-translate-y-0.5"
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
        <div className="hw-reveal rounded-xl border border-line bg-[radial-gradient(120%_120%_at_0%_0%,var(--accent-bg),var(--bg-subtle))] p-8 sm:p-10">
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
