/** Pages Devpost's public hackathon API to discover ended events. */
import { fetchPage } from "./http";

export interface DiscoveredEvent {
  id: number;
  title: string;
  url: string;
  submissionDates: string | null;
  registrations: number | null;
  prizeAmount: number | null;
  themes: string[];
}

const API = "https://devpost.com/api/hackathons";

/** "Jul 01 - Aug 01, 2026" -> 2026 */
export function yearFromDates(dates: string | null): number | null {
  const match = dates?.match(/(20\d{2})\s*$/);
  return match ? Number(match[1]) : null;
}

function parsePrize(raw: unknown): number | null {
  if (typeof raw !== "string") return null;
  const digits = raw.replace(/<[^>]+>/g, "").replace(/[^0-9]/g, "");
  return digits ? Number(digits) : null;
}

export async function discoverEvents(page: number): Promise<DiscoveredEvent[]> {
  const body = await fetchPage(`${API}?status[]=ended&order_by=recently-added&page=${page}`);
  const data = JSON.parse(body) as {
    hackathons: Record<string, unknown>[];
  };
  return data.hackathons.map((h) => ({
    id: Number(h.id),
    title: String(h.title ?? ""),
    url: String(h.url ?? "").replace(/\/$/, "") + "/",
    submissionDates: (h.submission_period_dates as string) ?? null,
    registrations: typeof h.registrations_count === "number" ? h.registrations_count : null,
    prizeAmount: parsePrize(h.prize_amount),
    themes: Array.isArray(h.themes)
      ? (h.themes as { name: string }[]).map((t) => t.name)
      : [],
  }));
}
