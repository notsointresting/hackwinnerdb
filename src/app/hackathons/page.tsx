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
    <Container className="py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Hackathons</h1>
      <p className="mt-2 max-w-2xl text-sm text-fg-muted">
        {dataset.hackathons.length} event{dataset.hackathons.length === 1 ? "" : "s"} with
        source-verified winners.
      </p>
      {years.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No hackathons recorded yet." />
        </div>
      ) : null}
      {years.map((year) => (
        <section key={year} className="mt-10">
          <h2 className="border-b border-line pb-2 font-mono text-sm text-fg-muted">{year}</h2>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {byYear
              .get(year)!
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((hackathon) => {
                const wins = winnersForHackathon(dataset, hackathon.id);
                return (
                  <li key={hackathon.id}>
                    <Link
                      href={`/hackathons/${hackathon.slug}`}
                      className="block rounded-lg border border-line p-4 hover:border-line-strong"
                    >
                      <span className="block font-medium">{hackathon.name}</span>
                      <span className="mt-1 block text-sm text-fg-muted">
                        {hackathon.organizer.join(", ") || "Independent"}
                      </span>
                      <span className="mt-2 block font-mono text-xs text-fg-muted">
                        {wins.length} winner{wins.length === 1 ? "" : "s"}
                        {hackathon.prize_pool && hackathon.currency
                          ? ` · ${formatMoney(hackathon.prize_pool, hackathon.currency)} pool`
                          : ""}
                      </span>
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
