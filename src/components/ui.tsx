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
    "inline-flex items-center gap-1 rounded-md border border-line bg-bg-subtle px-2 py-0.5 text-xs text-fg-muted",
    href && "hover:border-line-strong hover:text-fg transition-colors",
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
        "inline-flex items-center gap-1.5 rounded-md border border-accent-line bg-accent-bg px-2 py-0.5 text-[11px] font-medium uppercase tracking-wide text-accent",
        className,
      )}
    >
      {label}
    </span>
  );
}

export function VerifiedBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md bg-verified-bg px-1.5 py-0.5 text-[11px] font-medium text-verified",
        className,
      )}
    >
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
    <div className="mb-4 flex items-baseline justify-between gap-4 border-b border-line pb-3">
      <div>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        {children ? <p className="mt-1 text-sm text-fg-muted">{children}</p> : null}
      </div>
      {href ? (
        <Link href={href} className="shrink-0 text-sm text-fg-muted hover:text-fg">
          {linkLabel} →
        </Link>
      ) : null}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: ReactNode }) {
  return (
    <div className="rounded-lg border border-dashed border-line-strong p-10 text-center">
      <p className="font-medium">{title}</p>
      {hint ? <p className="mt-2 text-sm text-fg-muted">{hint}</p> : null}
    </div>
  );
}

export function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-mono text-2xl font-semibold tracking-tight sm:text-3xl">{value}</div>
      <div className="mt-1 text-sm text-fg-muted">{label}</div>
    </div>
  );
}
