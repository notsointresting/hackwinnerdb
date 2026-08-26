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

const MONTHS: Record<string, number> = {
  jan: 1, feb: 2, mar: 3, apr: 4, may: 5, jun: 6,
  jul: 7, aug: 8, sep: 9, oct: 10, nov: 11, dec: 12,
};

export interface SubmissionWindow {
  startDate: string | null;
  endDate: string | null;
}

/**
 * Turns a Devpost submission-period string into ISO dates.
 *
 * Devpost writes the window three ways, and the second one omits the month on
 * the right-hand side, so the end date has to inherit it from the start:
 *   "Jun 16 - Jul 16, 2026"   cross-month
 *   "Apr 05 - 06, 2024"       same month
 *   "Aug 17, 2026"            single day
 *
 * Without this, every imported hackathon fell back to the current year and no
 * record carried a real date at all.
 */
export function parseSubmissionDates(raw: string | null): SubmissionWindow {
  const empty: SubmissionWindow = { startDate: null, endDate: null };
  if (!raw) return empty;

  const yearMatch = raw.match(/(\d{4})\s*$/);
  if (!yearMatch) return empty;
  const endYear = Number(yearMatch[1]);

  const body = raw.slice(0, yearMatch.index).replace(/,\s*$/, "").trim();
  const [leftRaw, rightRaw] = body.split(/\s+-\s+/);
  if (!leftRaw) return empty;

  const readPart = (part: string | undefined, fallbackMonth: number | null) => {
    if (!part) return null;
    const withMonth = part.trim().match(/^([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})$/);
    if (withMonth) {
      const month = MONTHS[withMonth[1].toLowerCase()];
      return month ? { month, day: Number(withMonth[2]) } : null;
    }
    const dayOnly = part.trim().match(/^(\d{1,2})$/);
    if (dayOnly && fallbackMonth) return { month: fallbackMonth, day: Number(dayOnly[1]) };
    return null;
  };

  const start = readPart(leftRaw, null);
  if (!start) return empty;
  const end = rightRaw ? readPart(rightRaw, start.month) : start;
  if (!end) return empty;

  // "Dec 28 - Jan 05, 2026" means the window opened the previous year.
  const startYear = end.month < start.month ? endYear - 1 : endYear;

  const iso = (year: number, month: number, day: number) =>
    `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  return {
    startDate: iso(startYear, start.month, start.day),
    endDate: iso(endYear, end.month, end.day),
  };
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
