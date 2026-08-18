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

  return (
    <Container className="py-10">
      <h1 className="hw-display text-4xl sm:text-5xl">Technologies</h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">
        {ranked.length} technolog{ranked.length === 1 ? "y" : "ies"} appear in winning projects.
        Counts are computed from the dataset.
      </p>
      <ul className="mt-8 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {ranked.map(([slug, count]) => (
          <li key={slug}>
            <Link
              href={`/technology/${slug}`}
              className="flex items-center justify-between rounded-md border border-line px-3 py-2 hover:border-line-strong"
            >
              <span>
                <span className="font-medium">{labels.get(slug)?.name ?? slug}</span>
                <span className="ml-2 text-xs text-fg-muted">{labels.get(slug)?.type}</span>
              </span>
              <span className="font-mono text-sm text-fg-muted">{count}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Container>
  );
}
