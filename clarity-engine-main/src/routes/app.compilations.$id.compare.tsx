import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, ArrowRight, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/ac/StatusBadge";
import { InterpretationCard } from "@/components/ac/InterpretationCard";
import { DifferenceMatrix } from "@/components/ac/DifferenceMatrix";
import { ContractConfirmationDialog } from "@/components/ac/ContractConfirmationDialog";
import { selectCompilationContract } from "@/lib/ac/server-functions";
import { compilationKeys, unwrapServerResult, useCompilation } from "@/hooks/use-compilation";

export const Route = createFileRoute("/app/compilations/$id/compare")({
  component: Compare,
  head: () => ({ meta: [{ title: "Compare — Ambiguity Compiler" }] }),
});

function Compare() {
  const { id } = Route.useParams();
  const { data: c, isPending, isError, error, refetch } = useCompilation(id);
  const queryClient = useQueryClient();
  const selection = useMutation({
    mutationFn: async (input: Parameters<typeof selectCompilationContract>[0]) =>
      unwrapServerResult(await selectCompilationContract(input)),
    onSuccess: (compilation) => {
      queryClient.setQueryData(compilationKeys.detail(compilation.id), compilation);
      queryClient.invalidateQueries({ queryKey: compilationKeys.all });
    },
  });
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | undefined>(undefined);
  const [activeScenario, setActiveScenario] = useState<string | undefined>(undefined);
  if (isPending) return <PageNotice>Loading comparison…</PageNotice>;
  if (isError || !c)
    return (
      <PageNotice action={() => refetch()}>
        {error instanceof Error ? error.message : "Compilation not found."}
      </PageNotice>
    );

  const selectedId = c.selectedInterpretationId;
  const locked = Boolean(selectedId);
  const chosen = c.interpretations.find((i) => i.id === pendingId);
  const rejected = c.interpretations.filter((i) => i.id !== pendingId);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <div className="mb-2 text-xs text-muted-foreground">
        <Link
          to="/app/compilations/$id"
          params={{ id: c.id }}
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> {c.title}
        </Link>
      </div>

      <div className="sticky top-14 z-20 -mx-4 mb-6 rounded-xl border border-border bg-surface/90 px-4 py-3 backdrop-blur sm:mx-0 sm:px-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
              Requirement
            </div>
            <p className="mt-0.5 truncate font-mono text-sm">&ldquo;{c.requirement}&rdquo;</p>
          </div>
          <div className="flex items-center gap-2">
            <StatusBadge status={c.status} />
            {locked && c.contractHash && (
              <span className="hidden font-mono text-[11px] text-muted-foreground sm:inline">
                {c.contractHash}
              </span>
            )}
          </div>
        </div>
      </div>

      <section aria-labelledby="interps-heading">
        <h2 id="interps-heading" className="sr-only">
          Interpretations
        </h2>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {c.interpretations.map((i) => (
            <InterpretationCard
              key={i.id}
              interp={i}
              selected={locked && selectedId === i.id}
              locked={locked}
              disabled={locked}
              onChoose={
                locked
                  ? undefined
                  : () => {
                      setPendingId(i.id);
                      setConfirmOpen(true);
                    }
              }
            />
          ))}
        </div>
      </section>

      {c.scenarios.length > 0 && (
        <section className="mt-8" aria-labelledby="matrix-heading">
          <h2
            id="matrix-heading"
            className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground"
          >
            Discriminating scenarios
          </h2>
          <DifferenceMatrix
            scenarios={c.scenarios}
            interpretations={c.interpretations}
            activeScenarioId={activeScenario}
            onSelectScenario={setActiveScenario}
          />
        </section>
      )}

      {locked && (
        <div className="sticky bottom-0 mt-8 -mx-4 border-t border-border bg-surface/95 px-4 py-3 backdrop-blur sm:mx-0 md:relative md:rounded-xl md:border">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-sm">
              <Lock className="h-4 w-4 text-locked" />
              Contract {selectedId} locked ·{" "}
              {c.interpretations.find((i) => i.id === selectedId)?.title}
            </div>
            <Button asChild>
              <Link to="/app/compilations/$id/tests" params={{ id: c.id }}>
                Generate test contracts <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}

      <ContractConfirmationDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        chosen={chosen}
        rejected={rejected}
        onConfirm={(note) => {
          if (pendingId) {
            selection.mutate({
              data: {
                id: c.id,
                interpretationId: pendingId as "A" | "B" | "C",
                confirmation: true,
                expectedVersion: c.version,
                actor: "web-user",
                note,
              },
            });
          }
        }}
      />
      {selection.isError && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {selection.error instanceof Error
            ? selection.error.message
            : "Could not lock the contract."}
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
