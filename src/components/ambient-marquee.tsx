"use client";

import Link from "next/link";

interface MarqueeItem {
  label: string;
  count?: number;
  href: string;
  badge?: string;
}

export function AmbientMarquee({ items }: { items: MarqueeItem[] }) {
  if (!items.length) return null;
  const doubled = [...items, ...items];

  return (
    <div className="relative w-full overflow-hidden py-4 select-none [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)]">
      <div className="flex w-max animate-marquee gap-3 motion-reduce:animate-none">
        {doubled.map((item, idx) => (
          <Link
            key={`${item.label}-${idx}`}
            href={item.href}
            className="group inline-flex items-center gap-2 rounded-full border border-line/70 bg-bg-subtle/60 px-4 py-1.5 text-xs text-fg-muted backdrop-blur-sm transition-all duration-300 hover:border-accent-line hover:bg-bg-subtle hover:text-fg hover:shadow-[0_0_15px_rgba(185,139,255,0.2)]"
          >
            {item.badge ? (
              <span className="rounded-full bg-accent-bg px-2 py-0.5 font-mono text-[10px] font-semibold text-accent">
                {item.badge}
              </span>
            ) : null}
            <span className="font-medium text-fg group-hover:text-accent transition-colors">
              {item.label}
            </span>
            {item.count !== undefined ? (
              <span className="font-mono text-[11px] text-fg-muted">
                {item.count} wins
              </span>
            ) : null}
          </Link>
        ))}
      </div>
    </div>
  );
}
