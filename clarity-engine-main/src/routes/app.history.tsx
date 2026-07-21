import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useMemo } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { StatusBadge } from "@/components/ac/StatusBadge";
import { useCompilations } from "@/hooks/use-compilation";
import {
  CATEGORY_LABEL,
  STATUS_LABEL,
  type CompilationStatus,
  type AmbiguityCategory,
} from "@/lib/ac/types";

export const Route = createFileRoute("/app/history")({
  component: History,
  head: () => ({ meta: [{ title: "History — Ambiguity Compiler" }] }),
  validateSearch: (s: Record<string, unknown>) => ({
    q: typeof s.q === "string" ? s.q : "",
    status: typeof s.status === "string" ? s.status : "",
    cat: typeof s.cat === "string" ? s.cat : "",
  }),
});

function History() {
  const search = Route.useSearch();
  const nav = Route.useNavigate();
  const [q, setQ] = useState(search.q);
  const { data: compilations = [], isPending, isError, error, refetch } = useCompilations();

  const filtered = useMemo(() => {
    return compilations.filter((c) => {
      if (search.status && c.status !== search.status) return false;
      if (search.cat && !c.categories.includes(search.cat as AmbiguityCategory)) return false;
      if (
        q &&
        !c.title.toLowerCase().includes(q.toLowerCase()) &&
        !c.source.toLowerCase().includes(q.toLowerCase())
      )
        return false;
      return true;
    });
  }, [compilations, q, search.status, search.cat]);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">History</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Compilation records available to this workspace session.
        </p>
      </header>

      <div className="mb-4 flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            aria-label="Search compilations"
            placeholder="Search by title or source"
            className="pl-9"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              nav({ search: (previous) => ({ ...previous, q: e.target.value }) });
            }}
          />
        </div>
        <select
          aria-label="Filter status"
          value={search.status}
          onChange={(e) => nav({ search: (previous) => ({ ...previous, status: e.target.value }) })}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">All statuses</option>
          {(Object.keys(STATUS_LABEL) as CompilationStatus[]).map((k) => (
            <option key={k} value={k}>
              {STATUS_LABEL[k]}
            </option>
          ))}
        </select>
        <select
          aria-label="Filter category"
          value={search.cat}
          onChange={(e) => nav({ search: (previous) => ({ ...previous, cat: e.target.value }) })}
          className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
        >
          <option value="">All categories</option>
          {(Object.keys(CATEGORY_LABEL) as AmbiguityCategory[]).map((k) => (
            <option key={k} value={k}>
              {CATEGORY_LABEL[k]}
            </option>
          ))}
        </select>
      </div>

      {isError ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/40 bg-destructive/10 p-5 text-sm text-destructive"
        >
          {error instanceof Error ? error.message : "Could not load history."}{" "}
          <button type="button" onClick={() => refetch()} className="ml-2 underline">
            Retry
          </button>
        </div>
      ) : isPending ? (
        <div className="rounded-xl border border-border bg-surface p-8 text-center text-sm text-muted-foreground">
          Loading compilation history…
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-sm text-muted-foreground">No compilations match those filters.</p>
        </div>
      ) : (
        <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-surface">
          {filtered.map((c) => (
            <li key={c.id}>
              <Link
                to="/app/compilations/$id"
                params={{ id: c.id }}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 hover:bg-elevated"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <span className="truncate">{c.title}</span>
                    <span className="font-mono text-[11px] text-muted-foreground">{c.source}</span>
                  </div>
                  <div className="mt-0.5 text-xs text-muted-foreground">
                    {c.categories.map((k) => CATEGORY_LABEL[k]).join(" · ") || "—"}
                  </div>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
