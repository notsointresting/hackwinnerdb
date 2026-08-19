import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/site";
import { CheckCircle2, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How HackWinnerDB decides what counts as a hackathon winner, which sources are accepted, and how records are verified and corrected.",
  alternates: { canonical: "/methodology" },
};

const SECTIONS = [
  {
    title: "1. Qualification Standards",
    body: [
      "A project qualifies when it received a named award at an official hackathon — a grand prize, category/track win, sponsor bounty, community choice, or finalist placement.",
      "Participation alone does not qualify. Self-promoted claims or informal shortlists without official event recognition are excluded.",
    ],
  },
  {
    title: "2. Verifiable Public Sources",
    body: [
      "Every entry requires at least one public source confirming the win: official winner galleries (Devpost, DoraHacks), organizer blog posts, or verified press releases.",
      "Claims lacking public corroboration are rejected or flagged as unverified pending human review.",
    ],
  },
  {
    title: "3. Human Verification Pipeline",
    body: [
      "Submissions are checked by maintainers who verify the project name, builder list, hackathon edition, and specific prize won.",
      "The exact review date is stamped on the record as checked_at. If a source link decays, the record is flagged for replacement rather than silently discarded.",
    ],
  },
  {
    title: "4. Controlled Taxonomies",
    body: [
      "Technologies and categories use strictly curated taxonomies in YAML to prevent tag fragmentation (e.g. preventing 'React.js', 'react-js', and 'React' from splitting).",
    ],
  },
  {
    title: "5. Deduplication & Integrity",
    body: [
      "When a project enters multiple hackathons, each entry links back to the central project ID. Automated CI checks detect duplicate URLs and repository collisions on every PR.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <Container className="py-12">
      <div className="border-b border-line/60 pb-8">
        <div className="flex items-center gap-2 text-accent">
          <ShieldCheck className="h-5 w-5" />
          <span className="hw-eyebrow text-xs font-bold">Integrity &amp; Standards</span>
        </div>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">Methodology</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          Trust is our core standard. This document outlines how records are discovered, verified by humans, and curated for accuracy.
        </p>
      </div>

      <div className="hw-stagger mt-10 space-y-6 max-w-3xl">
        {SECTIONS.map((section) => (
          <section
            key={section.title}
            className="hw-reveal rounded-2xl border border-line/70 bg-bg-subtle/60 p-6 backdrop-blur-sm transition-all duration-300 hover:border-accent-line hover:bg-bg-subtle"
          >
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-accent" />
              <h2 className="text-lg font-semibold tracking-tight text-fg">{section.title}</h2>
            </div>
            <div className="mt-3.5 space-y-2.5 pl-7.5">
              {section.body.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-fg-muted">
                  {paragraph}
                </p>
              ))}
            </div>
          </section>
        ))}

        <div className="hw-reveal rounded-2xl border border-accent-line/70 bg-accent-bg/40 p-6 backdrop-blur-sm sm:p-8">
          <h2 className="text-lg font-bold text-fg">Transparent &amp; Open Source</h2>
          <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">
            All verification rules, duplicate scripts, and schemas are publicly viewable in our repository. Anyone can audit or propose corrections to any record.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/contribute"
              className="rounded-xl bg-fg px-4 py-2 text-xs font-semibold text-bg transition-all hover:bg-fg/90"
            >
              Learn How to Contribute
            </Link>
            <a
              href={SITE.repo}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line/80 bg-bg-subtle/80 px-4 py-2 text-xs font-semibold text-fg transition-all hover:border-accent hover:text-accent"
            >
              Inspect Source on GitHub ↗
            </a>
          </div>
        </div>
      </div>
    </Container>
  );
}
