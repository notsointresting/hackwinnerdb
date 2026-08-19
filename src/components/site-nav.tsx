import Link from "next/link";
import { Container } from "./ui";
import { CommandPalette } from "./command-palette";
import { MobileNav } from "./mobile-nav";
import { buildCommandItems } from "@/lib/command-items";
import { getDataset } from "@/lib/repository";
import { SITE } from "@/lib/site";
import { NAV_LINKS } from "@/lib/nav";

export function SiteNav() {
  const items = buildCommandItems(getDataset());
  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-bg/75 backdrop-blur-xl transition-colors duration-300">
      <Container className="flex h-15 items-center gap-6">
        <Link href="/" className="group flex items-center gap-2">
          <span className="hw-display text-xl tracking-tight text-fg transition-transform duration-300 motion-safe:group-hover:scale-[1.02]">
            Hack<span className="text-accent">Winner</span>DB
          </span>
          <span className="rounded-full border border-accent-line/60 bg-accent-bg/80 px-2 py-0.5 font-mono text-[10px] font-semibold text-accent">
            v0.1
          </span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="relative rounded-lg px-3 py-1.5 text-sm font-medium text-fg-muted transition-all duration-200 hover:bg-bg-subtle hover:text-fg motion-safe:hover:-translate-y-0.5"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-2.5">
          <CommandPalette items={items} />
          <a
            href={SITE.repo}
            target="_blank"
            rel="noreferrer"
            className="hidden items-center gap-2 rounded-xl border border-line/80 bg-bg-subtle/50 px-3 py-1.5 text-sm font-medium text-fg-muted backdrop-blur-sm transition-all duration-200 hover:border-accent-line hover:bg-bg-subtle hover:text-fg motion-safe:hover:-translate-y-0.5 sm:inline-flex"
          >
            <svg aria-hidden="true" viewBox="0 0 16 16" className="size-4 fill-current">
              <path d="M8 0C3.58 0 0 3.58 0 8a8 8 0 0 0 5.47 7.59c.4.07.55-.17.55-.38l-.01-1.33c-2.23.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.06-.49.06-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.87 2.34.67.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48l-.01 2.2c0 .21.14.46.55.38A8 8 0 0 0 16 8c0-4.42-3.58-8-8-8" />
            </svg>
            <span>GitHub</span>
            <span className="sr-only">(opens in a new tab)</span>
          </a>
          <MobileNav />
        </div>
      </Container>
    </header>
  );
}
