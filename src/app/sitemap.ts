import type { MetadataRoute } from "next";
import { getDataset } from "@/lib/repository";
import { SITE } from "@/lib/site";

// Google/Next cap a single sitemap at 50,000 URLs — chunk to stay correct as the
// dataset grows toward 1M+ entries instead of silently truncating.
const CHUNK_SIZE = 45000;

function allUrls(): string[] {
  const dataset = getDataset();
  const url = (path: string) => `${SITE.url}${path}`;
  const usedTech = new Set(dataset.projects.flatMap((p) => p.technologies));
  const usedCats = new Set(dataset.projects.flatMap((p) => p.categories));
  const years = new Set(dataset.hackathons.map((h) => h.year));

  const staticPaths = [
    "/",
    "/projects",
    "/hackathons",
    "/technologies",
    "/categories",
    "/contribute",
    "/methodology",
    "/about",
    "/dataset",
  ];

  return [
    ...staticPaths.map(url),
    ...[...usedTech].map((slug) => url(`/technology/${slug}`)),
    ...[...usedCats].map((slug) => url(`/category/${slug}`)),
    ...[...years].map((year) => url(`/year/${year}`)),
    ...dataset.hackathons.map((h) => url(`/hackathons/${h.slug}`)),
    ...dataset.projects.map((p) => url(`/projects/${p.slug}`)),
  ];
}

export async function generateSitemaps() {
  const total = allUrls().length;
  const count = Math.max(1, Math.ceil(total / CHUNK_SIZE));
  return Array.from({ length: count }, (_, id) => ({ id }));
}

export default function sitemap({ id }: { id: number }): MetadataRoute.Sitemap {
  const urls = allUrls();
  const chunk = urls.slice(id * CHUNK_SIZE, (id + 1) * CHUNK_SIZE);
  return chunk.map((entry) => ({ url: entry, changeFrequency: "weekly" as const }));
}
