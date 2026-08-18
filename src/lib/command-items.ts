import type { CommandItem } from "@/components/command-palette";
import type { Dataset } from "@/types";
import { countBy } from "./queries";

/** Compact index shipped to the client for the ⌘K palette. */
export function buildCommandItems(dataset: Dataset): CommandItem[] {
  const techCounts = countBy(dataset.projects, (p) => p.technologies);
  const catCounts = countBy(dataset.projects, (p) => p.categories);

  return [
    ...dataset.projects.map((p) => ({
      id: `project:${p.id}`,
      title: p.name,
      subtitle: p.tagline,
      kind: "Project" as const,
      href: `/projects/${p.slug}`,
    })),
    ...dataset.hackathons.map((h) => ({
      id: `hackathon:${h.id}`,
      title: h.name,
      subtitle: `${h.year} · ${h.organizer.join(", ") || "Hackathon"}`,
      kind: "Hackathon" as const,
      href: `/hackathons/${h.slug}`,
    })),
    ...dataset.technologies
      .filter((t) => techCounts.has(t.slug))
      .map((t) => ({
        id: `tech:${t.slug}`,
        title: t.name,
        subtitle: `${techCounts.get(t.slug)} winning projects`,
        kind: "Technology" as const,
        href: `/technology/${t.slug}`,
      })),
    ...dataset.categories
      .filter((c) => catCounts.has(c.slug))
      .map((c) => ({
        id: `category:${c.slug}`,
        title: c.name,
        subtitle: `${catCounts.get(c.slug)} winning projects`,
        kind: "Category" as const,
        href: `/category/${c.slug}`,
      })),
  ];
}
