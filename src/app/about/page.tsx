import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "About",
  description:
    "HackWinnerDB is an open, searchable index of hackathon-winning projects, maintained by the community on GitHub.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <Container className="py-12">
      <div className="border-b border-line/60 pb-6">
        <span className="hw-eyebrow text-xs font-bold text-accent">About the Project</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">Preserving Winning Hacks</h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
          HackWinnerDB is an open-source, community-curated archive of hackathon-winning software and hardware.
        </p>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-2">
        <div className="hw-reveal rounded-2xl border border-line/70 bg-bg-subtle/60 p-6 backdrop-blur-sm">
          <h2 className="hw-display text-xl font-semibold text-fg">The Problem</h2>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            Hackathon winners are scattered. They live on event sites that expire, Devpost galleries,
            blog posts, social threads, and README files. A year later the project is hard to find and
            the award is hard to confirm.
          </p>
        </div>

        <div className="hw-reveal rounded-2xl border border-line/70 bg-bg-subtle/60 p-6 backdrop-blur-sm">
          <h2 className="hw-display text-xl font-semibold text-fg">The Solution</h2>
          <p className="mt-3 text-sm leading-relaxed text-fg-muted">
            HackWinnerDB collects them into one open, searchable index. Each record links a project to
            the hackathon it entered, the awards it won, and the public source that proves it.
          </p>
        </div>
      </div>

      <div className="hw-reveal mt-8 rounded-2xl border border-accent-line/70 bg-accent-bg/40 p-8 backdrop-blur-sm">
        <h2 className="hw-display text-2xl font-bold text-fg">Git-Native Data Architecture</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          The dataset is a first-class product. Clone the repository and the winner data is right
          there in clean YAML — you never have to run the website or an API to query it.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/methodology"
            className="rounded-xl border border-line/80 bg-bg-subtle/80 px-4 py-2 text-xs font-semibold text-fg transition-all hover:border-accent hover:text-accent"
          >
            Read Methodology →
          </Link>
          <Link
            href="/contribute"
            className="rounded-xl bg-fg px-4 py-2 text-xs font-semibold text-bg transition-all hover:bg-fg/90"
          >
            Contribute a Winner
          </Link>
          <Link
            href="/dataset"
            className="rounded-xl border border-line/80 bg-bg-subtle/80 px-4 py-2 text-xs font-semibold text-fg transition-all hover:border-accent hover:text-accent"
          >
            Download Dataset
          </Link>
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line/80 bg-bg-subtle/80 px-4 py-2 text-xs font-semibold text-fg transition-all hover:border-accent hover:text-accent"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </Container>
  );
}
