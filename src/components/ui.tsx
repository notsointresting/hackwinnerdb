import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ComponentProps, ReactNode } from "react";

export function Container({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)}>{children}</div>;
}

export function Chip({
  href,
  children,
  className,
  ...rest
}: { href?: string; children: ReactNode; className?: string } & Partial<ComponentProps<"span">>) {
  const classes = cn(
    "inline-flex items-center gap-1.5 rounded-full border border-line bg-bg-subtle/80 px-3 py-1 text-xs text-fg-muted backdrop-blur-sm transition-all duration-300 ease-out",
    href && "hover:border-accent/40 hover:bg-accent-bg hover:text-accent motion-safe:hover:-translate-y-0.5 hover:shadow-[0_0_12px_rgba(185,139,255,0.15)]",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <span className={classes} {...rest}>
      {children}
    </span>
  );
}

export function AwardBadge({ label, className }: { label: string; className?: string }) {
  return (
    <span
      className={cn(
        "hw-eyebrow inline-flex items-center gap-1.5 rounded-full border border-accent-line/70 bg-accent-bg/80 px-2.5 py-1 text-[0.62rem] font-semibold text-accent shadow-[0_0_12px_rgba(185,139,255,0.1)] backdrop-blur-md transition-all duration-300 hover:border-accent",
        className,
      )}
    >
      <span className="text-[0.7rem]" aria-hidden="true">🏆</span>
      <span className="truncate">{label}</span>
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border border-emerald-500/20 bg-verified-bg px-2 py-0.5 text-[11px] font-medium text-verified backdrop-blur-sm transition-colors duration-200",
        className,
      )}
    >
      <span className="hw-live-dot" aria-hidden="true" />
      <svg aria-hidden="true" viewBox="0 0 16 16" className="size-3 fill-current">
        <path d="M6.5 11.2 3.3 8l1.1-1.1 2.1 2.1 5-5L12.7 5z" />
      </svg>
      Source verified
    </span>
  );
}

export function SectionHeading({
  title,
  href,
  linkLabel = "View all",
  children,
}: {
  title: string;
  href?: string;
  linkLabel?: string;
  children?: ReactNode;
}) {
  return (
    <div className="mb-6 flex items-baseline justify-between gap-4 border-b border-line/60 pb-3">
      <div>
        <h2 className="hw-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
        {children ? <p className="mt-1 text-sm text-fg-muted">{children}</p> : null}
      </div>
      {href ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm text-fg-muted transition-colors duration-200 hover:text-accent"
        >
          <span>{linkLabel}</span>
          <span
            aria-hidden="true"
            className="transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
          >
            →
          </span>
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-dashed border-line-strong/80 bg-bg-subtle/40 p-12 text-center backdrop-blur-sm">
      <div className="mx-auto mb-3 flex size-10 items-center justify-center rounded-full bg-accent-bg text-accent">
        <svg aria-hidden="true" viewBox="0 0 16 16" className="size-5 fill-current">
          <path d="M7 2a5 5 0 1 0 3.1 8.9l3 3 1.1-1.1-3-3A5 5 0 0 0 7 2m0 1.5a3.5 3.5 0 1 1 0 7 3.5 3.5 0 0 1 0-7" />
        </svg>
      </div>
      <p className="font-medium text-fg">{title}</p>
      {hint ? <p className="mt-2 text-sm text-fg-muted">{hint}</p> : null}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="relative overflow-hidden rounded-xl border border-line/60 bg-bg-subtle/50 p-5 backdrop-blur-sm transition-all duration-300 hover:border-accent-line hover:shadow-[0_0_20px_rgba(123,63,242,0.12)]">
      <div className="hw-display text-4xl font-bold tracking-tight text-accent sm:text-5xl">{value}</div>
      <div className="hw-eyebrow mt-2 text-[0.65rem] text-fg-muted">{label}</div>
    </div>
  );
}
