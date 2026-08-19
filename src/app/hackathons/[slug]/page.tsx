import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AwardBadge, Chip, Container, VerifiedBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { getDataset } from "@/lib/repository";
import { labelMaps } from "@/lib/labels";
import { winnersForHackathon } from "@/lib/queries";
import { formatDate, formatMoney, formatNumber } from "@/lib/utils";
import { GITHUB_EDIT_BASE } from "@/lib/paths";
import { SITE } from "@/lib/site";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return getDataset()
    .hackathons.slice(0, 200)
    .map((hackathon) => ({ slug: hackathon.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const hackathon = getDataset().hackathons.find((h) => h.slug === slug);
  if (!hackathon) return {};
  const title = `${hackathon.name} ${hackathon.year} Winners`;
  return {
    title,
    description:
      hackathon.description ??
      `Winning projects from ${hackathon.name} ${hackathon.year}, with source-verified awards.`,
    alternates: { canonical: `/hackathons/${hackathon.slug}` },
    openGraph: { title: `${title} | ${SITE.name}` },
  };
}

export default async function HackathonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dataset = getDataset();
  const hackathon = dataset.hackathons.find((h) => h.slug === slug);
  if (!hackathon) notFound();

  const labels = labelMaps(dataset);
  const wins = winnersForHackathon(dataset, hackathon.id);

  const grouped = new Map<string, typeof wins>();
  for (const win of wins) {
    const key = win.primaryAward.type;
    grouped.set(key, [...(grouped.get(key) ?? []), win]);
  }
  const groupOrder = dataset.awardTypes
    .filter((type) => grouped.has(type.slug))
    .sort((a, b) => a.weight - b.weight);

  const facts = [
    ["Year", String(hackathon.year)],
    ["Organizer", hackathon.organizer.join(", ") || null],
    [
      "Dates",
      hackathon.start_date && hackathon.end_date
        ? `${formatDate(hackathon.start_date)} – ${formatDate(hackathon.end_date)}`
        : null,
    ],
    ["Mode", hackathon.mode ?? null],
    ["Location", hackathon.location ?? null],
    ["Winning projects", formatNumber(wins.length)],
    ["Submissions", hackathon.total_submissions ? formatNumber(hackathon.total_submissions) : null],
    ["Participants", hackathon.participant_count ? formatNumber(hackathon.participant_count) : null],
    [
      "Prize pool",
      hackathon.prize_pool && hackathon.currency
        ? formatMoney(hackathon.prize_pool, hackathon.currency)
        : null,
    ],
    ["Platform", hackathon.platform ? labels.sources.get(hackathon.platform) ?? hackathon.platform : null],
  ].filter(([, value]) => Boolean(value)) as [string, string][];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: hackathon.name,
    startDate: hackathon.start_date ?? undefined,
    endDate: hackathon.end_date ?? undefined,
    eventAttendanceMode:
      hackathon.mode === "online"
        ? "https://schema.org/OnlineEventAttendanceMode"
        : hackathon.mode === "in-person"
          ? "https://schema.org/OfflineEventAttendanceMode"
          : undefined,
    organizer: hackathon.organizer.map((name) => ({ "@type": "Organization", name })),
    url: hackathon.website_url ?? `${SITE.url}/hackathons/${hackathon.slug}`,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Hackathons", item: `${SITE.url}/hackathons` },
      {
        "@type": "ListItem",
        position: 3,
        name: hackathon.name,
        item: `${SITE.url}/hackathons/${hackathon.slug}`,
      },
    ],
  };

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/hackathons", label: "Hackathons" },
          { href: `/hackathons/${hackathon.slug}`, label: hackathon.name },
        ]}
      />
      <header className="border-b border-line pb-8">
        <h1 className="hw-display text-4xl sm:text-5xl">{hackathon.name}</h1>
        {hackathon.description ? (
          <p className="mt-3 max-w-2xl text-fg-muted">{hackathon.description}</p>
        ) : null}
        <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-5">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="text-xs uppercase tracking-widest text-fg-muted">{label}</dt>
              <dd className="mt-1 text-sm">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          {hackathon.website_url ? (
            <a
              href={hackathon.website_url}
              target="_blank"
              rel="noreferrer"
              className="underline hover:no-underline"
            >
              Official site ↗
            </a>
          ) : null}
          {hackathon.sources.map((source, i) => (
            <a
              key={source}
              href={source}
              target="_blank"
              rel="noreferrer"
              className="text-fg-muted underline hover:text-fg hover:no-underline"
            >
              Source {i + 1} ↗
            </a>
          ))}
          <a
            href={`${GITHUB_EDIT_BASE}/data/hackathons/${hackathon.year}/${hackathon.id}.yaml`}
            target="_blank"
            rel="noreferrer"
            className="text-fg-muted underline hover:text-fg hover:no-underline"
          >
            Edit on GitHub ↗
          </a>
        </div>
      </header>

      <div className="mt-12">
        <h2 className="hw-display text-2xl font-bold text-fg">Winners</h2>
        {groupOrder.map((type) => (
          <section key={type.slug} className="mt-8">
            <h3 className="border-b border-line/60 pb-2 text-xs font-bold uppercase tracking-widest text-accent">
              {type.name}
            </h3>
            <ul className="hw-stagger mt-3 space-y-2.5">
              {grouped.get(type.slug)!.map((win) => (
                <li
                  key={win.entry.id}
                  className="hw-reveal group flex flex-wrap items-center gap-3.5 rounded-2xl border border-line/60 bg-bg-subtle/50 p-4 backdrop-blur-sm transition-all duration-300 hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_20px_rgba(123,63,242,0.15)] motion-safe:hover:-translate-y-0.5"
                >
                  <Link
                    href={`/projects/${win.project.slug}`}
                    className="font-bold text-fg transition-colors group-hover:text-accent"
                  >
                    {win.project.name}
                  </Link>
                  <AwardBadge label={win.primaryAward.title} />
                  {win.entry.verification.status === "verified" ? <VerifiedBadge /> : null}
                  <span className="w-full text-sm text-fg-muted sm:w-auto sm:flex-1">
                    {win.project.tagline}
                  </span>
                  <span className="flex flex-wrap gap-1.5">
                    {win.project.technologies.slice(0, 3).map((tech) => (
                      <Chip key={tech} href={`/technology/${tech}`} className="font-mono text-xs">
                        {labels.technologies.get(tech) ?? tech}
                      </Chip>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
    </Container>
  );
}
