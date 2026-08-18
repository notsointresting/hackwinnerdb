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
      <h1 className="hw-display text-4xl sm:text-5xl">About</h1>
      <div className="mt-6 max-w-2xl space-y-5 leading-relaxed text-fg-muted">
        <p>
          Hackathon winners are scattered. They live on event sites that expire, Devpost galleries,
          blog posts, social threads, and README files. A year later the project is hard to find and
          the award is hard to confirm.
        </p>
        <p>
          HackWinnerDB collects them into one open, searchable index. Each record links a project to
          the hackathon it entered, the awards it won, and the public source that proves it.
        </p>
        <p className="text-fg">
          Mission: preserve and make discoverable the projects that win hackathons.
        </p>
        <p>
          The dataset is a first-class product. Clone the repository and the winner data is right
          there in YAML — you never have to run the website to use it.
        </p>
      </div>
      <div className="mt-8 flex flex-wrap gap-3 text-sm">
        <Link href="/methodology" className="underline hover:no-underline">
          Methodology
        </Link>
        <Link href="/contribute" className="underline hover:no-underline">
          Contribute
        </Link>
        <Link href="/dataset" className="underline hover:no-underline">
          Download the dataset
        </Link>
        <a href={SITE.repo} target="_blank" rel="noreferrer" className="underline hover:no-underline">
          GitHub ↗
        </a>
      </div>
    </Container>
  );
}
