import { createFileRoute, Link } from "@tanstack/react-router";
import { Copy, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_LABEL } from "@/lib/ac/types";
import { toast } from "sonner";
import { useCompilation } from "@/hooks/use-compilation";

export const Route = createFileRoute("/app/compilations/$id/receipt")({
  component: Receipt,
});

function Receipt() {
  const { id } = Route.useParams();
  const { data: c, isPending, isError, error, refetch } = useCompilation(id);
  if (isPending) return <PageNotice>Loading decision receipt…</PageNotice>;
  if (isError || !c)
    return (
      <PageNotice action={() => refetch()}>
        {error instanceof Error ? error.message : "Compilation not found."}
      </PageNotice>
    );
  const chosen = c.interpretations.find((i) => i.id === c.selectedInterpretationId);
  const rejected = c.interpretations.filter((i) => i.id !== c.selectedInterpretationId);

  const md = buildMarkdown();
  const json = JSON.stringify(c, null, 2);

  function buildMarkdown() {
    return [
      `# Decision Receipt — ${c.title}`,
      ``,
      `- Source: ${c.source}`,
      `- Version: v${c.version}`,
      `- Contract hash: ${c.contractHash ?? "n/a"}`,
      ``,
      `## Requirement`,
      `> ${c.requirement}`,
      ``,
      `## Selected contract`,
      chosen ? `**Contract ${chosen.id} — ${chosen.title}**\n\n${chosen.contract}` : "(none)",
      ``,
      `## Rejected alternatives`,
      ...rejected.map((r) => `- Contract ${r.id} — ${r.title}`),
    ].join("\n");
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 print:py-0">
      <header className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">
            <Link
              to="/app/compilations/$id"
              params={{ id: c.id }}
              className="hover:text-foreground"
            >
              {c.title}
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Decision receipt</h1>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(md);
              toast.success("Markdown copied");
            }}
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy Markdown
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              navigator.clipboard.writeText(json);
              toast.success("JSON copied");
            }}
          >
            <Copy className="mr-1 h-3.5 w-3.5" /> Copy JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-1 h-3.5 w-3.5" /> Print
          </Button>
        </div>
      </header>

      <article className="rounded-xl border border-border bg-surface p-6 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-4 text-xs text-muted-foreground">
          <span className="font-mono">{c.contractHash ?? "—"}</span>
          <span className="font-mono">
            {c.source} · v{c.version}
          </span>
        </div>

        <Row label="Original requirement">
          <p className="font-mono text-sm">&ldquo;{c.requirement}&rdquo;</p>
        </Row>

        <Row label="Scoped context">
          {c.context.length === 0 ? (
            <p className="text-sm text-muted-foreground">No excerpts recorded.</p>
          ) : (
            <ul className="space-y-1 font-mono text-xs">
              {c.context.map((x) => (
                <li key={x.id}>
                  {x.path}:{x.anchor}
                </li>
              ))}
            </ul>
          )}
        </Row>

        <Row label="Ambiguity categories">
          {c.categories.length > 0 ? (
            <span className="text-sm">
              {c.categories.map((k) => CATEGORY_LABEL[k]).join(" · ")}
            </span>
          ) : (
            <span className="text-sm text-muted-foreground">None recorded.</span>
          )}
        </Row>

        {chosen && (
          <Row label="Selected contract">
            <div className="text-sm">
              <div className="font-semibold">
                Contract {chosen.id} — {chosen.title}
              </div>
              <p className="mt-1 text-foreground/90">{chosen.contract}</p>
              <ul className="mt-3 space-y-1">
                {chosen.acceptance.map((a) => (
                  <li key={a.id} className="flex gap-2 text-xs">
                    <span className="font-mono text-muted-foreground">{a.id}</span>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          </Row>
        )}

        {rejected.length > 0 && (
          <Row label="Rejected alternatives">
            <ul className="space-y-1 text-sm">
              {rejected.map((r) => (
                <li key={r.id}>
                  <span className="font-mono text-xs text-muted-foreground">Contract {r.id}</span> ·{" "}
                  {r.title}
                </li>
              ))}
            </ul>
          </Row>
        )}

        {c.tests && (
          <Row label="Test contracts">
            <ul className="grid gap-1 text-sm sm:grid-cols-2">
              {c.tests.map((t) => (
                <li key={t.id} className="flex gap-2">
                  <span className="font-mono text-xs text-muted-foreground">{t.id}</span> {t.name}
                </li>
              ))}
            </ul>
          </Row>
        )}

        {c.verification && (
          <Row label="Verification">
            <div className="text-sm">
              {c.verification.implementedPassed}/
              {c.verification.implementedPassed + c.verification.implementedFailed} passed in{" "}
              {c.verification.durationMs} ms
              <div className="font-mono text-xs text-muted-foreground">
                patch {c.verification.patchHash}
              </div>
            </div>
          </Row>
        )}

        <Row label="Model and prompt version">
          <p className="font-mono text-xs">
            OpenRouter · configured model · strict structured outputs
          </p>
        </Row>

        <Row label="Limitations">
          <p className="text-xs text-muted-foreground">
            This hackathon build stores records in the active browser session. Test contracts are
            generated locally; verification appears only after a sanitized Vitest result is
            recorded.
          </p>
        </Row>
      </article>
    </div>
  );
}

function PageNotice({ children, action }: { children: React.ReactNode; action?: () => void }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <p className="text-sm text-muted-foreground">{children}</p>
      {action && (
        <Button className="mt-4" onClick={action}>
          Retry
        </Button>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2 border-b border-border py-4 last:border-b-0 sm:grid-cols-[180px_1fr]">
      <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </dt>
      <dd>{children}</dd>
    </div>
  );
}
