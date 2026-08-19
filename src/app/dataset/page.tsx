import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { getDataset, computeStats } from "@/lib/repository";
import { formatNumber } from "@/lib/utils";
import { SITE } from "@/lib/site";
import { Download } from "lucide-react";

export const metadata: Metadata = {
  title: "Download the dataset",
  description:
    "Download the full HackWinnerDB dataset of hackathon winners as JSON or CSV, licensed CC BY 4.0.",
  alternates: { canonical: "/dataset" },
};

const FILES = [
  { file: "hackwinnerdb.json", label: "Complete Database", type: "JSON", desc: "All projects, hackathons, and entries combined" },
  { file: "projects.json", label: "Projects", type: "JSON", desc: "Project names, summaries, tech stacks, and builders" },
  { file: "hackathons.json", label: "Hackathons", type: "JSON", desc: "Hackathon editions, dates, prize pools, and organizers" },
  { file: "entries.json", label: "Winning Entries", type: "JSON", desc: "Award details, placement levels, and verified sources" },
  { file: "projects.csv", label: "Projects", type: "CSV", desc: "Tabular format for spreadsheets and data science" },
  { file: "hackathons.csv", label: "Hackathons", type: "CSV", desc: "Hackathon records in CSV format" },
  { file: "entries.csv", label: "Winning Entries", type: "CSV", desc: "Award records in CSV format" },
];

export default function DatasetPage() {
  const stats = computeStats(getDataset());
  return (
    <Container className="py-12">
      <div className="border-b border-line/60 pb-8">
        <span className="hw-eyebrow text-xs font-bold text-accent">Open Data Export</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">Download Dataset</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Generated automatically from repository YAML files on every build. Includes{" "}
          <span className="font-mono font-semibold text-accent">{formatNumber(stats.hackathons)}</span> hackathons,{" "}
          <span className="font-mono font-semibold text-accent">{formatNumber(stats.projects)}</span> projects, and{" "}
          <span className="font-mono font-semibold text-accent">{formatNumber(stats.entries)}</span> winning entries.
        </p>
      </div>

      <div className="hw-stagger mt-8 grid gap-4 sm:grid-cols-2">
        {FILES.map((item) => (
          <a
            key={item.file}
            href={`/dataset/${item.file}`}
            download
            className="hw-reveal group flex items-center justify-between rounded-2xl border border-line/70 bg-bg-subtle/60 p-5 backdrop-blur-sm transition-all duration-300 ease-out hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_20px_rgba(123,63,242,0.18)] motion-safe:hover:-translate-y-1"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-fg transition-colors group-hover:text-accent">
                  {item.label}
                </span>
                <span className="rounded-full border border-line bg-bg px-2 py-0.5 font-mono text-[10px] text-accent">
                  {item.type}
                </span>
              </div>
              <p className="mt-1 text-xs text-fg-muted">{item.desc}</p>
              <p className="mt-2 font-mono text-[11px] text-fg-muted/80">{item.file}</p>
            </div>
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-line/80 bg-bg-raised/80 text-fg-muted transition-colors group-hover:border-accent group-hover:text-accent">
              <Download className="h-4 w-4" />
            </div>
          </a>
        ))}
      </div>

      <section className="mt-12 rounded-2xl border border-line/60 bg-bg-subtle/40 p-6 backdrop-blur-sm sm:p-8">
        <h2 className="text-base font-semibold text-fg">License and Attribution</h2>
        <p className="mt-2 text-sm leading-relaxed text-fg-muted">
          The dataset is published under <span className="font-semibold text-fg">CC BY 4.0</span>: free to use for any personal, educational, or commercial application with credit back to HackWinnerDB. The codebase and build tools are MIT licensed.
        </p>
        <p className="mt-3 text-sm text-fg-muted">
          Looking for the raw YAML source files? They reside in{" "}
          <code className="rounded bg-bg-raised px-1.5 py-0.5 font-mono text-xs text-accent">data/</code> in our{" "}
          <a href={SITE.repo} target="_blank" rel="noreferrer" className="text-accent underline hover:no-underline">
            GitHub repository
          </a>
          .
        </p>
      </section>
    </Container>
  );
}
