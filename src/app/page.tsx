import Link from "next/link";
import { Container, Chip, SectionHeading, Stat, EmptyState } from "@/components/ui";
import { HeroSearch } from "@/components/hero-search";
import { ProjectImage } from "@/components/project-image";
import { WinnerCard } from "@/components/winner-card";
import { AmbientMarquee } from "@/components/ambient-marquee";
import { InteractiveSpotlight } from "@/components/interactive-spotlight";
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

  const marqueeItems = topEntries(techCounts, 20).map(([slug, count]) => ({
    label: labels.technologies.get(slug) ?? slug,
    count,
    href: `/technology/${slug}`,
    badge: "Tech",
  }));

  const yearsLabel =
    stats.minYear && stats.maxYear
      ? stats.minYear === stats.maxYear
        ? String(stats.minYear)
        : `${stats.minYear}–${stats.maxYear}`
      : "—";

  return (
    <>
      <section className="relative overflow-hidden border-b border-line/60">
        <div className="hw-aurora" aria-hidden="true" />
        <div className="hw-grid-mesh pointer-events-none absolute inset-0 opacity-40" aria-hidden="true" />

        <Container className="relative z-10 flex flex-col items-center py-20 text-center sm:py-28">
          <div className="hw-fade inline-flex items-center gap-2 rounded-full border border-accent-line/70 bg-accent-bg/80 px-3.5 py-1.5 text-xs font-medium text-accent backdrop-blur-md shadow-[0_0_16px_rgba(185,139,255,0.15)]">
            <span className="hw-live-dot" aria-hidden="true" />
            <span>Open source · Community curated</span>
          </div>

          <p className="hw-wordmark hw-rise mt-8 text-[clamp(3.5rem,17vw,13rem)] tracking-tight">
            Winners
          </p>

          <h1 className="hw-display hw-rise mt-2 max-w-4xl text-[clamp(1.9rem,5.2vw,3.6rem)] text-fg">
            {SITE.headline}
          </h1>

          <p className="hw-rise mt-6 max-w-2xl text-pretty text-base text-fg-muted/90 sm:text-lg">
            The open-source database of hackathon-winning projects — searchable by technology,
            category, year, event, award, and source.
          </p>

          <div className="flex w-full justify-center">
            <HeroSearch />
          </div>

          <div className="hw-stagger mt-6 flex flex-wrap justify-center gap-2">
            {QUICK_CATEGORIES.filter((slug) => labels.categories.has(slug)).map((slug) => (
              <Chip key={slug} href={`/category/${slug}`}>
                {labels.categories.get(slug)}
              </Chip>
            ))}
          </div>

          <div className="hw-rise mt-10 flex flex-wrap justify-center gap-3.5">
            <Link
              href="/projects"
              className="rounded-xl bg-fg px-6 py-2.5 text-sm font-semibold text-bg shadow-sm transition-all duration-300 hover:bg-fg/90 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] motion-safe:hover:-translate-y-0.5"
            >
              Explore Winners
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line-strong bg-bg-subtle/70 px-6 py-2.5 text-sm font-semibold text-fg backdrop-blur-sm transition-all duration-300 hover:border-accent-line hover:bg-bg-subtle hover:text-accent motion-safe:hover:-translate-y-0.5"
            >
              Contribute on GitHub
            </a>
          </div>

          {recent[0] ? (
            <InteractiveSpotlight className="hw-pop hw-glow-frame group mt-16 w-full max-w-3xl overflow-hidden rounded-2xl border border-line/80 bg-bg-raised/80 p-2 shadow-2xl backdrop-blur-xl transition-all duration-300">
              <ProjectImage
                src={recent[0].project.image_url}
                name={recent[0].project.name}
                priority
                className="rounded-xl border-0"
                sizes="(max-width: 768px) 100vw, 768px"
              />
              <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-3 text-left text-sm text-fg-muted">
                <div>
                  <span className="hw-eyebrow text-[0.65rem] text-accent">Latest winner</span>{" "}
                  <Link
                    href={`/projects/${recent[0].project.slug}`}
                    className="ml-2 font-semibold text-fg hover:text-accent hover:underline"
                  >
                    {recent[0].project.name}
                  </Link>{" "}
                  · {recent[0].primaryAward.title} · {recent[0].hackathon.name}
                </div>
                <Link
                  href={`/projects/${recent[0].project.slug}`}
                  className="text-xs font-medium text-accent hover:underline"
                >
                  View project →
                </Link>
              </div>
            </InteractiveSpotlight>
          ) : null}
        </Container>
      </section>

      {/* Dynamic Animated Marquee */}
      <section className="border-b border-line/60 bg-bg-subtle/30 py-2">
        <AmbientMarquee items={marqueeItems} />
      </section>

      <section className="border-b border-line/60 bg-bg-subtle/40 backdrop-blur-sm">
        <Container className="hw-stagger grid grid-cols-2 gap-4 py-8 sm:grid-cols-4 sm:gap-6 sm:py-10">
          <Stat value={formatNumber(stats.projects)} label="Winning Projects" />
          <Stat value={formatNumber(stats.hackathons)} label="Hackathons" />
          <Stat value={formatNumber(stats.technologies)} label="Technologies" />
          <Stat value={yearsLabel} label="Years Covered" />
        </Container>
      </section>

      <Container className="py-14 sm:py-18">
        <SectionHeading title="Recent Winners" href="/projects">
          The most recently awarded projects in the database.
        </SectionHeading>
        {recent.length ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
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

      <Container className="py-12 sm:py-16">
        <SectionHeading title="Explore by Category" href="/categories" />
        <div className="hw-stagger grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {topEntries(catCounts, 8).map(([slug, count]) => (
            <Link
              key={slug}
              href={`/category/${slug}`}
              className="hw-reveal group flex items-center justify-between gap-3 rounded-2xl border border-line/70 bg-bg-subtle/60 p-4.5 backdrop-blur-sm transition-all duration-300 ease-out hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_20px_rgba(123,63,242,0.15)] motion-safe:hover:-translate-y-1"
            >
              <span>
                <span className="block font-semibold text-fg transition-colors group-hover:text-accent">
                  {labels.categories.get(slug) ?? slug}
                </span>
                <span className="mt-1 block text-sm text-fg-muted">
                  {formatNumber(count)} project{count === 1 ? "" : "s"}
                </span>
              </span>
              <span
                aria-hidden="true"
                className="text-fg-muted transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-hover:text-accent"
              >
                →
              </span>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="py-12 sm:py-16">
        <SectionHeading title="Popular Technologies" href="/technologies" />
        <div className="hw-stagger flex flex-wrap gap-2.5">
          {topEntries(techCounts, 16).map(([slug, count]) => (
            <Chip key={slug} href={`/technology/${slug}`} className="font-mono">
              {labels.technologies.get(slug) ?? slug}
              <span className="text-fg-muted">·{count}</span>
            </Chip>
          ))}
        </div>
      </Container>

      <Container className="py-12 sm:py-16">
        <SectionHeading title="Browse Hackathons" href="/hackathons" />
        <div className="hw-stagger grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dataset.hackathons.slice(0, 6).map((hackathon) => (
            <Link
              key={hackathon.id}
              href={`/hackathons/${hackathon.slug}`}
              className="hw-reveal group rounded-2xl border border-line/70 bg-bg-subtle/60 p-5 backdrop-blur-sm transition-all duration-300 ease-out hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_20px_rgba(123,63,242,0.15)] motion-safe:hover:-translate-y-1"
            >
              <span className="block font-semibold text-fg transition-colors group-hover:text-accent">
                {hackathon.name}
              </span>
              <span className="mt-1.5 block text-xs text-fg-muted">
                <span className="font-mono text-accent">{hackathon.year}</span> · {hackathon.organizer.join(", ")}
              </span>
            </Link>
          ))}
        </div>
      </Container>

      <Container className="py-12 sm:py-16">
        <SectionHeading title="Explore by Year" />
        <div className="flex flex-wrap gap-2.5">
          {years.map((year) => (
            <Chip key={year} href={`/year/${year}`} className="font-mono text-xs">
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

      <Container className="pb-24">
        <div className="hw-reveal relative overflow-hidden rounded-3xl border border-accent-line/60 bg-[radial-gradient(130%_130%_at_0%_0%,rgba(185,139,255,0.15),var(--bg-subtle))] p-8 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md sm:p-12">
          <div className="relative z-10">
            <span className="hw-pill mb-4 text-[0.65rem]">Open Community Project</span>
            <h2 className="hw-display text-2xl font-bold tracking-tight text-fg sm:text-3xl">
              HackWinnerDB belongs to the community.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-relaxed text-fg-muted">
              Found a winner we are missing? Every record lives in git — add one through a pull
              request or an issue form, no account on this site required.
            </p>
            <div className="mt-8 flex flex-wrap gap-3.5">
              <Link
                href="/contribute"
                className="rounded-xl bg-fg px-5 py-2.5 text-sm font-semibold text-bg shadow-sm transition-all duration-200 hover:bg-fg/90 hover:shadow-md motion-safe:hover:-translate-y-0.5"
              >
                Add a winner
              </Link>
              <a
                href={SITE.repo}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl border border-line-strong bg-bg/80 px-5 py-2.5 text-sm font-semibold text-fg backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent motion-safe:hover:-translate-y-0.5"
              >
                View GitHub Repository →
              </a>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
