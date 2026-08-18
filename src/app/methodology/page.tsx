import type { Metadata } from "next";
import Link from "next/link";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How HackWinnerDB decides what counts as a hackathon winner, which sources are accepted, and how records are verified and corrected.",
  alternates: { canonical: "/methodology" },
};

const SECTIONS = [
  {
    title: "What qualifies as a hackathon winner",
    body: [
      "A project qualifies when it received a named award at a hackathon — a grand prize, a placement, a track or category win, a sponsor prize, an audience or community choice award, an honorable mention, or a finalist placement.",
      "Participation alone does not qualify. Neither does a project that was merely featured, shortlisted informally, or promoted by its own team.",
    ],
  },
  {
    title: "Accepted sources",
    body: [
      "Every published entry carries at least one publicly accessible source that confirms the award: an official winners page, a platform winner gallery, an organizer announcement or blog post, an official social announcement, or a project page that clearly shows the award.",
      "Self-published claims with no corroborating organizer source are recorded as unverified or rejected.",
    ],
  },
  {
    title: "Verification",
    body: [
      "A maintainer opens the source and checks that it names both the project and the award before merging. The date of that check is stored on the entry as checked_at and shown on the project page.",
      "Sources rot. If a link dies, the entry keeps its record and the status can be moved to disputed until a replacement source is found.",
    ],
  },
  {
    title: "Categories and technologies",
    body: [
      "Categories and technologies are controlled vocabularies, not free-text tags. Adding a new one is a deliberate change to a taxonomy file, reviewed like any other change.",
      "This keeps filters meaningful: a single technology cannot silently split into five spellings.",
    ],
  },
  {
    title: "Duplicates",
    body: [
      "One project can enter many hackathons, so projects and awards are stored separately and linked by an entry. Only one entry may exist per project and hackathon pair.",
      "A duplicate checker compares normalized names, repository URLs, website domains, and submission URLs on every pull request.",
    ],
  },
  {
    title: "Corrections",
    body: [
      "Anyone can open a correction issue or a pull request against the offending YAML file. Corrections that come with a source are merged quickly.",
    ],
  },
  {
    title: "Limitations",
    body: [
      "Coverage is uneven by design: the database grows where contributors are. Early data skews toward large online hackathons with public winner galleries.",
      "Prize amounts, participant counts, and submission counts are only recorded when the organizer published them.",
      "Summaries are written by contributors, so tone varies. They are deliberately short and original rather than copied from the source.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Methodology</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        Trust is the product. This page describes exactly how records get in, how they are checked,
        and where the data falls short.
      </p>
      <div className="mt-10 max-w-3xl space-y-10">
        {SECTIONS.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-semibold tracking-tight">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="mt-3 leading-relaxed text-fg-muted">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
        <section>
          <h2 className="text-lg font-semibold tracking-tight">Community contributions</h2>
          <p className="mt-3 leading-relaxed text-fg-muted">
            Everything above is enforced in the open: schemas, validation rules, and review happen in
            the repository. See <Link href="/contribute" className="underline">Contribute</Link> or the{" "}
            <a href={SITE.repo} target="_blank" rel="noreferrer" className="underline">
              GitHub repository
            </a>
            .
          </p>
        </section>
      </div>
    </Container>
  );
}
