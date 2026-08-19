import Link from "next/link";
import { Container } from "./ui";
import { SITE } from "@/lib/site";

const GROUPS = [
  {
    title: "Explore",
    links: [
      { href: "/projects", label: "Winning projects" },
      { href: "/hackathons", label: "Hackathons" },
      { href: "/technologies", label: "Technologies" },
      { href: "/categories", label: "Categories" },
    ],
  },
  {
    title: "Project",
    links: [
      { href: "/about", label: "About" },
      { href: "/methodology", label: "Methodology" },
      { href: "/contribute", label: "Contribute" },
      { href: "/dataset", label: "Download dataset" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="relative mt-24 border-t border-line/60 bg-bg-subtle/50 backdrop-blur-xl">
      <Container className="grid gap-10 py-12 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <Link href="/" className="hw-display inline-block text-2xl tracking-tight text-fg hover:text-accent">
            Hack<span className="text-accent">Winner</span>DB
          </Link>
          <p className="mt-2.5 max-w-sm text-sm leading-relaxed text-fg-muted">{SITE.tagline}</p>
          <div className="mt-6 flex flex-wrap items-center gap-3 text-xs text-fg-muted/80">
            <span>Code under <span className="font-mono text-accent">MIT</span></span>
            <span>·</span>
            <span>Dataset under <span className="font-mono text-accent">CC BY 4.0</span></span>
          </div>
        </div>
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="hw-eyebrow text-[0.65rem] font-bold text-fg-muted">{group.title}</h2>
            <ul className="mt-3.5 space-y-2.5">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-fg-muted transition-colors duration-200 hover:text-accent"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              {group.title === "Project" ? (
                <li>
                  <a
                    href={`${SITE.repo}/graphs/contributors`}
                    target="_blank"
                    rel="noreferrer"
                    className="group inline-flex items-center gap-1 text-sm text-fg-muted transition-colors duration-200 hover:text-accent"
                  >
                    <span>Contributors</span>
                    <span
                      aria-hidden="true"
                      className="transition-transform duration-300 ease-out motion-safe:group-hover:translate-x-1"
                    >
                      →
                    </span>
                  </a>
                </li>
              ) : null}
            </ul>
          </div>
        ))}
      </Container>
    </footer>
  );
}
