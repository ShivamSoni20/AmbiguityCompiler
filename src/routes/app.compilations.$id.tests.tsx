import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { StatusBadge } from "@/components/ac/StatusBadge";
import { Button } from "@/components/ui/button";
import { unwrapServerResult, useCompilation } from "@/hooks/use-compilation";
import { recordCompilationVerification } from "@/lib/ac/server-functions";
import type { Compilation } from "@/lib/ac/types";
import { verificationArtifactSchema } from "@/lib/ac/verification-artifact";
import { cn } from "@/lib/utils";

type TestResult = NonNullable<Compilation["tests"]>[number]["result"];

export const Route = createFileRoute("/app/compilations/$id/tests")({
  component: TestsPage,
});

function TestsPage() {
  const { id } = Route.useParams();
  const queryClient = useQueryClient();
  const { data: c, isPending, isError, error, refetch } = useCompilation(id);
  const recordMutation = useMutation({
    mutationFn: async (compilation: Compilation) => {
      const response = await fetch("/verification/monthly-export.json", { cache: "no-store" });
      if (!response.ok)
        throw new Error("Run npm run test:contract:record before recording verification.");
      const artifact = verificationArtifactSchema.parse(await response.json());
      if (!compilation.contractHash)
        throw new Error(
          "The selected contract hash is unavailable. Refresh the compilation first.",
        );
      return unwrapServerResult(
        await recordCompilationVerification({
          data: {
            id: compilation.id,
            framework: artifact.framework,
            exitCode: artifact.exitCode,
            passed: artifact.passed,
            failed: artifact.failed,
            durationMs: artifact.durationMs,
            patchHash: artifact.patchHash,
            selectedContractHash: compilation.contractHash,
            expectedVersion: compilation.version,
            idempotencyKey: `verification-${artifact.patchHash.slice(7, 31)}`,
          },
        }),
      );
    },
    onSuccess: (compilation) => {
      queryClient.setQueryData(["compilations", compilation.id], compilation);
      queryClient.invalidateQueries({ queryKey: ["compilations"] });
    },
  });

  if (isPending) return <PageNotice>Loading test contracts...</PageNotice>;
  if (isError || !c || !c.tests) {
    return (
      <PageNotice action={() => refetch()}>
        {error instanceof Error
          ? error.message
          : "Test contracts are not available until a contract is selected."}
      </PageNotice>
    );
  }

  const verification = c.verification;
  const canRecordVerification =
    c.selectedInterpretationId === "A" &&
    c.requirement.trim() === "Users can export their monthly transactions." &&
    c.tests.length === 1 &&
    c.tests[0].criterionId === "AC1";

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs text-muted-foreground">
            <Link
              to="/app/compilations/$id"
              params={{ id: c.id }}
              className="hover:text-foreground"
            >
              {c.title}
            </Link>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">Test contracts</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Lock className="h-3.5 w-3.5 text-locked" /> Contract {c.selectedInterpretationId}
            </span>
            {c.contractHash && (
              <span className="max-w-full break-all font-mono sm:max-w-md sm:truncate">
                {c.contractHash}
              </span>
            )}
            <span>Vitest</span>
          </div>
        </div>
        <StatusBadge status={c.status} />
      </header>

      <section className="mt-6 rounded-xl border border-border bg-surface p-4 sm:p-5">
        <h2 className="text-sm font-semibold">Traceability</h2>
        <div className="mt-3 hidden overflow-x-auto sm:block">
          <table className="min-w-[640px] w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground">
              <tr>
                <th className="pb-2 pr-3">Criterion</th>
                <th className="pb-2 pr-3">Test</th>
                <th className="pb-2 pr-3">Scenario</th>
                <th className="pb-2">Result</th>
              </tr>
            </thead>
            <tbody>
              {c.tests.map((test) => (
                <tr key={test.id} className="border-t border-border">
                  <td className="py-2 pr-3 font-mono text-xs">{test.criterionId}</td>
                  <td className="py-2 pr-3">{test.name}</td>
                  <td className="py-2 pr-3 font-mono text-xs text-muted-foreground">
                    {test.scenarioId}
                  </td>
                  <td className="py-2">
                    <span
                      className={cn(
                        "rounded px-1.5 py-0.5 text-xs font-medium",
                        test.result === "passed"
                          ? "bg-locked/10 text-locked"
                          : test.result === "failed"
                            ? "bg-destructive/10 text-destructive"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {test.result}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 divide-y divide-border sm:hidden">
          {c.tests.map((test) => (
            <li key={test.id} className="space-y-2 py-3 first:pt-0 last:pb-0">
              <div className="flex items-start justify-between gap-3">
                <span className="min-w-0 text-sm font-medium leading-5">{test.name}</span>
                <ResultBadge result={test.result} />
              </div>
              <dl className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
                <dt className="text-muted-foreground">Criterion</dt>
                <dd className="font-mono">{test.criterionId}</dd>
                <dt className="text-muted-foreground">Scenario</dt>
                <dd className="break-all font-mono text-muted-foreground">{test.scenarioId}</dd>
              </dl>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(18rem,1fr)]">
        <div className="space-y-3">
          {c.tests.map((test) => (
            <div key={test.id} className="rounded-lg border border-border bg-surface">
              <div className="flex items-start justify-between gap-3 border-b border-border px-3 py-2 text-xs sm:px-4">
                <span className="min-w-0 font-medium leading-5">{test.name}</span>
                <span className="shrink-0 font-mono text-muted-foreground">{test.id}</span>
              </div>
              <pre className="max-w-full overflow-x-auto p-3 font-mono text-xs leading-5 sm:p-4">
                {test.code}
              </pre>
            </div>
          ))}
        </div>
        <aside className="rounded-xl border border-border bg-surface p-4 sm:p-5 xl:sticky xl:top-20 xl:self-start">
          <h2 className="text-sm font-semibold">Verification</h2>
          {verification ? (
            <>
              <div className="mt-4 grid gap-4 text-sm min-[420px]:grid-cols-2">
                <Metric
                  label="Baseline"
                  value={`${verification.baselinePassed}/${verification.baselinePassed + verification.baselineFailed}`}
                />
                <Metric
                  label="After implementation"
                  value={`${verification.implementedPassed}/${verification.implementedPassed + verification.implementedFailed}`}
                  tone="locked"
                />
                <Metric label="Duration" value={`${verification.durationMs} ms`} />
                <Metric label="Patch hash" value={verification.patchHash} mono />
              </div>
              <div className="mt-5 flex items-center gap-2 rounded-md border border-locked/40 bg-locked/10 p-3 text-xs text-locked">
                <CheckCircle2 className="h-4 w-4" /> All contract tests passed after implementation.
              </div>
            </>
          ) : (
            <>
              <p className="mt-3 text-sm text-muted-foreground">Verification has not run.</p>
              {canRecordVerification ? (
                <>
                  <Button
                    className="mt-5 w-full"
                    onClick={() => recordMutation.mutate(c)}
                    disabled={recordMutation.isPending}
                  >
                    {recordMutation.isPending
                      ? "Recording Vitest result..."
                      : "Record latest Vitest result"}
                  </Button>
                  {recordMutation.isError && (
                    <p className="mt-2 text-xs text-destructive">{recordMutation.error.message}</p>
                  )}
                </>
              ) : (
                <p className="mt-3 text-xs text-muted-foreground">
                  Run the generated contract in the target repository, then record its sanitized
                  Vitest result.
                </p>
              )}
            </>
          )}
          <Button asChild className="mt-5 w-full">
            <Link to="/app/compilations/$id/receipt" params={{ id: c.id }}>
              View receipt <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </Button>
        </aside>
      </section>
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

function Metric({
  label,
  value,
  tone,
  mono,
}: {
  label: string;
  value: string;
  tone?: "locked";
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div
        className={cn(
          "mt-0.5 font-semibold",
          tone === "locked" && "text-locked",
          mono && "break-all font-mono text-xs",
        )}
      >
        {value}
      </div>
    </div>
  );
}

function ResultBadge({ result }: { result: TestResult }) {
  return (
    <span
      className={cn(
        "shrink-0 rounded px-1.5 py-0.5 text-xs font-medium",
        result === "passed"
          ? "bg-locked/10 text-locked"
          : result === "failed"
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-muted-foreground",
      )}
    >
      {result}
    </span>
  );
}
