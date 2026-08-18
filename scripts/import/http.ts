/**
 * Polite HTTP helper for importers: identifies itself, throttles to one request
 * per second, and caches responses on disk so re-runs do not re-hit the origin.
 */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const CACHE_DIR = path.join(process.cwd(), ".cache", "import");
const USER_AGENT =
  "HackWinnerDB/0.1 (+https://github.com/notsointresting/hackwinnerdb) open-data indexer";
const MIN_INTERVAL_MS = 1000;

let lastRequest = 0;

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function fetchPage(url: string): Promise<string> {
  fs.mkdirSync(CACHE_DIR, { recursive: true });
  const key = crypto.createHash("sha1").update(url).digest("hex");
  const cached = path.join(CACHE_DIR, `${key}.html`);
  if (fs.existsSync(cached)) return fs.readFileSync(cached, "utf8");

  const since = Date.now() - lastRequest;
  if (since < MIN_INTERVAL_MS) await wait(MIN_INTERVAL_MS - since);
  lastRequest = Date.now();

  const response = await fetch(url, { headers: { "user-agent": USER_AGENT } });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText} for ${url}`);
  const html = await response.text();
  fs.writeFileSync(cached, html);
  return html;
}

/** Very small helpers; the markup we target is stable and shallow. */
export const decode = (value: string) =>
  value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#x27;/g, "'")
    .trim();

export const stripTags = (value: string) => decode(value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " "));
