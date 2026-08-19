import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { getDataset } from "@/lib/repository";
import { countBy, topEntries } from "@/lib/queries";

export const metadata: Metadata = {
  title: "Technologies",
  description: "Technologies used by hackathon-winning projects, ranked by how often they win.",
  alternates: { canonical: "/technologies" },
};

export default function TechnologiesPage() {
  const dataset = getDataset();
  const counts = countBy(dataset.projects, (p) => p.technologies);
  const labels = new Map(dataset.technologies.map((t) => [t.slug, t]));
  const ranked = topEntries(counts, 500);
  const maxCount = ranked[0]?.[1] ?? 1;

  return (
    <Container className="py-12">
      <div className="border-b border-line/60 pb-6">
        <span className="hw-eyebrow text-xs font-bold text-accent">Tech Stack Index</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">Technologies</h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
          {ranked.length} technologies tracked across winning projects, ranked by frequency.
        </p>
      </div>

      <ul className="hw-stagger mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map(([slug, count]) => {
          const tech = labels.get(slug);
          const percent = Math.max(8, Math.round((count / maxCount) * 100));
          return (
            <li key={slug}>
              <Link
                href={`/technology/${slug}`}
                className="hw-reveal group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line/70 bg-bg-subtle/60 p-4 backdrop-blur-sm transition-all duration-300 ease-out hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_20px_rgba(123,63,242,0.18)] motion-safe:hover:-translate-y-1"
              >
                {/* Subtle progress background meter */}
                <div
                  className="pointer-events-none absolute bottom-0 left-0 top-0 bg-accent-bg/40 transition-all duration-500 group-hover:bg-accent-bg/60"
                  style={{ width: `${percent}%` }}
                  aria-hidden="true"
                />
                <div className="relative z-10 flex items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-fg transition-colors group-hover:text-accent">
                      {tech?.name ?? slug}
                    </span>
                    {tech?.type ? (
                      <span className="ml-2 rounded-full border border-line bg-bg px-2 py-0.5 font-mono text-[10px] text-fg-muted">
                        {tech.type}
                      </span>
                    ) : null}
                  </div>
                  <span className="font-mono text-xs font-bold text-accent">
                    {count}
                  </span>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </Container>
  );
}
