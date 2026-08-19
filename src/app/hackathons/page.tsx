import type { Metadata } from "next";
import Link from "next/link";
import { Container, EmptyState } from "@/components/ui";
import { getDataset } from "@/lib/repository";
import { winnersForHackathon } from "@/lib/queries";
import { formatMoney } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Hackathons",
  description: "Every hackathon with recorded winners in HackWinnerDB.",
  alternates: { canonical: "/hackathons" },
};

export default function HackathonsPage() {
  const dataset = getDataset();
  const byYear = new Map<number, typeof dataset.hackathons>();
  for (const hackathon of dataset.hackathons) {
    byYear.set(hackathon.year, [...(byYear.get(hackathon.year) ?? []), hackathon]);
  }
  const years = [...byYear.keys()].sort((a, b) => b - a);

  return (
    <Container className="py-12">
      <div className="border-b border-line/60 pb-6">
        <span className="hw-eyebrow text-xs font-bold text-accent">Event Directory</span>
        <h1 className="hw-display mt-2 text-4xl sm:text-5xl">Hackathons</h1>
        <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-fg-muted">
          {dataset.hackathons.length} global hackathon events with source-verified winning projects.
        </p>
      </div>

      {years.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No hackathons recorded yet." />
        </div>
      ) : null}

      {years.map((year) => (
        <section key={year} className="mt-12">
          <div className="flex items-center gap-3 border-b border-line/60 pb-2.5">
            <span className="rounded-md border border-accent-line/70 bg-accent-bg/80 px-2.5 py-0.5 font-mono text-xs font-bold text-accent">
              {year}
            </span>
            <span className="text-xs text-fg-muted">
              {byYear.get(year)?.length} event{(byYear.get(year)?.length ?? 0) === 1 ? "" : "s"}
            </span>
          </div>

          <ul className="hw-stagger mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {byYear
              .get(year)!
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hackathon) => {
                const wins = winnersForHackathon(dataset, hackathon.id);
                return (
                  <li key={hackathon.id}>
                    <Link
                      href={`/hackathons/${hackathon.slug}`}
                      className="hw-reveal group block rounded-2xl border border-line/70 bg-bg-subtle/60 p-5 backdrop-blur-sm transition-all duration-300 ease-out hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_20px_rgba(123,63,242,0.18)] motion-safe:hover:-translate-y-1"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="block font-semibold text-fg transition-colors group-hover:text-accent">
                          {hackathon.name}
                        </span>
                        <span
                          aria-hidden="true"
                          className="text-fg-muted transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-hover:text-accent"
                        >
                          →
                        </span>
                      </div>
                      <span className="mt-1.5 block text-xs text-fg-muted">
                        {hackathon.organizer.join(", ") || "Independent Organizer"}
                      </span>
                      <div className="mt-3 flex items-center justify-between border-t border-line/50 pt-2.5 text-xs">
                        <span className="font-mono text-fg-muted">
                          <span className="font-bold text-accent">{wins.length}</span> winner{wins.length === 1 ? "" : "s"}
                        </span>
                        {hackathon.prize_pool && hackathon.currency ? (
                          <span className="font-mono font-medium text-emerald-400">
                            {formatMoney(hackathon.prize_pool, hackathon.currency)} pool
                          </span>
                        ) : null}
                      </div>
                    </Link>
                  </li>
                );
              })}
          </ul>
        </section>
      ))}
    </Container>
  );
}
