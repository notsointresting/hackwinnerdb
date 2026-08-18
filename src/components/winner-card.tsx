import Link from "next/link";
import type { WinnerRecord } from "@/types";
import { AwardBadge, Chip, VerifiedBadge } from "./ui";

const MAX_TECH = 4;

export function WinnerCard({
  winner,
  labels,
}: {
  winner: WinnerRecord;
  labels: { categories: Map<string, string>; technologies: Map<string, string> };
}) {
  const { project, hackathon, entry, primaryAward } = winner;
  const tech = project.technologies.slice(0, MAX_TECH);
  const extra = project.technologies.length - tech.length;

  return (
    <article className="group relative flex flex-col gap-3 rounded-lg border border-line bg-bg p-4 transition-colors hover:border-line-strong">
      <AwardBadge label={primaryAward.title} className="self-start" />
      <div>
        <h3 className="text-base font-semibold tracking-tight">
          <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
            {project.name}
          </Link>
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{project.tagline}</p>
      </div>
      <p className="text-sm text-fg-muted">
        {hackathon.name} · {hackathon.year}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {project.categories.slice(0, 2).map((slug) => (
          <Chip key={slug}>{labels.categories.get(slug) ?? slug}</Chip>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {tech.map((slug) => (
          <Chip key={slug} className="font-mono">
            {labels.technologies.get(slug) ?? slug}
          </Chip>
        ))}
        {extra > 0 ? <Chip className="font-mono">+{extra}</Chip> : null}
      </div>
      <div className="mt-auto flex items-center justify-between pt-1">
        {entry.verification.status === "verified" ? (
          <VerifiedBadge />
        ) : (
          <span className="text-[11px] text-fg-muted">Source pending review</span>
        )}
        <span aria-hidden="true" className="text-fg-muted transition-transform group-hover:translate-x-0.5">
          →
        </span>
      </div>
    </article>
  );
}

export function WinnerRow({
  winner,
  labels,
}: {
  winner: WinnerRecord;
  labels: { categories: Map<string, string>; technologies: Map<string, string> };
}) {
  const { project, hackathon, entry, primaryAward } = winner;
  return (
    <article className="group relative grid gap-2 border-b border-line px-1 py-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-medium">
            <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
              {project.name}
            </Link>
          </h3>
          <AwardBadge label={primaryAward.title} />
          {entry.verification.status === "verified" ? <VerifiedBadge /> : null}
        </div>
        <p className="mt-1 truncate text-sm text-fg-muted">{project.tagline}</p>
        <p className="mt-1 text-xs text-fg-muted">
          {hackathon.name} · {hackathon.year} ·{" "}
          {project.technologies
            .slice(0, 4)
            .map((t) => labels.technologies.get(t) ?? t)
            .join(", ")}
        </p>
      </div>
      <span aria-hidden="true" className="hidden text-fg-muted sm:block">
        →
      </span>
    </article>
  );
}
