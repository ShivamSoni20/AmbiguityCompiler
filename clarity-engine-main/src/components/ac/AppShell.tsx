import { Link, Outlet, useRouterState } from "@tanstack/react-router";
import {
  GitBranch,
  History,
  LayoutGrid,
  PlugZap,
  Plus,
  Settings,
  BookOpen,
  Menu,
} from "lucide-react";
import { ProductLogo } from "./ProductLogo";
import { ThemeToggle } from "./ThemeToggle";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const NAV = [
  { to: "/app", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/app/compilations/new", label: "New compilation", icon: Plus },
  { to: "/app/history", label: "History", icon: History },
  { to: "/docs/install", label: "Install plugin", icon: PlugZap },
  { to: "/privacy", label: "Documentation", icon: BookOpen },
];

const MOBILE_NAV = [
  { to: "/app", label: "Overview", icon: LayoutGrid, exact: true },
  { to: "/app/compilations/new", label: "New", icon: Plus },
  { to: "/app/history", label: "History", icon: History },
  { to: "/docs/install", label: "More", icon: Menu },
];

export function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const isActive = (to: string, exact?: boolean) =>
    exact ? pathname === to : pathname.startsWith(to);

  return (
    <div className="flex min-h-dvh w-full bg-canvas text-foreground">
      <aside className="hidden w-[248px] shrink-0 flex-col border-r border-border bg-elevated md:flex">
        <div className="flex h-14 items-center px-5">
          <ProductLogo />
        </div>
        <nav className="flex-1 space-y-0.5 px-3 py-2" aria-label="Application">
          {NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-surface-strong font-medium text-foreground"
                    : "text-muted-foreground hover:bg-surface-strong hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" aria-hidden />
                {n.label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-border p-3">
          <div className="rounded-md border border-border bg-surface p-3 text-xs">
            <div className="flex items-center gap-2 font-medium">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-locked" aria-hidden />
              Live local workspace
            </div>
            <p className="mt-1 text-muted-foreground">MCP: OpenRouter structured outputs</p>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <Link to="/app" className="text-xs text-muted-foreground hover:text-foreground">
              <Settings className="mr-1 inline h-3.5 w-3.5" />
              Settings
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-canvas/90 px-4 backdrop-blur sm:px-6">
          <div className="flex items-center gap-3">
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  aria-label="Open navigation"
                >
                  <Menu className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-72">
                <SheetHeader>
                  <SheetTitle>
                    <ProductLogo />
                  </SheetTitle>
                </SheetHeader>
                <nav className="mt-4 space-y-0.5" aria-label="Mobile app">
                  {NAV.map((n) => (
                    <Link
                      key={n.to}
                      to={n.to}
                      className="flex items-center gap-2.5 rounded-md px-3 py-2 text-sm hover:bg-surface-strong"
                    >
                      <n.icon className="h-4 w-4" /> {n.label}
                    </Link>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
            <div className="md:hidden">
              <ProductLogo compact />
            </div>
            <div className="hidden text-sm text-muted-foreground md:flex md:items-center md:gap-2">
              <GitBranch className="h-3.5 w-3.5" />
              <span>ambiguity-compiler</span>
              <span aria-hidden>/</span>
              <span className="text-foreground">local workspace</span>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 pb-24 md:pb-6">
          <Outlet />
        </main>

        <nav
          aria-label="Mobile primary"
          className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-elevated/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
        >
          {MOBILE_NAV.map((n) => {
            const Icon = n.icon;
            const active = isActive(n.to, n.exact);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 py-2 text-[11px]",
                  active ? "text-foreground" : "text-muted-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className="h-4 w-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
