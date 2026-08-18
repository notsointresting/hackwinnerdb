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
import { fetchPage, decode, stripTags } from "./http";
import { slugify } from "../../src/lib/utils";
import { loadRaw } from "../lib-load";

const STAGING = path.join(process.cwd(), "data", "_staging");

interface GalleryProject {
  slug: string;
  url: string;
  name: string;
  tagline: string;
  image: string | null;
  builders: string[];
}

function parseGallery(html: string): GalleryProject[] {
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
    const image = block.match(/src="(https:\/\/[^"]*software_thumbnail_photos[^"]*)"/)?.[1] ?? null;
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
    });
  }
  return projects;
}

interface ProjectDetail {
  awards: { hackathonUrl: string; hackathonName: string; title: string }[];
  technologies: string[];
  links: { website: string | null; github: string | null; video: string | null };
}

function parseProject(html: string): ProjectDetail {
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

  return { awards, technologies, links: { website, github, video } };
}

/** Maps a Devpost "built with" tag onto a canonical slug, or reports it as unknown. */
function mapTechnologies(tags: string[], known: Set<string>) {
  const mapped: string[] = [];
  const unknown: string[] = [];
  for (const tag of tags) {
    const slug = slugify(tag);
    if (known.has(slug)) mapped.push(slug);
    else unknown.push(slug);
  }
  return { mapped: [...new Set(mapped)], unknown: [...new Set(unknown)] };
}

async function main() {
  const galleryUrl = process.argv[2];
  if (!galleryUrl || !galleryUrl.includes("devpost.com")) {
    console.error("Usage: tsx scripts/import/devpost.ts <devpost project-gallery URL>");
    console.error("Tip: append ?filter=winner so only awarded projects are considered.");
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

  console.log(`Fetching gallery: ${galleryUrl}`);
  const gallery = parseGallery(await fetchPage(galleryUrl));
  console.log(`  ${gallery.length} winning project(s) found\n`);
  if (!gallery.length) {
    console.error("No winner ribbons on that page. Is ?filter=winner set, and are winners public?");
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

    if (existingProjects.has(id)) {
      console.log(`  = ${id} (already in data/projects, skipped)`);
      skipped++;
      continue;
    }

    fs.writeFileSync(
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
    console.log(`  + ${id} (${detail.awards.length} award record(s))`);
    written++;
  }

  for (const [id, hackathon] of hackathons) {
    const file = path.join(STAGING, `hackathon-${id}.yaml`);
    if (fs.existsSync(file)) continue;
    fs.writeFileSync(
      file,
      stringify(
        {
          id,
          name: hackathon.name,
          slug: id,
          organizer: [],
          year: "TODO: the year the hackathon ran",
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
