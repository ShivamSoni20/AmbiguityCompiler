import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowUpRight, GitBranch, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ac/StatusBadge";
import { CATEGORY_LABEL, STATUS_LABEL } from "@/lib/ac/types";
import { useCompilations } from "@/hooks/use-compilation";

export const Route = createFileRoute("/app/")({
  component: Overview,
  head: () => ({ meta: [{ title: "Overview — Ambiguity Compiler" }] }),
});

function Overview() {
  const { data: compilations = [], isPending, isError, error, refetch } = useCompilations();
  const total = compilations.length;
  const awaiting = compilations.filter((c) => c.status === "awaiting_selection").length;
  const verified = compilations.filter(
    (c) => c.status === "receipt_ready" || c.status === "verification_recorded",
  ).length;
  const needs = compilations.filter((c) => c.status === "needs_context").length;
  const continueOne = compilations.find(
    (c) => c.status === "awaiting_selection" || c.status === "needs_context",
  );

  const catCount = { boundary_time: 0, authorization_actor: 0, lifecycle_state: 0 };
  compilations.forEach((c) => c.categories.forEach((k) => (catCount[k] += 1)));
  const catMax = Math.max(1, ...Object.values(catCount));

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Compile intent before your next implementation.
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Live workspace records · OpenRouter-backed analysis
          </p>
        </div>
        <Button asChild>
          <Link to="/app/compilations/new">
            <Plus className="mr-1.5 h-4 w-4" />
            New compilation
          </Link>
        </Button>
      </header>

      {isError && (
        <section
          role="alert"
          className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-sm text-destructive"
        >
          {error instanceof Error ? error.message : "Could not load compilations."}{" "}
          <Button variant="link" className="h-auto px-1 text-destructive" onClick={() => refetch()}>
            Retry
          </Button>
        </section>
      )}

      <section className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4" aria-busy={isPending}>
        <SummaryCard label="Total compilations" value={total} />
        <SummaryCard label="Awaiting decision" value={awaiting} tone="ambiguous" />
        <SummaryCard label="Verified contracts" value={verified} tone="locked" />
        <SummaryCard label="Needs context" value={needs} tone="ambiguous" />
      </section>

      {continueOne && (
        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Continue
          </div>
          <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{continueOne.title}</h2>
                <StatusBadge status={continueOne.status} />
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                {continueOne.categories.map((c) => CATEGORY_LABEL[c]).join(" · ")}
              </p>
            </div>
            <Button asChild>
              <Link to="/app/compilations/$id" params={{ id: continueOne.id }}>
                Continue <ArrowUpRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <div className="rounded-xl border border-border bg-surface">
          <header className="flex items-center justify-between border-b border-border px-5 py-3">
            <h2 className="text-sm font-semibold">Recent compilations</h2>
            <Link to="/app/history" className="text-xs text-muted-foreground hover:text-foreground">
              View all
            </Link>
          </header>
          <ul className="divide-y divide-border">
            {isPending ? (
              <li className="px-5 py-6 text-sm text-muted-foreground">Loading compilations…</li>
            ) : compilations.length === 0 ? (
              <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                No compilations yet. Start by compiling a requirement.
              </li>
            ) : (
              compilations.map((c) => (
                <li key={c.id}>
                  <Link
                    to="/app/compilations/$id"
                    params={{ id: c.id }}
                    className="flex flex-wrap items-center justify-between gap-3 px-5 py-3 hover:bg-elevated"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium">{c.title}</span>
                        <span className="font-mono text-[11px] text-muted-foreground">
                          {c.source}
                        </span>
                      </div>
                      <div className="mt-0.5 text-xs text-muted-foreground">
                        {c.interpretations.length} interpretations · updated {relTime(c.updatedAt)}
                      </div>
                    </div>
                    <StatusBadge status={c.status} />
                  </Link>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="rounded-xl border border-border bg-surface p-5">
          <h2 className="text-sm font-semibold">Ambiguity distribution</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Categories detected across compilations.
          </p>
          <ul className="mt-4 space-y-3">
            {(Object.keys(catCount) as (keyof typeof catCount)[]).map((k) => (
              <li key={k}>
                <div className="flex items-center justify-between text-xs">
                  <span>{CATEGORY_LABEL[k]}</span>
                  <span className="font-mono text-muted-foreground">{catCount[k]}</span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-evidence"
                    style={{ width: `${(catCount[k] / catMax) * 100}%` }}
                  />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "ambiguous" | "locked";
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={`mt-1 text-2xl font-semibold ${tone === "ambiguous" ? "text-ambiguous" : tone === "locked" ? "text-locked" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function relTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const days = Math.floor(diff / 86_400_000);
  if (days <= 0) return "today";
  if (days === 1) return "yesterday";
  return `${days} days ago`;
}
