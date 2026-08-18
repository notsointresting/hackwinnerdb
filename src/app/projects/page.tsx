import type { Metadata } from "next";
import { Container } from "@/components/ui";
import { WinnerBrowser } from "@/components/winner-browser";
import { getDataset } from "@/lib/repository";
import type { RawParams } from "@/lib/search-params";

export const metadata: Metadata = {
  title: "Browse hackathon winners",
  description:
    "Search and filter every winning hackathon project in HackWinnerDB by year, award, category, technology, and source.",
  alternates: { canonical: "/projects" },
};

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<RawParams>;
}) {
  const params = await searchParams;
  const dataset = getDataset();
  return (
    <Container className="py-10">
      <h1 className="hw-display text-4xl sm:text-5xl">Winning projects</h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">
        Every award in the database, with the source that confirms it. Filters are reflected in the
        URL, so any view can be shared.
      </p>
      <div className="mt-8">
        <WinnerBrowser
          dataset={dataset}
          candidates={dataset.winners}
          params={params}
          basePath="/projects"
        />
      </div>
    </Container>
  );
}
