import Link from "next/link";
import type { WinnerRecord } from "@/types";
import { AwardBadge, Chip, VerifiedBadge } from "./ui";
import { ProjectImage } from "./project-image";

const MAX_TECH = 4;

type Labels = { categories: Map<string, string>; technologies: Map<string, string> };

export function WinnerCard({
  winner,
  labels,
  priority = false,
}: {
  winner: WinnerRecord;
  labels: Labels;
  priority?: boolean;
}) {
  const { project, hackathon, entry, primaryAward } = winner;
  const tech = project.technologies.slice(0, MAX_TECH);
  const extra = project.technologies.length - tech.length;

  return (
    <article className="hw-reveal group relative flex flex-col overflow-hidden rounded-2xl border border-line bg-bg-subtle transition-[border-color,box-shadow,transform] duration-300 ease-out hover:border-accent-line hover:shadow-[0_0_0_1px_var(--accent-border),0_18px_40px_-24px_var(--glow-a)] motion-safe:hover:-translate-y-1">
      <div className="relative p-2 pb-0">
        <ProjectImage src={project.image_url} name={project.name} priority={priority} />
        <AwardBadge
          label={primaryAward.title}
          className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate bg-bg/90 backdrop-blur"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div>
          <h3 className="hw-display text-xl">
            <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
              {project.name}
            </Link>
          </h3>
          <p className="mt-1 line-clamp-2 text-sm text-fg-muted">{project.tagline}</p>
        </div>

        <p className="text-sm text-fg-muted">
          {hackathon.name} · <span className="font-mono">{hackathon.year}</span>
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

        <div className="mt-auto flex items-center justify-between border-t border-line pt-3">
          {entry.verification.status === "verified" ? (
            <VerifiedBadge />
          ) : (
            <span className="text-[11px] text-fg-muted">Source pending review</span>
          )}
          <span
            aria-hidden="true"
            className="text-fg-muted transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
          >
            →
          </span>
        </div>
      </div>
    </article>
  );
}

export function WinnerRow({ winner, labels }: { winner: WinnerRecord; labels: Labels }) {
  const { project, hackathon, entry, primaryAward } = winner;
  return (
    <article className="group relative flex items-center gap-4 border-b border-line px-1 py-3 transition-colors hover:bg-bg-subtle">
      <div className="hidden w-28 shrink-0 sm:block">
        <ProjectImage src={project.image_url} name={project.name} sizes="112px" />
      </div>
      <div className="min-w-0 flex-1">
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
        <p className="mt-1 truncate text-xs text-fg-muted">
          {hackathon.name} · {hackathon.year} ·{" "}
          {project.technologies
            .slice(0, 4)
            .map((t) => labels.technologies.get(t) ?? t)
            .join(", ")}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="hidden shrink-0 text-fg-muted transition-transform duration-300 motion-safe:group-hover:translate-x-1 sm:block"
      >
        →
      </span>
    </article>
  );
}
