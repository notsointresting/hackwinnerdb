import Link from "next/link";
import type { WinnerRecord } from "@/types";
import { AwardBadge, Chip, VerifiedBadge } from "./ui";
import { ProjectImage } from "./project-image";
import { InteractiveSpotlight } from "./interactive-spotlight";

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
    <InteractiveSpotlight className="hw-reveal group rounded-2xl border border-line/70 bg-bg-subtle/70 backdrop-blur-md transition-all duration-300 ease-out hover:border-accent-line hover:bg-bg-subtle hover:shadow-[0_0_0_1px_rgba(185,139,255,0.25),0_20px_40px_-20px_rgba(123,63,242,0.35)] motion-safe:hover:-translate-y-1.5">
      <article className="relative flex h-full flex-col overflow-hidden">
        <div className="relative p-2 pb-0">
          <ProjectImage src={project.image_url} name={project.name} priority={priority} />
          <AwardBadge
            label={primaryAward.title}
            className="absolute left-4 top-4 max-w-[calc(100%-2rem)] truncate bg-bg/90 backdrop-blur-md"
          />
        </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <h3 className="hw-display text-xl font-bold tracking-tight text-fg transition-colors duration-200 group-hover:text-accent">
            <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
              {project.name}
            </Link>
          </h3>
          <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-fg-muted">{project.tagline}</p>
        </div>

        <p className="text-xs font-medium text-fg-muted/90">
          {hackathon.name} · <span className="font-mono text-accent/90">{hackathon.year}</span>
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

        <div className="mt-auto flex items-center justify-between border-t border-line/60 pt-3.5">
          {entry.verification.status === "verified" ? (
            <VerifiedBadge />
          ) : (
            <span className="text-[11px] text-fg-muted">Source pending review</span>
          )}
          <span
            aria-hidden="true"
            className="text-fg-muted transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1.5 motion-safe:group-hover:text-accent"
          >
            →
          </span>
        </div>
      </div>
      </article>
    </InteractiveSpotlight>
  );
}

export function WinnerRow({ winner, labels }: { winner: WinnerRecord; labels: Labels }) {
  const { project, hackathon, entry, primaryAward } = winner;
  return (
    <article className="group relative flex items-center gap-4 border-b border-line/60 px-2 py-3.5 transition-all duration-200 hover:bg-bg-subtle/80">
      <div className="hidden w-28 shrink-0 sm:block">
        <ProjectImage src={project.image_url} name={project.name} sizes="112px" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold text-fg transition-colors group-hover:text-accent">
            <Link href={`/projects/${project.slug}`} className="after:absolute after:inset-0">
              {project.name}
            </Link>
          </h3>
          <AwardBadge label={primaryAward.title} />
          {entry.verification.status === "verified" ? <VerifiedBadge /> : null}
        </div>
        <p className="mt-1 truncate text-sm text-fg-muted">{project.tagline}</p>
        <p className="mt-1 truncate text-xs text-fg-muted/80">
          {hackathon.name} · {hackathon.year} ·{" "}
          {project.technologies
            .slice(0, 4)
            .map((t) => labels.technologies.get(t) ?? t)
            .join(", ")}
        </p>
      </div>
      <span
        aria-hidden="true"
        className="hidden shrink-0 text-fg-muted transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1.5 motion-safe:group-hover:text-accent sm:block"
      >
        →
      </span>
    </article>
  );
}
