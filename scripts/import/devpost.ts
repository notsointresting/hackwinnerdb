#!/usr/bin/env tsx
/**
 * Devpost winner-gallery importer.
 *
 *   npx tsx scripts/import/devpost.ts https://<event>.devpost.com/project-gallery?filter=winner
 *
 * Writes DRAFT records to data/_staging/. Nothing it produces is publishable:
 * every entry is marked `unverified`, and every project is missing the summary
 * a human has to write. A maintainer reads the source, writes original prose,
 * and moves the files into data/ — that review is the point.
 *
 * Deliberately does NOT copy Devpost's descriptions: the dataset license only
 * covers facts, links, and original paraphrase.
 */
import fs from "node:fs";
import path from "node:path";
import { stringify } from "yaml";
import { fetchPage } from "./http";
import { parseGallery, parseProject, mapTechnologies, parseHackathon } from "./devpost-parse";
import type { GalleryProject, HackathonDetail } from "./devpost-parse";
import { slugify } from "../../src/lib/utils";
import { loadRaw } from "../lib-load";

const STAGING = path.join(process.cwd(), "data", "_staging");
const MAX_GALLERY_PAGES = 25;

async function main() {
  const galleryUrl = process.argv[2];
  if (!galleryUrl || !galleryUrl.includes("devpost.com")) {
    console.error("Usage: tsx scripts/import/devpost.ts <devpost project-gallery URL>");
    console.error("Pass the plain gallery URL. Do not add ?filter=winner: on some events");
    console.error("that filter returns a paginated list with no winner ribbons at all.");
    process.exit(1);
  }
  if (/^https:\/\/devpost\.com\/software\/?$/.test(galleryUrl)) {
    console.error(
      "That is the global gallery of every submission, not a winners list.\n" +
        "Use a single event, e.g. https://googleai.devpost.com/project-gallery?filter=winner",
    );
    process.exit(1);
  }

  const raw = loadRaw();
  const knownTech = new Set((raw.technologies as { slug: string }[]).map((t) => t.slug));
  const existingProjects = new Set(
    raw.projects.map(({ data }) => String((data as { id: string }).id)),
  );

  // Devpost's own ?filter=winner drops the winner ribbons the parser keys off, so
  // strip it and read the plain gallery, which sorts winners first.
  const base = new URL(galleryUrl);
  if (base.searchParams.has("filter")) {
    console.log("Ignoring ?filter=winner - it hides the ribbons this importer needs.");
    base.searchParams.delete("filter");
  }
  base.searchParams.delete("page");

  console.log(`Fetching gallery: ${base.toString()}`);
  const gallery: GalleryProject[] = [];
  const seenSlugs = new Set<string>();
  for (let page = 1; page <= MAX_GALLERY_PAGES; page++) {
    const pageUrl = new URL(base.toString());
    if (page > 1) pageUrl.searchParams.set("page", String(page));
    const html = await fetchPage(pageUrl.toString());
    const found = parseGallery(html).filter((item) => !seenSlugs.has(item.slug));
    for (const item of found) seenSlugs.add(item.slug);
    gallery.push(...found);
    console.log(`  page ${page}: ${found.length} winner(s)`);
    // Winners sort first, so a page with none means there are none left to find.
    if (!found.length || !/rel="next"/.test(html)) break;
  }
  console.log(`  ${gallery.length} winning project(s) found\n`);
  if (!gallery.length) {
    console.error("No winner ribbons on that page. Are the winners public yet?");
    process.exit(1);
  }

  fs.mkdirSync(STAGING, { recursive: true });
  const unknownTech = new Set<string>();
  const hackathons = new Map<string, { name: string; url: string }>();
  let written = 0;
  let skipped = 0;

  for (const project of gallery) {
    const detail = parseProject(await fetchPage(project.url));
    const id = slugify(project.name || project.slug);
    const tech = mapTechnologies(detail.technologies, knownTech);
    for (const slug of tech.unknown) unknownTech.add(slug);

    // A project we already hold can still have won something we have no record
    // of, so only its project file is skipped here - its awards are staged below.
    const isKnown = existingProjects.has(id);
    if (isKnown) skipped++;

    if (!isKnown) fs.writeFileSync(
      path.join(STAGING, `project-${id}.yaml`),
      stringify(
        {
          id,
          name: project.name,
          slug: id,
          tagline: project.tagline.slice(0, 160),
          summary: "TODO: write an original two-sentence summary before publishing.",
          website_url: detail.links.website,
          github_url: detail.links.github,
          demo_url: null,
          video_url: detail.links.video,
          image_url: project.image,
          categories: [],
          technologies: tech.mapped,
          builders: project.builders.map((name) => ({ name })),
        },
        { lineWidth: 100 },
      ),
    );

    for (const award of detail.awards) {
      const hackathonId = slugify(award.hackathonName);
      hackathons.set(hackathonId, { name: award.hackathonName, url: award.hackathonUrl });
      fs.writeFileSync(
        path.join(STAGING, `entry-${id}-${hackathonId}.yaml`),
        stringify(
          {
            id: `${id}-${hackathonId}`,
            project_id: id,
            hackathon_id: hackathonId,
            submission_url: project.url,
            source: { platform: "devpost", url: project.url },
            awards: [{ type: "TODO: pick an award type", title: award.title }],
            verification: {
              status: "unverified",
              checked_at: new Date().toISOString().slice(0, 10),
              notes: "Imported automatically. A maintainer must confirm the source before publishing.",
            },
          },
          { lineWidth: 100 },
        ),
      );
    }
    console.log(
      `  ${isKnown ? "~" : "+"} ${id} (${detail.awards.length} award record(s))` +
        (isKnown ? " - project already held, awards only" : ""),
    );
    if (!isKnown) written++;
  }

  for (const [id, hackathon] of hackathons) {
    const file = path.join(STAGING, `hackathon-${id}.yaml`);
    if (fs.existsSync(file)) continue;
    // The gallery never carries dates; the event homepage does.
    let detail: HackathonDetail | null = null;
    try {
      detail = parseHackathon(await fetchPage(hackathon.url));
    } catch {
      console.log(`  ! could not read ${hackathon.url} for dates`);
    }
    fs.writeFileSync(
      file,
      stringify(
        {
          id,
          name: hackathon.name,
          slug: id,
          organizer: [],
          year: detail?.year ?? "TODO: the year the hackathon ran",
          start_date: detail?.startDate ?? null,
          end_date: detail?.endDate ?? null,
          mode: detail?.mode ?? null,
          participant_count: detail?.participantCount ?? null,
          prize_pool: detail?.prizePool ?? null,
          currency: detail?.currency ?? null,
          website_url: hackathon.url,
          sources: [hackathon.url],
          platform: "devpost",
          description: "TODO: write an original one-sentence description.",
        },
        { lineWidth: 100 },
      ),
    );
  }

  console.log(`\nStaged ${written} project(s), ${hackathons.size} hackathon(s); ${skipped} skipped.`);
  if (unknownTech.size) {
    console.log(
      `\nUnknown technologies (add to the taxonomy or drop them):\n  ${[...unknownTech].join(", ")}`,
    );
  }
  console.log(
    [
      "",
      "These are DRAFTS in data/_staging/ and are not published.",
      "Before moving a file into data/:",
      "  1. open the source and confirm the award is real",
      "  2. replace every TODO, including an original summary in your own words",
      "  3. set award types, categories, and the hackathon year",
      "  4. set verification.status to verified once you have checked it yourself",
      "  5. run npm run validate:data && npm run check:duplicates",
    ].join("\n"),
  );
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
