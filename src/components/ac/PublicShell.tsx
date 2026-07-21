import { Link } from "@tanstack/react-router";
import { Github, Menu } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ProductLogo } from "./ProductLogo";
import { ThemeToggle } from "./ThemeToggle";

const NAV = [
  { to: "/#how", label: "How it works" },
  { to: "/#architecture", label: "Architecture" },
  { to: "/#security", label: "Security" },
  { to: "/docs/install", label: "Install" },
];

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={
        "sticky top-0 z-40 w-full border-b transition-colors " +
        (scrolled
          ? "border-border bg-canvas/85 backdrop-blur"
          : "border-transparent bg-transparent")
      }
    >
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <ProductLogo />
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV.map((n) => (
            <a
              key={n.to}
              href={n.to}
              className="rounded-md px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-surface-strong hover:text-foreground"
            >
              {n.label}
            </a>
          ))}
          <a
            href="https://github.com"
            aria-label="Repository on GitHub"
            className="ml-1 rounded-md p-2 text-muted-foreground hover:bg-surface-strong hover:text-foreground"
          >
            <Github className="h-4 w-4" />
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/demo">View demo</Link>
          </Button>
          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link to="/app/compilations/new">Compile a requirement</Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden" aria-label="Open menu">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle>
                  <ProductLogo />
                </SheetTitle>
              </SheetHeader>
              <nav className="mt-4 flex flex-col gap-1" aria-label="Mobile">
                {NAV.map((n) => (
                  <a
                    key={n.to}
                    href={n.to}
                    className="rounded-md px-3 py-2 text-sm hover:bg-surface-strong"
                  >
                    {n.label}
                  </a>
                ))}
                <Link to="/demo" className="rounded-md px-3 py-2 text-sm hover:bg-surface-strong">
                  Live demo
                </Link>
                <Link to="/app" className="rounded-md px-3 py-2 text-sm hover:bg-surface-strong">
                  Open dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="mt-24 border-t border-border">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:grid-cols-2 sm:px-6 md:grid-cols-4">
        <div>
          <ProductLogo />
          <p className="mt-3 max-w-xs text-sm text-muted-foreground">
            A pre-implementation contract compiler for coding agents.
          </p>
        </div>
        <FooterCol
          title="Product"
          links={[
            ["Live demo", "/demo"],
            ["Dashboard", "/app"],
            ["New compilation", "/app/compilations/new"],
          ]}
        />
        <FooterCol
          title="Docs"
          links={[
            ["Install plugin", "/docs/install"],
            ["Privacy", "/privacy"],
          ]}
        />
        <FooterCol
          title="Project"
          links={[
            ["OpenAI Build Week", "#"],
            ["GitHub", "https://github.com"],
          ]}
        />
      </div>
      <div className="border-t border-border">
        <p className="mx-auto max-w-7xl px-4 py-4 text-xs text-muted-foreground sm:px-6">
          Hackathon prototype — not a production specification authority.
        </p>
      </div>
    </footer>
  );
}

function FooterCol({ title, links }: { title: string; links: [string, string][] }) {
  return (
    <div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
      <ul className="mt-3 space-y-2 text-sm">
        {links.map(([label, href]) => (
          <li key={href}>
            {href.startsWith("/") ? (
              <Link to={href} className="text-foreground/85 hover:text-foreground">
                {label}
              </Link>
            ) : (
              <a href={href} className="text-foreground/85 hover:text-foreground">
                {label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
