import type { MetadataRoute } from "next";
import { getDataset } from "@/lib/repository";
import { SITE } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
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
    ...staticPaths.map((path) => ({ url: url(path), changeFrequency: "weekly" as const })),
    ...dataset.projects.map((p) => ({ url: url(`/projects/${p.slug}`) })),
    ...dataset.hackathons.map((h) => ({ url: url(`/hackathons/${h.slug}`) })),
    ...[...usedTech].map((slug) => ({ url: url(`/technology/${slug}`) })),
    ...[...usedCats].map((slug) => ({ url: url(`/category/${slug}`) })),
    ...[...years].map((year) => ({ url: url(`/year/${year}`) })),
  ];
}
