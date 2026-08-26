/** Shared Devpost HTML parsers used by the manual importer and the background sync. */
import { decode, stripTags } from "./http";
import { slugify } from "../../src/lib/utils";

export interface GalleryProject {
  slug: string;
  url: string;
  name: string;
  tagline: string;
  image: string | null;
  builders: string[];
  technologiesHint: string[];
}

export function extractImage(htmlOrBlock: string): string | null {
  const srcMatch =
    htmlOrBlock.match(/src="([^"]*(?:software_photos|software_thumbnail_photos)[^"]*)"/i)?.[1] ??
    htmlOrBlock.match(/data-src="([^"]*(?:software_photos|software_thumbnail_photos)[^"]*)"/i)?.[1] ??
    htmlOrBlock.match(/<meta[^>]+(?:property|name)="og:image"[^>]+content="([^"]+)"/i)?.[1] ??
    htmlOrBlock.match(/<meta[^>]+content="([^"]+)"[^>]+(?:property|name)="og:image"/i)?.[1] ??
    htmlOrBlock.match(/<meta[^>]+itemprop="image"[^>]+content="([^"]+)"/i)?.[1] ??
    htmlOrBlock.match(/<meta[^>]+itemprop="screenshot"[^>]+content="([^"]+)"/i)?.[1] ??
    htmlOrBlock.match(/<img[^>]+class="[^"]*software_thumbnail_image[^"]*"[^>]+src="([^"]+)"/i)?.[1] ??
    null;

  if (!srcMatch) return null;
  const decoded = decode(srcMatch);
  if (
    /thumbnail-placeholder/i.test(decoded) ||
    /devpost-open-graph/i.test(decoded) ||
    /devpost_social_icon/i.test(decoded)
  ) {
    return null;
  }
  if (decoded.startsWith("//")) return `https:${decoded}`;
  return decoded;
}

export function parseGallery(html: string): GalleryProject[] {
  const projects: GalleryProject[] = [];
  // Items carry extra grid classes, so key off the stable data attribute.
  const blocks = html.split('data-software-id="').slice(1);
  for (const block of blocks) {
    // Only keep entries carrying a winner ribbon.
    if (!/class="winner"/.test(block)) continue;
    const url = block.match(/href="(https:\/\/devpost\.com\/software\/[^"]+)"/)?.[1];
    if (!url) continue;
    const name = block.match(/<h5>\s*([\s\S]*?)\s*<\/h5>/)?.[1];
    const tagline = block.match(/<p class="small tagline">\s*([\s\S]*?)\s*<\/p>/)?.[1];
    const image = extractImage(block);
    const builders = [...block.matchAll(/<img alt="([^"]+)" class="user-photo/g)].map((m) =>
      decode(m[1]),
    );
    projects.push({
      slug: url.split("/software/")[1].replace(/\/$/, ""),
      url,
      name: name ? stripTags(name) : "",
      tagline: tagline ? stripTags(tagline) : "",
      image,
      builders,
      technologiesHint: [],
    });
  }
  return projects;
}

export interface ProjectDetail {
  awards: { hackathonUrl: string; hackathonName: string; title: string }[];
  technologies: string[];
  links: { website: string | null; github: string | null; video: string | null };
  image: string | null;
}

export function parseProject(html: string): ProjectDetail {
  const awards: ProjectDetail["awards"] = [];
  for (const block of html.split('class="software-list-content"').slice(1)) {
    const hackathonUrl = block.match(/href="(https?:\/\/[^"]+devpost\.com\/?)"/)?.[1];
    const hackathonName = block.match(/href="https?:\/\/[^"]+"\s*>\s*([\s\S]*?)\s*<\/a>/)?.[1];
    if (!hackathonUrl || !hackathonName) continue;
    for (const item of block.matchAll(
      /<span class="winner[^"]*">[\s\S]*?<\/span>\s*([\s\S]*?)\s*<\/li>/g,
    )) {
      awards.push({
        hackathonUrl: hackathonUrl.replace(/\/$/, "") + "/",
        hackathonName: stripTags(hackathonName),
        title: stripTags(item[1]) || "Winner",
      });
    }
  }

  const builtWith = html.split('id="built-with"')[1]?.split("</ul>")[0] ?? "";
  const technologies = [...builtWith.matchAll(/<span class="cp-tag[^"]*">([\s\S]*?)<\/span>/g)].map(
    (m) => stripTags(m[1]),
  );

  const github = html.match(/href="(https:\/\/github\.com\/[^"]+)"/)?.[1] ?? null;
  const video =
    html.match(/href="(https:\/\/(?:www\.)?youtube\.com\/watch[^"]+)"/)?.[1] ??
    html.match(/src="(https:\/\/www\.youtube\.com\/embed\/[^"?]+)/)?.[1] ??
    null;
  const website = html.match(/<nav id="app-links"[\s\S]*?href="(https?:\/\/[^"]+)"/)?.[1] ?? null;
  const image = extractImage(html);

  return { awards, technologies, links: { website, github, video }, image };
}

/** Maps a Devpost "built with" tag onto a canonical slug, or reports it as unknown. */
/**
 * Hyphenation is the only difference in a lot of Devpost tags, so "node-js" and
 * "next-js" were being reported as unknown while `nodejs` and `nextjs` sat in
 * the taxonomy. Compare with the separators removed before giving up on a tag.
 */
function resolveSlug(slug: string, known: Set<string>, collapsed: Map<string, string>) {
  if (known.has(slug)) return slug;
  return collapsed.get(slug.replace(/-/g, "")) ?? null;
}

export function mapTechnologies(tags: string[], known: Set<string>) {
  const collapsed = new Map([...known].map((slug) => [slug.replace(/-/g, ""), slug]));
  const mapped: string[] = [];
  const unknown: string[] = [];
  for (const tag of tags) {
    const slug = slugify(tag);
    const resolved = resolveSlug(slug, known, collapsed);
    if (resolved) mapped.push(resolved);
    else unknown.push(slug);
  }
  return { mapped: [...new Set(mapped)], unknown: [...new Set(unknown)] };
}

export interface HackathonDetail {
  startDate: string | null;
  endDate: string | null;
  year: number | null;
  mode: "online" | "in-person" | "hybrid" | null;
  participantCount: number | null;
  prizePool: number | null;
  currency: string | null;
}

/**
 * Parses a Devpost event homepage for the facts the gallery does not carry.
 *
 * Dates are the reason this exists: without them every imported hackathon fell
 * back to a placeholder year, so nothing could be sorted or filtered by date.
 */
export function parseHackathon(html: string): HackathonDetail {
  const iso = (raw: string | undefined) =>
    raw && /^\d{4}-\d{2}-\d{2}/.test(raw) ? raw.slice(0, 10) : null;

  const startDate = iso(html.match(/"startDate"\s*:\s*"([^"]+)"/)?.[1]);
  const endDate = iso(html.match(/"endDate"\s*:\s*"([^"]+)"/)?.[1]);

  const participantsRaw = html.match(/Participants\s*\((\d[\d,]*)\)/i)?.[1];
  const prizeRaw = html.match(/\$([\d,]+)\s*in prizes/i)?.[1];

  const modeRaw = html.match(/\b(online|in[- ]person|hybrid)\b/i)?.[1]?.toLowerCase();
  const mode =
    modeRaw === "online"
      ? "online"
      : modeRaw === "hybrid"
        ? "hybrid"
        : modeRaw
          ? "in-person"
          : null;

  return {
    startDate,
    endDate,
    year: startDate ? Number(startDate.slice(0, 4)) : null,
    mode,
    participantCount: participantsRaw ? Number(participantsRaw.replace(/,/g, "")) : null,
    prizePool: prizeRaw ? Number(prizeRaw.replace(/,/g, "")) : null,
    currency: prizeRaw ? "USD" : null,
  };
}
