import { createFileRoute, Link, Outlet, useMatchRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowRight, FileCode2, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { StatusBadge } from "@/components/ac/StatusBadge";
import { CATEGORY_LABEL } from "@/lib/ac/types";
import { getCompilationById, provideCompilationContext } from "@/lib/ac/server-functions";
import { compilationKeys, unwrapServerResult, useCompilation } from "@/hooks/use-compilation";

export const Route = createFileRoute("/app/compilations/$id")({
  component: CompilationDetail,
  notFoundComponent: () => (
    <div className="mx-auto max-w-3xl px-4 py-16 text-center">
      <h1 className="text-xl font-semibold">Compilation not found</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        It may have been deleted or the URL is incorrect.
      </p>
      <Button asChild className="mt-4">
        <Link to="/app/history">Back to history</Link>
      </Button>
    </div>
  ),
  head: () => ({ meta: [{ title: "Compilation — Ambiguity Compiler" }] }),
});

function CompilationDetail() {
  const { id } = Route.useParams();
  const { data: c, isPending, isError, error, refetch } = useCompilation(id);
  const matchRoute = useMatchRoute();
  const isChildRoute = Boolean(
    matchRoute({ to: "/app/compilations/$id/compare", params: { id }, fuzzy: false }) ||
    matchRoute({ to: "/app/compilations/$id/tests", params: { id }, fuzzy: false }) ||
    matchRoute({ to: "/app/compilations/$id/receipt", params: { id }, fuzzy: false }),
  );
  if (isChildRoute) return <Outlet />;
  if (isPending) return <PageNotice>Loading compilation…</PageNotice>;
  if (isError || !c)
    return (
      <PageNotice action={() => refetch()}>
        {error instanceof Error ? error.message : "Compilation not found."}
      </PageNotice>
    );
  const nextAction = nextActionFor(c.status, c.id);

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link to="/app" className="hover:text-foreground">
          Overview
        </Link>{" "}
        <span aria-hidden>/</span> {c.title}
      </div>
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{c.title}</h1>
            <StatusBadge status={c.status} />
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            <span className="font-mono">{c.source}</span> · v{c.version} · updated{" "}
            {new Date(c.updatedAt).toLocaleDateString()}
          </p>
        </div>
        {nextAction && (
          <Button asChild>
            <NextActionLink action={nextAction} />
          </Button>
        )}
      </header>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-6">
          <Card title="Original requirement">
            <p className="font-mono text-sm text-foreground/90">&ldquo;{c.requirement}&rdquo;</p>
          </Card>

          {c.categories.length > 0 && (
            <Card title="Ambiguities discovered">
              <ul className="flex flex-wrap gap-2 text-xs">
                {c.categories.map((k) => (
                  <li
                    key={k}
                    className="rounded-full border border-ambiguous/40 bg-ambiguous/10 px-2.5 py-1 text-ambiguous"
                  >
                    {CATEGORY_LABEL[k]}
                  </li>
                ))}
              </ul>
            </Card>
          )}

          {c.status === "needs_context" && c.questions && (
            <Card title="Needs context">
              <ul className="space-y-2">
                {c.questions.map((q, i) => (
                  <li
                    key={i}
                    className="flex gap-2 rounded-md border border-border bg-elevated p-3 text-sm"
                  >
                    <HelpCircle className="mt-0.5 h-4 w-4 text-ambiguous" aria-hidden />
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted-foreground">
                Answering these creates a new immutable version of this compilation.
              </p>
              <ContextAnswersForm
                key={`${c.id}:${c.version}`}
                compilationId={c.id}
                version={c.version}
                questions={c.questions}
              />
            </Card>
          )}

          {c.interpretations.length > 0 && c.status !== "needs_context" && (
            <Card title="Explicit behaviors">
              <ul className="space-y-2 text-sm">
                {c.interpretations[0].acceptance.map((a) => (
                  <li key={a.id} className="flex gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{a.id}</span>
                    <span>{a.text}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>

        <div className="space-y-6">
          <Card title="Context digest">
            {c.context.length === 0 ? (
              <p className="text-sm text-muted-foreground">No excerpts approved.</p>
            ) : (
              <ul className="space-y-2 text-sm">
                {c.context.map((x) => (
                  <li
                    key={x.id}
                    className="flex items-center gap-2 rounded-md border border-border bg-elevated p-2"
                  >
                    <FileCode2 className="h-3.5 w-3.5 text-evidence" />
                    <span className="truncate font-mono text-xs">
                      {x.path}:{x.anchor}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Card>
          <Card title="Timeline">
            <ol className="space-y-2 text-sm">
              <TimelineItem label="Draft created" active />
              <TimelineItem label="Context approved" active={c.context.length > 0} />
              <TimelineItem label="Contracts compiled" active={c.interpretations.length > 0} />
              <TimelineItem label="Contract locked" active={!!c.selectedInterpretationId} />
              <TimelineItem label="Verification recorded" active={!!c.verification} />
            </ol>
          </Card>
        </div>
      </div>
    </div>
  );
}

function ContextAnswersForm({
  compilationId,
  version,
  questions,
}: {
  compilationId: string;
  version: number;
  questions: string[];
}) {
  const queryClient = useQueryClient();
  const [answers, setAnswers] = useState<Record<string, string>>(() =>
    Object.fromEntries(questions.map((question) => [question, ""])),
  );
  const [error, setError] = useState<string | null>(null);
  const provideContext = useMutation({
    mutationFn: provideCompilationContext,
    onSuccess: async (compilation) => {
      queryClient.setQueryData(compilationKeys.detail(compilation.id), compilation);
      await queryClient.invalidateQueries({ queryKey: compilationKeys.all });
    },
    onError: async (cause) => {
      try {
        const latest = unwrapServerResult(
          await getCompilationById({ data: { id: compilationId } }),
        );
        if (latest.version > version) {
          queryClient.setQueryData(compilationKeys.detail(latest.id), latest);
          await queryClient.invalidateQueries({ queryKey: compilationKeys.all });
          setError(null);
          return;
        }
      } catch (refreshError) {
        console.error("Failed to refresh compilation after a mutation error.", refreshError);
      }
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not compile the clarified version. Refresh before retrying.",
      );
    },
  });

  return (
    <div className="mt-5 space-y-4 border-t border-border pt-4">
      {questions.map((question, index) => (
        <div key={question}>
          <label className="text-xs font-medium" htmlFor={`answer-${index}`}>
            Answer {index + 1}
          </label>
          <Textarea
            id={`answer-${index}`}
            value={answers[question] ?? ""}
            onChange={(event) =>
              setAnswers((current) => ({ ...current, [question]: event.target.value }))
            }
            rows={3}
            className="mt-1"
            placeholder="Provide the decision or link to the authoritative policy."
          />
        </div>
      ))}
      <Button
        disabled={provideContext.isPending}
        onClick={() => {
          const missingAnswer = questions.some((question) => !answers[question]?.trim());
          if (missingAnswer) {
            setError("Answer every question before compiling the clarified version.");
            return;
          }
          setError(null);
          provideContext.mutate({
            data: {
              id: compilationId,
              expectedVersion: version,
              answers: questions.map((question) => ({
                question,
                answer: answers[question].trim(),
              })),
            },
          });
        }}
      >
        {provideContext.isPending ? "Compiling clarified version…" : "Compile clarified version"}
        <ArrowRight className="ml-1.5 h-4 w-4" />
      </Button>
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
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

type NextAction =
  | { label: string; view: "compare"; id: string }
  | { label: string; view: "tests"; id: string }
  | { label: string; view: "receipt"; id: string };

function nextActionFor(status: string, id: string): NextAction | null {
  if (status === "awaiting_selection" || status === "contract_locked")
    return {
      label: "Compare interpretations",
      view: "compare",
      id,
    };
  if (status === "tests_generated" || status === "verification_recorded")
    return { label: "View tests", view: "tests", id };
  if (status === "receipt_ready") return { label: "View receipt", view: "receipt", id };
  return null;
}

function NextActionLink({ action }: { action: NextAction }) {
  if (action.view === "compare") {
    return (
      <Link to="/app/compilations/$id/compare" params={{ id: action.id }}>
        {action.label} <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
    );
  }
  if (action.view === "tests") {
    return (
      <Link to="/app/compilations/$id/tests" params={{ id: action.id }}>
        {action.label} <ArrowRight className="ml-1.5 h-4 w-4" />
      </Link>
    );
  }
  return (
    <Link to="/app/compilations/$id/receipt" params={{ id: action.id }}>
      {action.label} <ArrowRight className="ml-1.5 h-4 w-4" />
    </Link>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3">{children}</div>
    </section>
  );
}

function TimelineItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <li className="flex items-center gap-2">
      <span className={`h-2 w-2 rounded-full ${active ? "bg-locked" : "bg-muted"}`} aria-hidden />
      <span className={active ? "text-foreground" : "text-muted-foreground"}>{label}</span>
    </li>
  );
}
