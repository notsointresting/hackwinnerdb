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
    title: "1. No code required",
    body: "Fill in a GitHub issue form with the hackathon, the project, the award, and a public source. A maintainer converts it into data.",
    action: { href: `${GITHUB_NEW_ISSUE}?template=add-winner.yml`, label: "Add a hackathon winner" },
  },
  {
    title: "2. Guided pull request",
    body: "Fork the repository, run npm run add:winner, answer the prompts, and the CLI writes the YAML files for you. Then run validation and open a PR.",
    action: { href: `${SITE.repo}/blob/main/CONTRIBUTING.md`, label: "Read CONTRIBUTING.md" },
  },
  {
    title: "3. Edit the YAML directly",
    body: "Advanced contributors can write hackathon, project, and entry files by hand against the documented Zod schemas.",
    action: { href: `${SITE.repo}/blob/main/DATA_GUIDELINES.md`, label: "Read the data guidelines" },
  },
];

export default function ContributePage() {
  return (
    <Container className="py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Contribute</h1>
      <p className="mt-3 max-w-2xl text-fg-muted">
        HackWinnerDB is a community-maintained open dataset. GitHub is the source of truth: every
        record lives in a YAML file, every change goes through a pull request, and every merge to{" "}
        <code className="font-mono text-sm">main</code> redeploys the site.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={`${GITHUB_NEW_ISSUE}?template=add-winner.yml`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md bg-fg px-4 py-2 text-sm font-medium text-bg hover:opacity-90"
        >
          Add a hackathon winner
        </a>
        <a
          href={`${GITHUB_NEW_ISSUE}?template=correct-data.yml`}
          target="_blank"
          rel="noreferrer"
          className="rounded-md border border-line-strong px-4 py-2 text-sm font-medium hover:bg-bg-subtle"
        >
          Suggest a correction
        </a>
      </div>

      <div className="mt-12 grid gap-4 md:grid-cols-3">
        {LEVELS.map((level) => (
          <section key={level.title} className="rounded-lg border border-line p-5">
            <h2 className="font-medium">{level.title}</h2>
            <p className="mt-2 text-sm text-fg-muted">{level.body}</p>
            <a
              href={level.action.href}
              target="_blank"
              rel="noreferrer"
              className="mt-4 inline-block text-sm underline hover:no-underline"
            >
              {level.action.label} ↗
            </a>
          </section>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold tracking-tight">What a good contribution looks like</h2>
        <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-fg-muted">
          <li>A public source that names the project and the award it won.</li>
          <li>Descriptions written in your own words — never pasted from the original page.</li>
          <li>Canonical technology and category slugs from the taxonomy files.</li>
          <li>
            Validation passing locally: <code className="font-mono">npm run validate:data</code> and{" "}
            <code className="font-mono">npm run check:duplicates</code>.
          </li>
        </ul>
      </section>
    </Container>
  );
}
