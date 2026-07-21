import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { compileCompilation } from "@/lib/ac/server-functions";
import type { ContextExcerpt } from "@/lib/ac/types";
import { compilationKeys } from "@/hooks/use-compilation";

export const Route = createFileRoute("/app/compilations/new")({
  component: NewCompilation,
  head: () => ({ meta: [{ title: "New compilation — Ambiguity Compiler" }] }),
});

type Excerpt = {
  id: string;
  path: string;
  anchor: string;
  kind: ContextExcerpt["kind"];
  text: string;
};

type ExcerptDraft = Omit<Excerpt, "id">;

const emptyExcerptDraft: ExcerptDraft = {
  path: "",
  anchor: "",
  kind: "source",
  text: "",
};

function NewCompilation() {
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [requirement, setRequirement] = useState("");
  const [ref, setRef] = useState("");
  const [excerpts, setExcerpts] = useState<Excerpt[]>([]);
  const [draftExcerpt, setDraftExcerpt] = useState<ExcerptDraft>(emptyExcerptDraft);
  const [err, setErr] = useState<string | null>(null);
  const nav = useNavigate();
  const queryClient = useQueryClient();
  const compile = useMutation({
    mutationFn: compileCompilation,
    onSuccess: async (compilation) => {
      queryClient.setQueryData(compilationKeys.detail(compilation.id), compilation);
      await queryClient.invalidateQueries({ queryKey: compilationKeys.all });
      nav({ to: "/app/compilations/$id", params: { id: compilation.id } });
    },
    onError: (error) =>
      setErr(error instanceof Error ? error.message : "Compilation failed. Please try again."),
  });

  const canNext = title.trim().length > 2 && requirement.trim().length > 6;
  const hasDraftExcerpt = [draftExcerpt.path, draftExcerpt.anchor, draftExcerpt.text].some(
    (value) => value.trim().length > 0,
  );

  const prepareDraftExcerpt = (): Excerpt | null | undefined => {
    if (!hasDraftExcerpt) return null;
    if (!draftExcerpt.path.trim() || !draftExcerpt.text.trim()) {
      setErr("Finish the file path and excerpt, or clear the draft before compiling.");
      return undefined;
    }
    return {
      id: crypto.randomUUID(),
      path: draftExcerpt.path.trim(),
      anchor: draftExcerpt.anchor.trim() || "-",
      kind: draftExcerpt.kind,
      text: draftExcerpt.text.trim(),
    };
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Step {step} of 2
        </div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">New compilation</h1>
      </header>

      {step === 1 && (
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-1"
                placeholder="e.g. Monthly transaction export"
              />
            </div>
            <div>
              <Label htmlFor="req">Requirement text</Label>
              <Textarea
                id="req"
                value={requirement}
                onChange={(e) => setRequirement(e.target.value)}
                rows={4}
                className="mt-1"
                placeholder="Describe the behavior in one or two sentences."
              />
            </div>
            <div>
              <Label htmlFor="ref">Issue reference (optional)</Label>
              <Input
                id="ref"
                value={ref}
                onChange={(e) => setRef(e.target.value)}
                className="mt-1 font-mono"
                placeholder="AC-142"
              />
            </div>
            <p className="rounded-md border border-border bg-elevated p-3 text-xs text-muted-foreground">
              Supported stack for this prototype: TypeScript + Vitest.
            </p>
          </div>
          <div className="mt-6 flex justify-between border-t border-border pt-4">
            <Button asChild variant="ghost">
              <Link to="/app">Cancel</Link>
            </Button>
            <Button
              onClick={() =>
                canNext ? setStep(2) : setErr("Provide a title and requirement text.")
              }
              disabled={!canNext}
            >
              Next: scoped context <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
          {err && !canNext && (
            <p role="alert" className="mt-3 text-sm text-destructive">
              {err}
            </p>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
          <h2 className="text-sm font-semibold">Context excerpts</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Add small file excerpts. Excerpts are scanned for obvious secrets and truncated if too
            long.
          </p>
          <ExcerptForm
            draft={draftExcerpt}
            onChange={setDraftExcerpt}
            onAdd={() => {
              const excerpt = prepareDraftExcerpt();
              if (!excerpt) return;
              setExcerpts((prev) => [...prev, excerpt]);
              setDraftExcerpt(emptyExcerptDraft);
              setErr(null);
            }}
          />
          {excerpts.length > 0 && (
            <ul className="mt-4 space-y-2">
              {excerpts.map((e) => (
                <li
                  key={e.id}
                  className="flex items-center justify-between gap-3 rounded-md border border-border bg-elevated p-3 text-sm"
                >
                  <div className="min-w-0">
                    <div className="font-mono text-xs">
                      {e.path}:{e.anchor}
                    </div>
                    <div className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                      {e.text.slice(0, 80)}…
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Remove excerpt"
                    onClick={() => setExcerpts((prev) => prev.filter((x) => x.id !== e.id))}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
          <div className="mt-6 flex flex-wrap justify-between gap-3 border-t border-border pt-4">
            <Button variant="ghost" onClick={() => setStep(1)}>
              Back
            </Button>
            <Button
              disabled={compile.isPending}
              onClick={() => {
                setErr(null);
                const pendingExcerpt = prepareDraftExcerpt();
                if (pendingExcerpt === undefined) return;
                const approvedExcerpts = pendingExcerpt ? [...excerpts, pendingExcerpt] : excerpts;
                compile.mutate({
                  data: {
                    title,
                    requirement,
                    source: ref,
                    context: approvedExcerpts.map((excerpt) => ({
                      id: excerpt.id,
                      path: excerpt.path,
                      anchor: excerpt.anchor || "-",
                      kind: excerpt.kind,
                      sanitized: true,
                      excerpt: excerpt.text.slice(0, 4_000),
                    })),
                  },
                });
              }}
            >
              {compile.isPending ? "Compiling contracts…" : "Compile requirement"}{" "}
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
          <p className="mt-3 text-[11px] text-muted-foreground">
            {hasDraftExcerpt
              ? "Your complete draft will be included when you compile."
              : "Only approved excerpts are sent to the MCP backend. The server rejects likely secrets before analysis."}
          </p>
          {err && (
            <p
              role="alert"
              className="mt-3 rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {err}
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function ExcerptForm({
  draft,
  onChange,
  onAdd,
}: {
  draft: ExcerptDraft;
  onChange: (draft: ExcerptDraft) => void;
  onAdd: () => void;
}) {
  return (
    <div className="mt-4 grid gap-3 rounded-lg border border-border bg-elevated p-3 sm:grid-cols-[2fr_1fr_1fr_auto]">
      <Input
        placeholder="src/routes/exports.ts"
        value={draft.path}
        onChange={(e) => onChange({ ...draft, path: e.target.value })}
        className="font-mono"
        aria-label="File path"
      />
      <Input
        placeholder="L18-L64"
        value={draft.anchor}
        onChange={(e) => onChange({ ...draft, anchor: e.target.value })}
        className="font-mono"
        aria-label="Anchor"
      />
      <select
        value={draft.kind}
        onChange={(e) => onChange({ ...draft, kind: e.target.value as ExcerptDraft["kind"] })}
        aria-label="Kind"
        className="rounded-md border border-border bg-surface px-3 py-2 text-sm"
      >
        <option value="source">source</option>
        <option value="test">test</option>
        <option value="doc">doc</option>
        <option value="config">config</option>
      </select>
      <Button onClick={onAdd} disabled={!draft.path.trim() || !draft.text.trim()}>
        <Plus className="mr-1 h-4 w-4" />
        Add excerpt
      </Button>
      <Textarea
        placeholder="Paste excerpt (≤ 40 lines)…"
        value={draft.text}
        onChange={(e) => onChange({ ...draft, text: e.target.value })}
        rows={4}
        className="col-span-full font-mono text-xs"
        aria-label="Excerpt"
      />
    </div>
  );
}
