import { createFileRoute, Link } from "@tanstack/react-router";
import { useReducer } from "react";
import {
  ArrowRight,
  CheckCircle2,
  ChevronRight,
  FileCode2,
  Loader2,
  RefreshCw,
  ScrollText,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/ac/PublicShell";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { InterpretationCard } from "@/components/ac/InterpretationCard";
import { DifferenceMatrix } from "@/components/ac/DifferenceMatrix";
import { ContractConfirmationDialog } from "@/components/ac/ContractConfirmationDialog";
import { StatusBadge } from "@/components/ac/StatusBadge";
import { GOLDEN_COMPILATION } from "@/lib/ac/seed";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

export const Route = createFileRoute("/demo")({
  component: DemoPage,
  head: () => ({
    meta: [
      { title: "Live demo — Ambiguity Compiler" },
      {
        name: "description",
        content: "Walk through a real compilation without signing in. Synthetic repository.",
      },
    ],
  }),
});

type Step = 0 | 1 | 2 | 3 | 4 | 5;
const STEPS = ["Requirement", "Context", "Compare", "Select", "Tests", "Receipt"] as const;

type State = {
  step: Step;
  requirement: string;
  compilingStage: number; // 0-3
  selected?: string;
  confirmOpen: boolean;
};

type Action =
  | { type: "next" }
  | { type: "goto"; step: Step }
  | { type: "editReq"; value: string }
  | { type: "restore" }
  | { type: "advanceCompile" }
  | { type: "openConfirm"; id: string }
  | { type: "closeConfirm" }
  | { type: "lock" };

const initial: State = {
  step: 0,
  requirement: GOLDEN_COMPILATION.requirement,
  compilingStage: 0,
  confirmOpen: false,
};

function reducer(s: State, a: Action): State {
  switch (a.type) {
    case "next":
      return { ...s, step: Math.min(5, s.step + 1) as Step };
    case "goto":
      return { ...s, step: a.step };
    case "editReq":
      return { ...s, requirement: a.value };
    case "restore":
      return { ...s, requirement: GOLDEN_COMPILATION.requirement };
    case "advanceCompile":
      return { ...s, compilingStage: Math.min(4, s.compilingStage + 1) };
    case "openConfirm":
      return { ...s, confirmOpen: true, selected: a.id };
    case "closeConfirm":
      return { ...s, confirmOpen: false };
    case "lock":
      return { ...s, confirmOpen: false, step: 4 };
  }
}

function DemoPage() {
  const [s, dispatch] = useReducer(reducer, initial);

  return (
    <div className="min-h-dvh bg-canvas">
      <PublicHeader />
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Live demo
            </div>
            <h1 className="mt-1 text-2xl font-semibold sm:text-3xl">Monthly transaction export</h1>
          </div>
          <StatusBadge
            status={
              s.step >= 5
                ? "receipt_ready"
                : s.step >= 4
                  ? "tests_generated"
                  : s.step >= 3
                    ? "contract_locked"
                    : s.step >= 2
                      ? "awaiting_selection"
                      : s.step >= 1
                        ? "compiling"
                        : "draft"
            }
          />
        </div>

        <ProgressRail step={s.step} onGoto={(n) => dispatch({ type: "goto", step: n })} />

        <div className="mt-8">
          {s.step === 0 && <StepRequirement s={s} dispatch={dispatch} />}
          {s.step === 1 && <StepContext dispatch={dispatch} />}
          {s.step === 2 && <StepCompile s={s} dispatch={dispatch} />}
          {s.step === 3 && <StepCompare s={s} dispatch={dispatch} />}
          {s.step === 4 && <StepTests dispatch={dispatch} />}
          {s.step === 5 && <StepReceipt />}
        </div>
      </div>
      <PublicFooter />

      <ContractConfirmationDialog
        open={s.confirmOpen}
        onOpenChange={(v) => !v && dispatch({ type: "closeConfirm" })}
        chosen={GOLDEN_COMPILATION.interpretations.find((i) => i.id === s.selected)}
        rejected={GOLDEN_COMPILATION.interpretations.filter((i) => i.id !== s.selected)}
        onConfirm={() => dispatch({ type: "lock" })}
      />
    </div>
  );
}

function ProgressRail({ step, onGoto }: { step: Step; onGoto: (n: Step) => void }) {
  return (
    <ol
      className="flex flex-wrap items-center gap-2 rounded-lg border border-border bg-surface p-2 text-xs"
      aria-label="Demo progress"
    >
      {STEPS.map((label, i) => {
        const done = i < step;
        const current = i === step;
        return (
          <li key={label} className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => i <= step && onGoto(i as Step)}
              disabled={i > step}
              aria-current={current ? "step" : undefined}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2 py-1 font-medium transition-colors",
                current && "bg-elevated text-foreground",
                done && "text-locked hover:bg-elevated",
                !done && !current && "text-muted-foreground",
              )}
            >
              <span
                className={cn(
                  "grid h-4 w-4 place-items-center rounded-full text-[10px]",
                  done
                    ? "bg-locked text-locked-foreground"
                    : current
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="h-3 w-3" /> : i + 1}
              </span>
              {label}
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" aria-hidden />
            )}
          </li>
        );
      })}
    </ol>
  );
}

function StepRequirement({ s, dispatch }: { s: State; dispatch: React.Dispatch<Action> }) {
  return (
    <Card>
      <SectionHeader
        title="Requirement"
        subtitle="This is what will be compiled into candidate contracts."
      />
      <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <Label
            htmlFor="req-title"
            className="text-xs uppercase tracking-wider text-muted-foreground"
          >
            Title
          </Label>
          <Input id="req-title" defaultValue="Monthly transaction export" className="mt-1" />
        </div>
        <div className="text-xs text-muted-foreground sm:text-right">
          <div>
            Source: <span className="font-mono">{GOLDEN_COMPILATION.source}</span>
          </div>
          <div>
            Stack: <span className="font-mono">TypeScript / Vitest</span>
          </div>
        </div>
      </div>
      <div className="mt-4">
        <Label
          htmlFor="req-text"
          className="text-xs uppercase tracking-wider text-muted-foreground"
        >
          Requirement text
        </Label>
        <Textarea
          id="req-text"
          value={s.requirement}
          onChange={(e) => dispatch({ type: "editReq", value: e.target.value })}
          rows={3}
          className="mt-1 font-mono"
        />
      </div>
      <Footer>
        <Button variant="ghost" onClick={() => dispatch({ type: "restore" })}>
          <RefreshCw className="mr-1.5 h-3.5 w-3.5" /> Restore sample
        </Button>
        <Button onClick={() => dispatch({ type: "next" })}>
          Inspect scoped context <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </Footer>
    </Card>
  );
}

function StepContext({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  return (
    <Card>
      <SectionHeader
        title="Scoped context"
        subtitle="Only these excerpts will be sent for compilation."
      />
      <ul className="space-y-3">
        {GOLDEN_COMPILATION.context.map((c) => (
          <li key={c.id} className="rounded-lg border border-border bg-elevated">
            <details>
              <summary className="flex cursor-pointer items-center justify-between gap-2 p-3">
                <div className="flex items-center gap-2 text-sm">
                  <FileCode2 className="h-4 w-4 text-evidence" aria-hidden />
                  <span className="font-mono">{c.path}</span>
                  <span className="text-muted-foreground">·</span>
                  <span className="font-mono text-xs text-muted-foreground">{c.anchor}</span>
                </div>
                <span className="rounded bg-locked/10 px-1.5 py-0.5 text-[10px] font-medium text-locked">
                  {c.sanitized ? "sanitized" : "raw"}
                </span>
              </summary>
              <pre className="overflow-x-auto border-t border-border bg-canvas p-3 font-mono text-xs">
                {c.excerpt}
              </pre>
            </details>
          </li>
        ))}
      </ul>
      <Footer>
        <Button variant="ghost" onClick={() => dispatch({ type: "goto", step: 0 })}>
          Back
        </Button>
        <Button onClick={() => dispatch({ type: "next" })}>
          Compile behavioral contracts <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </Footer>
    </Card>
  );
}

function StepCompile({ s, dispatch }: { s: State; dispatch: React.Dispatch<Action> }) {
  const stages = [
    "Validating context",
    "Compiling contracts",
    "Checking evidence",
    "Building discriminating cases",
  ];
  useEffect(() => {
    if (s.compilingStage < 4) {
      const t = setTimeout(() => dispatch({ type: "advanceCompile" }), 650);
      return () => clearTimeout(t);
    }
  }, [s.compilingStage, dispatch]);
  const done = s.compilingStage >= 4;
  return (
    <Card>
      <SectionHeader
        title="Compiling"
        subtitle="Live analysis is unavailable — showing the prevalidated sample compilation."
      />
      <ol className="space-y-2" aria-live="polite">
        {stages.map((label, i) => {
          const active = i === s.compilingStage;
          const complete = i < s.compilingStage;
          return (
            <li
              key={label}
              className="flex items-center gap-3 rounded-md border border-border bg-elevated p-3 text-sm"
            >
              <span className="grid h-6 w-6 place-items-center rounded-full bg-surface text-xs">
                {complete ? (
                  <CheckCircle2 className="h-4 w-4 text-locked" />
                ) : active ? (
                  <Loader2 className="h-4 w-4 animate-spin text-evidence" />
                ) : (
                  <span className="text-muted-foreground">{i + 1}</span>
                )}
              </span>
              <span
                className={
                  complete
                    ? "text-foreground/90"
                    : active
                      ? "text-foreground"
                      : "text-muted-foreground"
                }
              >
                {label}
              </span>
            </li>
          );
        })}
      </ol>
      <Footer>
        <span className="text-xs text-muted-foreground">
          Using seeded adapter · no external calls
        </span>
        <Button onClick={() => dispatch({ type: "next" })} disabled={!done}>
          Compare contracts <ArrowRight className="ml-1.5 h-4 w-4" />
        </Button>
      </Footer>
    </Card>
  );
}

function StepCompare({ s, dispatch }: { s: State; dispatch: React.Dispatch<Action> }) {
  const [activeScenario, setActiveScenario] = useState<string>("sc1");
  return (
    <div className="space-y-6">
      <Card>
        <SectionHeader
          title="Compare interpretations"
          subtitle="Each contract has evidence and assumptions. None is labeled 'recommended'."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {GOLDEN_COMPILATION.interpretations.map((i) => (
            <InterpretationCard
              key={i.id}
              interp={i}
              selected={s.selected === i.id}
              onChoose={() => dispatch({ type: "openConfirm", id: i.id })}
            />
          ))}
        </div>
      </Card>
      <Card>
        <SectionHeader
          title="Discriminating scenarios"
          subtitle="Select a row to see how contracts diverge."
        />
        <DifferenceMatrix
          scenarios={GOLDEN_COMPILATION.scenarios}
          interpretations={GOLDEN_COMPILATION.interpretations}
          activeScenarioId={activeScenario}
          onSelectScenario={setActiveScenario}
        />
      </Card>
    </div>
  );
}

function StepTests({ dispatch }: { dispatch: React.Dispatch<Action> }) {
  const tests = GOLDEN_COMPILATION.tests ?? [];
  const v = GOLDEN_COMPILATION.verification!;
  return (
    <Card>
      <SectionHeader
        title="Test contracts (Vitest)"
        subtitle="Simulated execution — connected runner would produce real results."
      />
      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3">
          {tests.map((t) => (
            <div key={t.id} className="rounded-lg border border-border bg-elevated">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-3 py-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-muted-foreground">{t.id}</span>
                  <span className="font-medium">{t.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span className="font-mono">
                    {t.criterionId} · {t.scenarioId}
                  </span>
                  <span
                    className={cn(
                      "rounded px-1.5 py-0.5 font-medium",
                      t.result === "passed"
                        ? "bg-locked/10 text-locked"
                        : t.result === "failed"
                          ? "bg-destructive/10 text-destructive"
                          : "bg-muted text-muted-foreground",
                    )}
                  >
                    {t.result}
                  </span>
                </div>
              </div>
              <pre className="overflow-x-auto p-3 font-mono text-xs">{t.code}</pre>
            </div>
          ))}
        </div>
        <div className="rounded-lg border border-border bg-elevated p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Verification
          </div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-sm">
            <Stat
              label="Baseline passed"
              value={`${v.baselinePassed}/${v.baselinePassed + v.baselineFailed}`}
            />
            <Stat
              label="After implementation"
              value={`${v.implementedPassed}/${v.implementedPassed + v.implementedFailed}`}
              tone="locked"
            />
            <Stat label="Duration" value={`${v.durationMs} ms`} />
            <Stat label="Patch hash" value={v.patchHash} mono />
          </dl>
        </div>
      </div>
      <Footer>
        <Button variant="ghost" onClick={() => dispatch({ type: "goto", step: 3 })}>
          Back to comparison
        </Button>
        <Button onClick={() => dispatch({ type: "next" })}>
          View receipt <ScrollText className="ml-1.5 h-4 w-4" />
        </Button>
      </Footer>
    </Card>
  );
}

function StepReceipt() {
  return (
    <Card>
      <SectionHeader
        title="Decision receipt"
        subtitle="Durable, human-readable record of the locked contract and verification."
      />
      <div className="rounded-lg border border-border bg-elevated p-4 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-mono">receipt · {GOLDEN_COMPILATION.contractHash}</span>
          <span className="font-mono">
            {GOLDEN_COMPILATION.source} · v{GOLDEN_COMPILATION.version}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold">{GOLDEN_COMPILATION.title}</h3>
        <p className="text-sm text-foreground/90">&ldquo;{GOLDEN_COMPILATION.requirement}&rdquo;</p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <ReceiptField label="Selected contract">
            {GOLDEN_COMPILATION.interpretations[0].title}
          </ReceiptField>
          <ReceiptField label="Rejected alternatives">
            {GOLDEN_COMPILATION.interpretations
              .slice(1)
              .map((i) => i.title)
              .join("; ")}
          </ReceiptField>
          <ReceiptField label="Acceptance">
            {GOLDEN_COMPILATION.interpretations[0].acceptance.map((a) => a.id).join(" · ")}
          </ReceiptField>
          <ReceiptField label="Verification">
            {GOLDEN_COMPILATION.verification!.implementedPassed}/
            {GOLDEN_COMPILATION.verification!.implementedPassed +
              GOLDEN_COMPILATION.verification!.implementedFailed}{" "}
            passed
          </ReceiptField>
        </div>
      </div>
      <Footer>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              navigator.clipboard.writeText(JSON.stringify(GOLDEN_COMPILATION, null, 2))
            }
          >
            Copy JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigator.clipboard.writeText(receiptMarkdown())}
          >
            Copy Markdown
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" asChild>
            <Link to="/demo">Start again</Link>
          </Button>
          <Button asChild>
            <Link to="/docs/install">Install plugin</Link>
          </Button>
        </div>
      </Footer>
    </Card>
  );
}

function receiptMarkdown() {
  const c = GOLDEN_COMPILATION;
  return `# ${c.title}\n\n> ${c.requirement}\n\n- Source: ${c.source}\n- Contract hash: ${c.contractHash}\n- Selected: Contract ${c.selectedInterpretationId} — ${c.interpretations[0].title}\n`;
}

function ReceiptField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

function Stat({
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
      <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd
        className={cn(
          "mt-0.5 text-sm font-semibold",
          tone === "locked" && "text-locked",
          mono && "font-mono text-xs",
        )}
      >
        {value}
      </dd>
    </div>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">{children}</section>
  );
}

function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <header className="mb-4">
      <h2 className="text-lg font-semibold">{title}</h2>
      {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
    </header>
  );
}

function Footer({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
      {children}
    </div>
  );
}
