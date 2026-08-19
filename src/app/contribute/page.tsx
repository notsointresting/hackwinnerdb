import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { SITE } from "@/lib/site";
import { GITHUB_NEW_ISSUE } from "@/lib/paths";

export const metadata: Metadata = {
  title: "Contribute",
  description:
    "Add a hackathon winner to HackWinnerDB through a GitHub issue form or a pull request. No account on this site required.",
  alternates: { canonical: "/contribute" },
};

const LEVELS = [
  {
    step: "01",
    title: "No code required",
    body: "Fill in a GitHub issue form with the hackathon, the project, the award, and a public source link. A maintainer will format and merge it.",
    action: { href: `${GITHUB_NEW_ISSUE}?template=add-winner.yml`, label: "Add a hackathon winner" },
    highlight: false,
  },
  {
    step: "02",
    title: "Interactive CLI (Fast)",
    body: "Fork the repo, run npm run add:winner, answer the interactive terminal prompts to generate valid YAML, and open a PR.",
    action: { href: `${SITE.repo}/blob/main/CONTRIBUTING.md`, label: "Read CONTRIBUTING.md" },
    highlight: true,
  },
  {
    step: "03",
    title: "Edit YAML Directly",
    body: "Power contributors can write hackathon, project, and entry YAML files by hand against our strict Zod schemas.",
    action: { href: `${SITE.repo}/blob/main/DATA_GUIDELINES.md`, label: "Read Data Guidelines" },
    highlight: false,
  },
];

export default function ContributePage() {
  return (
    <Container className="py-12">
      <div className="border-b border-line/60 pb-8">
        <span className="hw-eyebrow text-xs font-bold text-accent">Community Open Source</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">Contribute a Winner</h1>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-fg-muted">
          HackWinnerDB is an open dataset preserved in git. Every record is stored as validated YAML,
          every contribution goes through a pull request, and every merge to{" "}
          <code className="rounded border border-line bg-bg-raised px-1.5 py-0.5 font-mono text-xs text-accent">
            main
          </code>{" "}
          automatically redeploys the site.
        </p>

        <div className="mt-8 flex flex-wrap gap-3.5">
          <a
            href={`${GITHUB_NEW_ISSUE}?template=add-winner.yml`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-fg px-5 py-2.5 text-sm font-semibold text-bg shadow-sm transition-all duration-200 hover:bg-fg/90 hover:shadow-md motion-safe:hover:-translate-y-0.5"
          >
            Submit via Issue Form
          </a>
          <a
            href={`${GITHUB_NEW_ISSUE}?template=correct-data.yml`}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-line-strong bg-bg-subtle/80 px-5 py-2.5 text-sm font-semibold text-fg backdrop-blur-sm transition-all duration-200 hover:border-accent hover:text-accent motion-safe:hover:-translate-y-0.5"
          >
            Suggest a Correction
          </a>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="hw-display text-2xl font-bold text-fg">Three Ways to Contribute</h2>
        <div className="hw-stagger mt-6 grid gap-6 md:grid-cols-3">
          {LEVELS.map((level) => (
            <section
              key={level.title}
              className={`hw-reveal relative flex flex-col justify-between rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 ${
                level.highlight
                  ? "border-accent-line bg-accent-bg/30 shadow-[0_0_25px_rgba(185,139,255,0.15)]"
                  : "border-line/70 bg-bg-subtle/60 hover:border-line-strong"
              }`}
            >
              <div>
                <span className="font-mono text-xs font-bold text-accent">{level.step}</span>
                <h3 className="mt-2 text-lg font-semibold text-fg">{level.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-fg-muted">{level.body}</p>
              </div>
              <a
                href={level.action.href}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline"
              >
                <span>{level.action.label}</span>
                <span aria-hidden="true">↗</span>
              </a>
            </section>
          ))}
        </div>
      </div>

      <div className="mt-12 rounded-2xl border border-line/60 bg-bg-subtle/40 p-6 backdrop-blur-sm sm:p-8">
        <h2 className="text-lg font-semibold tracking-tight text-fg">What a Good Contribution Looks Like</h2>
        <ul className="mt-4 space-y-3 text-sm text-fg-muted">
          <li className="flex items-start gap-2.5">
            <span className="text-accent">✓</span>
            <span>A publicly accessible source link naming the project and the award won.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-accent">✓</span>
            <span>Original description written in your own words — never verbatim marketing copy.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-accent">✓</span>
            <span>Canonical taxonomy slugs for technologies and domain categories.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <span className="text-accent">✓</span>
            <span>
              Passing local validation: <code className="rounded bg-bg-raised px-1.5 py-0.5 font-mono text-xs text-accent">npm run validate:data</code> and{" "}
              <code className="rounded bg-bg-raised px-1.5 py-0.5 font-mono text-xs text-accent">npm run check:duplicates</code>.
            </span>
          </li>
        </ul>
      </div>
    </Container>
  );
}
