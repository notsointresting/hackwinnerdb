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

export function generateStaticParams() {
  return getDataset().projects.map((project) => ({ slug: project.slug }));
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

  return (
    <Container className="py-10">
      <Breadcrumbs
        items={[
          { href: "/", label: "Home" },
          { href: "/projects", label: "Projects" },
          { href: `/projects/${project.slug}`, label: project.name },
        ]}
      />

      <header className="grid gap-8 border-b border-line pb-8 lg:grid-cols-[minmax(0,1fr)_380px] lg:items-center">
        <div className="hw-rise">
          <h1 className="text-3xl font-semibold tracking-[-0.02em] sm:text-4xl">{project.name}</h1>
          <p className="mt-3 max-w-2xl text-pretty text-lg text-fg-muted">{project.tagline}</p>
        {top ? (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <AwardBadge label={`🏆 ${top.primaryAward.title}`} />
            <Link href={`/hackathons/${top.hackathon.slug}`} className="text-sm hover:underline">
              {top.hackathon.name}
            </Link>
            <Link href={`/year/${top.hackathon.year}`} className="text-sm text-fg-muted hover:text-fg">
              {top.hackathon.year}
            </Link>
            {top.entry.verification.status === "verified" ? <VerifiedBadge /> : null}
          </div>
        ) : null}
        </div>
        <div className="hw-pop group">
          <ProjectImage
            src={project.image_url}
            name={project.name}
            priority
            sizes="(max-width: 1024px) 100vw, 380px"
          />
        </div>
      </header>

      <div className="grid gap-10 py-8 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
              What it does
            </h2>
            <p className="mt-3 leading-relaxed">{project.summary}</p>
          </section>
          {project.problem ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
                Problem
              </h2>
              <p className="mt-3 leading-relaxed">{project.problem}</p>
            </section>
          ) : null}
          {project.solution ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
                Solution
              </h2>
              <p className="mt-3 leading-relaxed">{project.solution}</p>
            </section>
          ) : null}

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">Awards</h2>
            <ul className="mt-3 divide-y divide-line border-y border-line">
              {wins.map((win) => (
                <li key={win.entry.id} className="flex flex-wrap items-center gap-3 py-3">
                  <span className="font-mono text-sm text-fg-muted">{win.hackathon.year}</span>
                  <Link
                    href={`/hackathons/${win.hackathon.slug}`}
                    className="font-medium hover:underline"
                  >
                    {win.hackathon.name}
                  </Link>
                  <span className="flex flex-wrap gap-1.5">
                    {win.entry.awards.map((award) => (
                      <AwardBadge key={award.title} label={award.title} />
                    ))}
                  </span>
                  {win.entry.awards[0]?.prize_amount && win.entry.awards[0]?.currency ? (
                    <span className="font-mono text-sm text-fg-muted">
                      {formatMoney(win.entry.awards[0].prize_amount, win.entry.awards[0].currency)}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </section>

          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
              Source &amp; verification
            </h2>
            <ul className="mt-3 space-y-3">
              {wins.map((win) => (
                <li key={win.entry.id} className="rounded-lg border border-line p-4 text-sm">
                  <p>
                    <span className="text-fg-muted">Source:</span>{" "}
                    {labels.sources.get(win.entry.source.platform) ?? win.entry.source.platform}
                  </p>
                  <p className="mt-1">
                    <span className="text-fg-muted">Verified:</span>{" "}
                    {formatDate(win.entry.verification.checked_at)}
                  </p>
                  <a
                    href={win.entry.source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-2 inline-block underline hover:no-underline"
                  >
                    Original announcement ↗
                  </a>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="space-y-8">
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
              Built with
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.technologies.map((tech) => (
                <Chip key={tech} href={`/technology/${tech}`} className="font-mono">
                  {labels.technologies.get(tech) ?? tech}
                </Chip>
              ))}
            </div>
          </section>
          <section>
            <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
              Categories
            </h2>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {project.categories.map((category) => (
                <Chip key={category} href={`/category/${category}`}>
                  {labels.categories.get(category) ?? category}
                </Chip>
              ))}
            </div>
          </section>
          {project.builders.length ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">
                Builders
              </h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {project.builders.map((builder) => (
                  <li key={builder.name}>
                    {builder.github ? (
                      <a
                        href={`https://github.com/${builder.github}`}
                        target="_blank"
                        rel="noreferrer"
                        className="hover:underline"
                      >
                        {builder.name} <span className="text-fg-muted">@{builder.github}</span>
                      </a>
                    ) : (
                      builder.name
                    )}
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {links.length ? (
            <section>
              <h2 className="text-sm font-semibold uppercase tracking-widest text-fg-muted">Links</h2>
              <ul className="mt-3 space-y-1.5 text-sm">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noreferrer"
                      className="underline hover:no-underline"
                    >
                      {link.label} ↗
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          <section className="rounded-lg border border-line bg-bg-subtle p-4">
            <h2 className="text-sm font-medium">Improve this record</h2>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <a
                href={`${GITHUB_EDIT_BASE}/data/projects/${project.id}.yaml`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:no-underline"
              >
                Edit on GitHub ↗
              </a>
              <a
                href={`${GITHUB_NEW_ISSUE}?template=correct-data.yml`}
                target="_blank"
                rel="noreferrer"
                className="underline hover:no-underline"
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
    </Container>
  );
}
