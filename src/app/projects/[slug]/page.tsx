import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { AwardBadge, Chip, Container, VerifiedBadge } from "@/components/ui";
import { Breadcrumbs } from "@/components/breadcrumbs";
import { ProjectImage } from "@/components/project-image";
import { getDataset } from "@/lib/repository";
import { labelMaps } from "@/lib/labels";
import { winnersForProject } from "@/lib/queries";
import { formatDate, formatMoney } from "@/lib/utils";
import { GITHUB_EDIT_BASE, GITHUB_NEW_ISSUE } from "@/lib/paths";
import { SITE } from "@/lib/site";

export const dynamicParams = true;
export const revalidate = 3600;

export function generateStaticParams() {
  return getDataset()
    .projects.slice(0, 200)
    .map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dataset = getDataset();
  const project = dataset.projects.find((p) => p.slug === slug);
  if (!project) return {};
  const wins = winnersForProject(dataset, project.id);
  const title = wins[0]
    ? `${project.name} — ${wins[0].hackathon.name} Winner`
    : `${project.name} — Hackathon Winner`;
  return {
    title,
    description: project.tagline,
    alternates: { canonical: `/projects/${project.slug}` },
    openGraph: { title: `${title} | ${SITE.name}`, description: project.tagline },
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const dataset = getDataset();
  const project = dataset.projects.find((p) => p.slug === slug);
  if (!project) notFound();

  const labels = labelMaps(dataset);
  const wins = winnersForProject(dataset, project.id);
  const top = wins[0];

  const links = [
    { label: "Website", href: project.website_url },
    { label: "GitHub", href: project.github_url },
    { label: "Demo", href: project.demo_url },
    { label: "Video", href: project.video_url },
    { label: "Original submission", href: top?.entry.submission_url ?? null },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: project.name,
    description: project.summary,
    applicationCategory: labels.categories.get(project.categories[0]) ?? "Application",
    url: project.website_url ?? `${SITE.url}/projects/${project.slug}`,
    author: project.builders.map((b) => ({ "@type": "Person", name: b.name })),
    award: wins.flatMap((w) => w.entry.awards.map((a) => `${a.title} — ${w.hackathon.name}`)),
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE.url },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE.url}/projects` },
      {
        "@type": "ListItem",
        position: 3,
        name: project.name,
        item: `${SITE.url}/projects/${project.slug}`,
      },
    ],
  };

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { href: `/projects/${project.slug}`, label: project.name },
        ]}
      />

      <header className="grid gap-8 border-b border-line/60 pb-10 pt-4 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-center">
        <div className="hw-rise">
          <h1 className="hw-display text-4xl sm:text-5xl">{project.name}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-lg text-fg-muted">{project.tagline}</p>
          {top ? (
            <div className="mt-5 flex flex-wrap items-center gap-3">
              <AwardBadge label={top.primaryAward.title} />
              <Link
                href={`/hackathons/${top.hackathon.slug}`}
                className="text-sm font-medium text-fg hover:text-accent hover:underline"
              >
                {top.hackathon.name}
              </Link>
              <Link
                href={`/year/${top.hackathon.year}`}
                className="font-mono text-sm text-accent/80 hover:text-accent"
              >
                {top.hackathon.year}
              </Link>
              {top.entry.verification.status === "verified" ? <VerifiedBadge /> : null}
            </div>
          ) : null}
        </div>
        <div className="hw-pop hw-glow-frame group overflow-hidden rounded-2xl border border-line/80 bg-bg-raised/70 p-2 shadow-xl backdrop-blur-xl">
          <ProjectImage
            src={project.image_url}
            name={project.name}
            priority
            className="rounded-xl border-0"
            sizes="(max-width: 1024px) 100vw, 400px"
          />
        </div>
      </header>

      <div className="grid gap-10 py-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="space-y-8">
          <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-6 backdrop-blur-sm">
            <h2 className="hw-eyebrow text-xs font-bold text-accent">
              What it does
            </h2>
            <p className="mt-3 leading-relaxed text-fg">{project.summary}</p>
          </section>

          {project.problem ? (
            <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-6 backdrop-blur-sm">
              <h2 className="hw-eyebrow text-xs font-bold text-accent">
                Problem
              </h2>
              <p className="mt-3 leading-relaxed text-fg-muted">{project.problem}</p>
            </section>
          ) : null}

          {project.solution ? (
            <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-6 backdrop-blur-sm">
              <h2 className="hw-eyebrow text-xs font-bold text-accent">
                Solution
              </h2>
              <p className="mt-3 leading-relaxed text-fg-muted">{project.solution}</p>
            </section>
          ) : null}

          <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-6 backdrop-blur-sm">
            <h2 className="hw-eyebrow text-xs font-bold text-accent">Awards</h2>
            <ul className="mt-4 divide-y divide-line/60">
              {wins.map((win) => (
                <li key={win.entry.id} className="flex flex-wrap items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="font-mono text-sm text-accent">{win.hackathon.year}</span>
                  <Link
                    href={`/hackathons/${win.hackathon.slug}`}
                    className="font-semibold text-fg hover:text-accent hover:underline"
                  >
                    {win.hackathon.name}
                  </Link>
                  <span className="flex flex-wrap gap-1.5">
                    {win.entry.awards.map((award) => (
                      <AwardBadge key={award.title} label={award.title} />
                    ))}
                  </span>
                  {win.entry.awards[0]?.prize_amount && win.entry.awards[0]?.currency ? (
                    <span className="font-mono text-sm font-medium text-emerald-400">
                      {formatMoney(win.entry.awards[0].prize_amount, win.entry.awards[0].currency)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-6 backdrop-blur-sm">
            <h2 className="hw-eyebrow text-xs font-bold text-accent">
              Source &amp; verification
            </h2>
            <ul className="mt-4 space-y-3">
              {wins.map((win) => (
                <li key={win.entry.id} className="rounded-xl border border-line/60 bg-bg-raised/50 p-4 text-sm">
                  <p>
                    <span className="text-fg-muted">Source:</span>{" "}
                    <span className="font-medium text-fg">
                      {labels.sources.get(win.entry.source.platform) ?? win.entry.source.platform}
                    </span>
                  </p>
                  <p className="mt-1">
                    <span className="text-fg-muted">Verified:</span>{" "}
                    <span className="font-mono text-fg-muted">
                      {formatDate(win.entry.verification.checked_at)}
                    </span>
                  </p>
                  <a
                    href={win.entry.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
                  >
                    <span>Original announcement</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-5 backdrop-blur-sm">
            <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">
              Built with
            </h2>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {project.technologies.map((tech) => (
                <Chip key={tech} href={`/technology/${tech}`} className="font-mono text-xs">
                  {labels.technologies.get(tech) ?? tech}
                </Chip>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-5 backdrop-blur-sm">
            <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">
              Categories
            </h2>
            <div className="mt-3.5 flex flex-wrap gap-2">
              {project.categories.map((category) => (
                <Chip key={category} href={`/category/${category}`}>
                  {labels.categories.get(category) ?? category}
                </Chip>
              ))}
            </div>
          </section>

          {project.builders.length ? (
            <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-5 backdrop-blur-sm">
              <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">
                Builders
              </h2>
              <ul className="mt-3.5 space-y-2 text-sm">
                {project.builders.map((builder) => (
                  <li key={builder.name}>
                    {builder.github ? (
                      <a
                        href={`https://github.com/${builder.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-fg hover:text-accent hover:underline"
                      >
                        <span className="font-medium">{builder.name}</span>
                        <span className="text-xs text-fg-muted">@{builder.github}</span>
                      </a>
                    ) : (
                      <span className="font-medium text-fg">{builder.name}</span>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          {links.length ? (
            <section className="rounded-2xl border border-line/60 bg-bg-subtle/50 p-5 backdrop-blur-sm">
              <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">Links</h2>
              <ul className="mt-3.5 space-y-2 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 font-medium text-accent hover:underline"
                    >
                      <span>{link.label}</span>
                      <span aria-hidden="true">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-2xl border border-accent-line/60 bg-accent-bg/40 p-5 backdrop-blur-sm">
            <h2 className="text-sm font-semibold text-fg">Improve this record</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a
                href={`${GITHUB_EDIT_BASE}/data/projects/${project.id}.yaml`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-fg-muted hover:text-accent hover:underline"
              >
                Edit on GitHub ↗
              </a>
              <a
                href={`${GITHUB_NEW_ISSUE}?template=correct-data.yml`}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-fg-muted hover:text-accent hover:underline"
              >
                Report incorrect information ↗
              </a>
            </div>
          </section>
        </aside>
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
