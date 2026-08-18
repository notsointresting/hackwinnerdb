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
    <footer className="mt-20 border-t border-line bg-bg-subtle">
      <Container className="grid gap-8 py-10 sm:grid-cols-2 md:grid-cols-4">
        <div className="sm:col-span-2 md:col-span-2">
          <p className="hw-display text-2xl">
            Hack<span className="text-accent">Winner</span>DB
          </p>
          <p className="mt-2 max-w-sm text-sm text-fg-muted">{SITE.tagline}</p>
          <p className="mt-4 text-xs text-fg-muted">
            Code under MIT. Dataset under CC BY 4.0.
          </p>
        </div>
        {GROUPS.map((group) => (
          <div key={group.title}>
            <h2 className="hw-eyebrow text-[0.65rem] text-fg-muted">{group.title}</h2>
            <ul className="mt-3 space-y-2">
              {group.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-fg-muted hover:text-fg">
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
                    className="text-sm text-fg-muted hover:text-fg"
                  >
                    Contributors →
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
