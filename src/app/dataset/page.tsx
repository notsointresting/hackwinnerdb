import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { getDataset, computeStats } from "@/lib/repository";
import { formatNumber } from "@/lib/utils";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Download the dataset",
  description:
    "Download the full HackWinnerDB dataset of hackathon winners as JSON or CSV, licensed CC BY 4.0.",
  alternates: { canonical: "/dataset" },
};

const FILES = [
  { file: "hackwinnerdb.json", label: "Everything (JSON)" },
  { file: "hackathons.json", label: "Hackathons (JSON)" },
  { file: "projects.json", label: "Projects (JSON)" },
  { file: "entries.json", label: "Entries (JSON)" },
  { file: "hackathons.csv", label: "Hackathons (CSV)" },
  { file: "projects.csv", label: "Projects (CSV)" },
  { file: "entries.csv", label: "Entries (CSV)" },
];

export default function DatasetPage() {
  const stats = computeStats(getDataset());
  return (
    <Container className="py-12">
      <h1 className="hw-display text-4xl sm:text-5xl">Download dataset</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        The dataset is generated from the YAML records in the repository on every build. It contains{" "}
        {formatNumber(stats.hackathons)} hackathons, {formatNumber(stats.projects)} projects, and{" "}
        {formatNumber(stats.entries)} winning entries.
      </p>
      <ul className="mt-8 grid gap-2 sm:grid-cols-2">
        {FILES.map((item) => (
          <li key={item.file}>
            <a
              href={`/dataset/${item.file}`}
              download
              className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm hover:border-line-strong"
            >
              <span>{item.label}</span>
              <span className="font-mono text-xs text-fg-muted">{item.file}</span>
            </a>
          </li>
        ))}
      </ul>
      <section className="mt-10 max-w-2xl text-sm text-fg-muted">
        <h2 className="text-base font-medium text-fg">License and attribution</h2>
        <p className="mt-2">
          The dataset is published under CC BY 4.0: use it anywhere, including commercially, as long
          as you credit HackWinnerDB and link back. The website and tooling code are MIT licensed.
        </p>
        <p className="mt-3">
          Prefer the raw records? They live in{" "}
          <code className="font-mono">data/</code> in the{" "}
          <a href={SITE.repo} target="_blank" rel="noreferrer" className="underline">
            repository
          </a>
          .
        </p>
      </section>
    </Container>
  );
}
