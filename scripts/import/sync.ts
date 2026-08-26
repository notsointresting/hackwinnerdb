#!/usr/bin/env tsx
/**
 * Background sync: discover ended Devpost hackathons, import their winners, and
 * write records straight into data/.
 *
 *   npm run sync -- --events 10           process 10 fresh events
 *   npm run sync -- --events 5 --dry-run  show what would be written
 *
 * Everything it writes is `verification.status: unverified`, which the site
 * renders as "Source pending review". A human still grants `verified` after
 * opening the source. Progress is checkpointed in .cache/sync-state.json, so
 * repeated runs walk the backlog a slice at a time instead of re-crawling.
 */
import fs from "node:fs";
import path from "node:path";
import { stringify } from "yaml";
import { fetchPage } from "./http";
import {
  discoverEvents,
  parseSubmissionDates,
  yearFromDates,
  type DiscoveredEvent,
} from "./discover";
import { awardTypeFor, categoriesFor, generatedSummary } from "./classify";
import { parseGallery, parseProject, mapTechnologies, type GalleryProject, type ProjectDetail } from "./devpost-parse";
import { slugify } from "../../src/lib/utils";
import { loadRaw } from "../lib-load";
import { ENTRIES_DIR, HACKATHONS_DIR, PROJECTS_DIR } from "../../src/lib/paths";
import { CURRENT_YEAR } from "../../src/schemas";

const MAX_GALLERY_PAGES = 25;
const STATE_FILE = path.join(process.cwd(), ".cache", "sync-state.json");

interface State {
  processedEventIds: number[];
  page: number;
}

function loadState(): State {
  if (!fs.existsSync(STATE_FILE)) return { processedEventIds: [], page: 1 };
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, "utf8")) as State;
  } catch {
    return { processedEventIds: [], page: 1 };
  }
}

function saveState(state: State) {
  fs.mkdirSync(path.dirname(STATE_FILE), { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

const arg = (flag: string, fallback: string) => {
  const i = process.argv.indexOf(flag);
  return i > -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
};

async function parseProjectSafe(url: string): Promise<ProjectDetail | null> {
  try {
    const html = await fetchPage(url);
    return parseProject(html);
  } catch (error) {
    console.warn(`    ! Failed to fetch/parse project ${url}: ${error instanceof Error ? error.message : error}`);
    return null;
  }
}

async function buildQueue(state: State, seen: Set<number>, budget: number): Promise<DiscoveredEvent[]> {
  const queue: DiscoveredEvent[] = [];
  while (queue.length < budget) {
    console.log(`Discovering ended events on Devpost API (page ${state.page})...`);
    let events: DiscoveredEvent[] = [];
    try {
      events = await discoverEvents(state.page);
    } catch (error) {
      console.error(`Error discovering events on page ${state.page}: ${error instanceof Error ? error.message : error}`);
      break;
    }
    if (!events.length) break;
    for (const event of events) {
      if (!seen.has(event.id) && queue.length < budget) {
        queue.push(event);
      }
    }
    state.page += 1;
    if (state.page > 500) break;
  }
  return queue;
}

async function main() {
  const eventsCount = Math.max(1, parseInt(arg("--events", "10"), 10) || 10);
  const isDryRun = process.argv.includes("--dry-run");

  console.log(`Starting Devpost winner sync (budget: ${eventsCount} events, dryRun: ${isDryRun})...\n`);

  const raw = loadRaw();
  const knownCategories = new Set((raw.categories as { slug: string }[]).map((c) => c.slug));
  const knownTech = new Set((raw.technologies as { slug: string }[]).map((t) => t.slug));
  const existingProjects = new Set(
    raw.projects.map(({ data }) => String((data as { id: string }).id)),
  );
  const existingHackathons = new Set(
    raw.hackathons.map(({ data }) => String((data as { id: string }).id)),
  );
  const existingEntries = new Set(
    raw.entries.map(
      ({ data }) =>
        `${(data as { project_id: string }).project_id}::${(data as { hackathon_id: string }).hackathon_id}`,
    ),
  );

  const state = loadState();
  const seen = new Set(state.processedEventIds);
  const queue = await buildQueue(state, seen, eventsCount);

  console.log(`\nFound ${queue.length} new event(s) to process.\n`);

  const unknownTech = new Set<string>();
  let hackathonsCreated = 0;
  let projectsCreated = 0;
  let entriesCreated = 0;
  let projectsSkipped = 0;

  for (let idx = 0; idx < queue.length; idx++) {
    const event = queue[idx];
    const submissionWindow = parseSubmissionDates(event.submissionDates);
    const eventYear =
      (submissionWindow.startDate ? Number(submissionWindow.startDate.slice(0, 4)) : null) ??
      yearFromDates(event.submissionDates) ??
      CURRENT_YEAR;
    const hackathonYear = Math.max(1990, Math.min(CURRENT_YEAR + 1, eventYear));
    const hackathonId = slugify(event.title) || `devpost-${event.id}`;
    // Devpost's ?filter=winner serves a page without the winner ribbons parseGallery
    // needs, so it silently matched nothing. The plain gallery sorts winners first.
    const galleryUrl = `${event.url.replace(/\/$/, "")}/project-gallery`;

    console.log(`[${idx + 1}/${queue.length}] Processing: ${event.title} (${event.url})`);

    const gallery: GalleryProject[] = [];
    try {
      // Winners sort first, so walk pages until one yields none. Without this a
      // large event silently lost every winner past the first page.
      const seen = new Set<string>();
      for (let page = 1; page <= MAX_GALLERY_PAGES; page++) {
        const pageUrl = page === 1 ? galleryUrl : `${galleryUrl}?page=${page}`;
        const html = await fetchPage(pageUrl);
        const found = parseGallery(html).filter((item) => !seen.has(item.slug));
        for (const item of found) seen.add(item.slug);
        gallery.push(...found);
        if (!found.length || !/rel="next"/.test(html)) break;
      }
    } catch (error) {
      console.warn(`  ! Could not fetch winner gallery (${galleryUrl}): ${error instanceof Error ? error.message : error}`);
      state.processedEventIds.push(event.id);
      if (!isDryRun) saveState(state);
      continue;
    }

    if (!gallery.length) {
      console.log(`  - No winner ribbons found on gallery. Marking event done.`);
      state.processedEventIds.push(event.id);
      if (!isDryRun) saveState(state);
      continue;
    }

    console.log(`  Found ${gallery.length} winning project(s)`);

    // Ensure hackathon record exists
    if (!existingHackathons.has(hackathonId)) {
      const hackathonData = {
        id: hackathonId,
        name: event.title,
        slug: hackathonId,
        organizer: [],
        year: hackathonYear,
        start_date: submissionWindow.startDate,
        end_date: submissionWindow.endDate,
        sources: [event.url, galleryUrl],
        website_url: event.url,
        platform: "devpost" as const,
        participant_count: event.registrations && event.registrations > 0 ? event.registrations : null,
        prize_pool: event.prizeAmount && event.prizeAmount > 0 ? event.prizeAmount : null,
        currency: event.prizeAmount && event.prizeAmount > 0 ? "USD" : null,
        description: `Devpost hackathon: ${event.title}. Imported automatically.`,
      };

      if (!isDryRun) {
        const yearDir = path.join(HACKATHONS_DIR, String(hackathonYear));
        fs.mkdirSync(yearDir, { recursive: true });
        fs.writeFileSync(
          path.join(yearDir, `${hackathonId}.yaml`),
          stringify(hackathonData, { lineWidth: 100 }),
        );
      }
      existingHackathons.add(hackathonId);
      hackathonsCreated++;
      console.log(`  + Hackathon: ${hackathonId} (${hackathonYear})`);
    }

    for (const project of gallery) {
      const projectId = slugify(project.name || project.slug) || `project-${project.slug}`;
      const entryPair = `${projectId}::${hackathonId}`;

      const detail = await parseProjectSafe(project.url);
      const projectAwards = detail?.awards && detail.awards.length > 0
        ? detail.awards
        : [{ hackathonName: event.title, hackathonUrl: event.url, title: "Winner" }];

      const primaryAwardTitle = projectAwards[0]?.title || "Winner";
      const techResult = mapTechnologies(detail?.technologies || [], knownTech);
      for (const t of techResult.unknown) unknownTech.add(t);

      const combinedText = `${project.name} ${project.tagline} ${event.themes.join(" ")}`;
      let categories = categoriesFor(combinedText, knownCategories);
      if (!categories.length) {
        categories = knownCategories.has("other") ? ["other"] : ["artificial-intelligence"];
      }

      // Write Project if not already existing
      if (!existingProjects.has(projectId)) {
        const summaryText = generatedSummary({
          name: project.name || projectId,
          awardTitle: primaryAwardTitle,
          hackathonName: event.title,
          year: hackathonYear,
        });

        const projectData = {
          id: projectId,
          name: project.name || projectId,
          slug: projectId,
          tagline: (project.tagline || `${project.name} - Hackathon winning project`).slice(0, 160),
          summary: summaryText,
          website_url: detail?.links.website ?? null,
          github_url: detail?.links.github ?? null,
          demo_url: null,
          video_url: detail?.links.video ?? null,
          image_url: detail?.image ?? project.image ?? null,
          categories,
          technologies: techResult.mapped,
          builders: project.builders.map((name) => ({ name })),
        };

        if (!isDryRun) {
          fs.mkdirSync(PROJECTS_DIR, { recursive: true });
          fs.writeFileSync(
            path.join(PROJECTS_DIR, `${projectId}.yaml`),
            stringify(projectData, { lineWidth: 100 }),
          );
        }
        existingProjects.add(projectId);
        projectsCreated++;
        console.log(`    + Project: ${projectId}`);
      } else {
        projectsSkipped++;
      }

      // Write Entry if not already existing
      if (!existingEntries.has(entryPair)) {
        const entryData = {
          id: `${projectId}-${hackathonId}`,
          project_id: projectId,
          hackathon_id: hackathonId,
          submission_url: project.url,
          source: {
            platform: "devpost" as const,
            url: project.url,
          },
          awards: projectAwards.map((a) => ({
            type: awardTypeFor(a.title),
            title: a.title || "Winner",
          })),
          verification: {
            status: "unverified" as const,
            checked_at: new Date().toISOString().slice(0, 10),
            notes: "Imported automatically via Devpost discovery sync. A maintainer must confirm the source.",
          },
        };

        if (!isDryRun) {
          fs.mkdirSync(ENTRIES_DIR, { recursive: true });
          fs.writeFileSync(
            path.join(ENTRIES_DIR, `${projectId}-${hackathonId}.yaml`),
            stringify(entryData, { lineWidth: 100 }),
          );
        }
        existingEntries.add(entryPair);
        entriesCreated++;
        console.log(`    + Entry: ${projectId}-${hackathonId}`);
      }
    }

    state.processedEventIds.push(event.id);
    if (!isDryRun) {
      saveState(state);
    }
  }

  console.log("\n================ Sync Complete ================");
  console.log(`Events processed: ${queue.length}`);
  console.log(`Hackathons created: ${hackathonsCreated}`);
  console.log(`Projects created: ${projectsCreated} (${projectsSkipped} existing skipped)`);
  console.log(`Entries created: ${entriesCreated}`);
  if (unknownTech.size > 0) {
    console.log(`\nUnknown technologies observed (${unknownTech.size}):`);
    console.log(`  ${[...unknownTech].slice(0, 20).join(", ")}${unknownTech.size > 20 ? "..." : ""}`);
  }
  if (isDryRun) {
    console.log("\n[DRY RUN] No files were written and sync state was not modified.");
  }
}

main().catch((error) => {
  console.error("\nSync error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
