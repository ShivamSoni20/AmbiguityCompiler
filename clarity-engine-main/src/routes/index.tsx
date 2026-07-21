import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import {
  ArrowRight,
  CheckCircle2,
  Cpu,
  FileCode2,
  GitBranch,
  Lock,
  Server,
  ShieldCheck,
  TestTube2,
  Workflow,
} from "lucide-react";
import { PublicHeader, PublicFooter } from "@/components/ac/PublicShell";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InterpretationCard } from "@/components/ac/InterpretationCard";
import { DifferenceMatrix } from "@/components/ac/DifferenceMatrix";
import { GOLDEN_COMPILATION } from "@/lib/ac/seed";

export const Route = createFileRoute("/")({
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-dvh bg-canvas text-foreground">
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm"
      >
        Skip to content
      </a>
      <PublicHeader />
      <main id="main">
        <Hero />
        <Problem />
        <Loop />
        <MatrixSection />
        <Layers />
        <Architecture />
        <Ambiguity />
        <Safety />
        <ReceiptPreview />
        <FinalCta />
      </main>
      <PublicFooter />
    </div>
  );
}

function Hero() {
  const [locked, setLocked] = useState<string | undefined>(undefined);
  const interps = GOLDEN_COMPILATION.interpretations;
  return (
    <section className="relative overflow-hidden border-b border-border">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(60% 40% at 20% 0%, color-mix(in oklab, var(--evidence) 20%, transparent), transparent 70%), radial-gradient(50% 40% at 90% 10%, color-mix(in oklab, var(--locked) 18%, transparent), transparent 70%)",
        }}
      />
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.05fr_1fr] lg:gap-14 lg:py-20">
        <div className="flex flex-col justify-center">
          <Badge
            variant="outline"
            className="w-fit border-evidence/40 bg-evidence/10 text-evidence"
          >
            A pre-implementation contract compiler
          </Badge>
          <h1 className="mt-4 text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Stop coding agents from silently choosing what your requirement means.
          </h1>
          <p className="mt-5 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Ambiguity Compiler turns one vague issue into competing behavioral contracts, shows the
            test cases where they disagree, and lets your team lock the intended behavior before
            Codex writes code.
          </p>
          <div className="mt-7 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link to="/demo">
                Try the live compilation <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <a href="#how">See the 3-minute flow</a>
            </Button>
          </div>
          <p className="mt-4 text-xs text-muted-foreground">
            No account required. Uses a synthetic TypeScript repository.
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-mono">requirement</span>
            <span className="font-mono">{GOLDEN_COMPILATION.source}</span>
          </div>
          <div className="rounded-lg border border-border bg-elevated p-3 font-mono text-sm">
            &ldquo;{GOLDEN_COMPILATION.requirement}&rdquo;
          </div>
          <div className="my-3 flex items-center gap-2 text-xs text-muted-foreground">
            <GitBranch className="h-3.5 w-3.5" />
            Compiler produced {interps.length} candidate contracts
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {interps.map((i) => (
              <button
                key={i.id}
                type="button"
                onClick={() => setLocked(i.id)}
                className={
                  "rounded-lg border p-3 text-left transition-colors " +
                  (locked === i.id
                    ? "border-locked bg-locked/10"
                    : locked
                      ? "border-border opacity-70"
                      : "border-border hover:border-border-strong")
                }
                aria-pressed={locked === i.id}
              >
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-mono">Contract {i.id}</span>
                  {locked === i.id && <Lock className="h-3 w-3 text-locked" />}
                </div>
                <div className="mt-1 text-sm font-medium leading-tight">{i.title}</div>
                <div className="mt-2 text-[11px] text-muted-foreground">
                  {i.assumptions[0] ?? "Explicit from evidence."}
                </div>
              </button>
            ))}
          </div>
          <div className="mt-4 rounded-lg border border-border bg-elevated p-3 text-xs">
            <div className="text-muted-foreground">Boundary test vector · Feb 28 23:30 UTC</div>
            <div className="mt-1 grid grid-cols-3 gap-2 font-mono">
              <span className={locked === "A" ? "text-locked" : ""}>A · included</span>
              <span className={locked === "B" ? "text-locked" : ""}>B · excluded</span>
              <span className={locked === "C" ? "text-locked" : ""}>C · included</span>
            </div>
          </div>
          <div className="mt-4 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {locked
                ? "Contract locked. 5 test contracts ready."
                : "Select a contract to lock intended behavior."}
            </span>
            {locked && (
              <span className="inline-flex items-center gap-1 text-locked">
                <CheckCircle2 className="h-3.5 w-3.5" /> Ready
              </span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function Problem() {
  return (
    <Section id="problem" title="Valid code can still implement the wrong behavior.">
      <div className="grid gap-4 md:grid-cols-2">
        <Column
          tone="ambiguous"
          title="Silent interpretation"
          steps={[
            "Vague issue enters.",
            "Agent assumes details.",
            "Existing tests pass.",
            "Product behavior is wrong.",
          ]}
        />
        <Column
          tone="locked"
          title="Compiled contract"
          steps={[
            "Vague issue enters.",
            "Behavioral forks become visible.",
            "Human selects.",
            "Tests enforce the choice.",
          ]}
        />
      </div>
      <div className="mt-6 rounded-xl border border-border bg-surface p-5">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Example
        </div>
        <p className="mt-1 text-sm text-foreground/90">
          &ldquo;Users can export their monthly transactions.&rdquo;
          <span className="ml-2 text-muted-foreground">
            — timezone boundary and pending-state semantics are unresolved.
          </span>
        </p>
      </div>
    </Section>
  );
}

function Column({
  tone,
  title,
  steps,
}: {
  tone: "ambiguous" | "locked";
  title: string;
  steps: string[];
}) {
  const bar = tone === "ambiguous" ? "bg-ambiguous" : "bg-locked";
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 text-sm font-semibold">
        <span className={`h-2 w-2 rounded-full ${bar}`} aria-hidden />
        {title}
      </div>
      <ol className="mt-3 space-y-2">
        {steps.map((s, i) => (
          <li key={i} className="flex gap-3 text-sm">
            <span className="font-mono text-xs text-muted-foreground">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-foreground/90">{s}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}

function Loop() {
  const steps = [
    {
      title: "Scope the context",
      body: "You approve a small, sanitized set of file excerpts before anything is compiled.",
      icon: FileCode2,
    },
    {
      title: "Compare executable contracts",
      body: "The compiler outputs 2–3 candidate contracts with acceptance criteria and evidence.",
      icon: GitBranch,
    },
    {
      title: "Lock the intended behavior",
      body: "A human explicitly confirms one contract. The others remain visible, not deleted.",
      icon: Lock,
    },
    {
      title: "Generate tests and verify",
      body: "Codex materializes Vitest contracts, runs them, and records a decision receipt.",
      icon: TestTube2,
    },
  ];
  return (
    <Section id="how" title="Compile intent before implementation." kicker="The loop">
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {steps.map((s, i) => (
          <li key={i} className="rounded-xl border border-border bg-surface p-5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="font-mono">Step {String(i + 1).padStart(2, "0")}</span>
              <s.icon className="h-3.5 w-3.5" aria-hidden />
            </div>
            <div className="mt-3 text-base font-semibold">{s.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{s.body}</p>
          </li>
        ))}
      </ol>
    </Section>
  );
}

function MatrixSection() {
  const [active, setActive] = useState<string | undefined>("sc1");
  return (
    <Section
      id="matrix"
      title="The interpretations only matter if their behavior differs."
      kicker="Discriminating cases"
    >
      <DifferenceMatrix
        scenarios={GOLDEN_COMPILATION.scenarios}
        interpretations={GOLDEN_COMPILATION.interpretations}
        activeScenarioId={active}
        onSelectScenario={setActive}
      />
    </Section>
  );
}

function Layers() {
  const cards = [
    {
      title: "Codex",
      icon: Cpu,
      body: "Reads scoped repository context. Materializes tests locally. Runs and fixes code.",
    },
    {
      title: "GPT-5.6",
      icon: Workflow,
      body: "Compiles plausible contracts. Separates evidence from assumptions. Generates discriminating scenarios.",
    },
    {
      title: "Deterministic system",
      icon: ShieldCheck,
      body: "Validates schemas. Enforces state transitions. Hashes locked contracts. Records verification.",
    },
  ];
  return (
    <Section id="layers" title="Each layer has one job." kicker="Composition">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-surface p-5">
            <c.icon className="h-5 w-5 text-evidence" aria-hidden />
            <div className="mt-3 text-base font-semibold">{c.title}</div>
            <p className="mt-1 text-sm text-muted-foreground">{c.body}</p>
          </div>
        ))}
      </div>
      <p className="mt-4 text-xs text-muted-foreground">
        The MCP server is the authoritative state and tool layer between Codex, the model, and your
        workspace.
      </p>
    </Section>
  );
}

function Architecture() {
  const nodes = [
    "Codex plugin",
    "Scoped context",
    "MCP tools",
    "GPT-5.6 (structured outputs)",
    "Contract store",
    "Embedded comparison UI",
    "Local tests + receipt",
  ];
  return (
    <Section
      id="architecture"
      title="Built as a real Codex plugin, not a prompt wrapper."
      kicker="Architecture"
    >
      <div className="overflow-x-auto rounded-xl border border-border bg-surface p-5">
        <div className="flex min-w-[720px] items-center gap-3">
          {nodes.map((n, i) => (
            <div key={n} className="flex items-center gap-3">
              <div className="rounded-lg border border-border bg-elevated px-3 py-2 text-xs">
                <Server className="mb-1 h-3.5 w-3.5 text-evidence" aria-hidden />
                <div className="font-medium">{n}</div>
              </div>
              {i < nodes.length - 1 && <div className="branch-line h-px w-8" aria-hidden />}
            </div>
          ))}
        </div>
      </div>
      <details className="mt-3 text-sm text-muted-foreground">
        <summary className="cursor-pointer">Text alternative to diagram</summary>
        <ol className="mt-2 list-decimal space-y-1 pl-6">
          {nodes.map((n) => (
            <li key={n}>{n}</li>
          ))}
        </ol>
      </details>
    </Section>
  );
}

function Ambiguity() {
  const cards = [
    {
      title: "Boundary and time",
      q: "When does the period begin and end?",
      ex: '"monthly export" — user timezone vs. UTC vs. rolling 30 days.',
    },
    {
      title: "Authorization and actor",
      q: "Who can perform the action, and on whose resource?",
      ex: '"Admins can retry failed jobs" — any admin, or tenant admin only?',
    },
    {
      title: "Lifecycle and state",
      q: "What happens to pending, failed, cancelled or deleted records?",
      ex: '"Notify owner on completion" — success only, or any terminal state?',
    },
  ];
  return (
    <Section id="ambiguity" title="Supported ambiguity" kicker="Categories">
      <div className="grid gap-4 md:grid-cols-3">
        {cards.map((c) => (
          <div key={c.title} className="rounded-xl border border-border bg-surface p-5">
            <div className="text-base font-semibold">{c.title}</div>
            <p className="mt-2 text-sm text-foreground/90">{c.q}</p>
            <p className="mt-3 rounded-md border border-border bg-elevated p-2.5 font-mono text-xs text-muted-foreground">
              {c.ex}
            </p>
          </div>
        ))}
      </div>
    </Section>
  );
}

function Safety() {
  const items = [
    "Context preview before transmission",
    "Secret scanning on excerpts",
    "Excerpt and size limits",
    "No server-side code execution",
    "Human confirmation before selection",
    "No code edits before selection",
  ];
  return (
    <Section
      id="security"
      title="Your repository stays local. Only approved context leaves it."
      kicker="Safety"
    >
      <ul className="grid gap-3 sm:grid-cols-2">
        {items.map((i) => (
          <li
            key={i}
            className="flex items-start gap-2 rounded-lg border border-border bg-surface p-3 text-sm"
          >
            <ShieldCheck className="mt-0.5 h-4 w-4 text-locked" aria-hidden />
            {i}
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-muted-foreground">
        These are hardening measures, not absolute guarantees.
      </p>
    </Section>
  );
}

function ReceiptPreview() {
  return (
    <Section id="receipt" title="Every decision leaves a receipt." kicker="Decision receipt">
      <div className="rounded-xl border border-border bg-surface p-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
          <span className="font-mono">receipt · {GOLDEN_COMPILATION.contractHash}</span>
          <span className="font-mono">
            {GOLDEN_COMPILATION.source} · v{GOLDEN_COMPILATION.version}
          </span>
        </div>
        <div className="mt-3 grid gap-4 md:grid-cols-2">
          <div>
            <Field label="Requirement">{GOLDEN_COMPILATION.requirement}</Field>
            <Field label="Selected contract">
              Contract {GOLDEN_COMPILATION.selectedInterpretationId} ·{" "}
              {GOLDEN_COMPILATION.interpretations[0].title}
            </Field>
            <Field label="Rejected alternatives">
              {GOLDEN_COMPILATION.interpretations
                .slice(1)
                .map((i) => `${i.id} · ${i.title}`)
                .join(", ")}
            </Field>
          </div>
          <div>
            <Field label="Acceptance criteria">
              {GOLDEN_COMPILATION.interpretations[0].acceptance.map((a) => a.id).join(" · ")}
            </Field>
            <Field label="Tests">t1 · t2 · t3 · t4 · t5</Field>
            <Field label="Verification">
              {GOLDEN_COMPILATION.verification?.implementedPassed}/
              {(GOLDEN_COMPILATION.verification?.implementedPassed ?? 0) +
                (GOLDEN_COMPILATION.verification?.implementedFailed ?? 0)}{" "}
              passed in {GOLDEN_COMPILATION.verification?.durationMs}ms
            </Field>
          </div>
        </div>
      </div>
    </Section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-3">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm text-foreground/90">{children}</div>
    </div>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
      <div className="rounded-2xl border border-border bg-surface p-8 text-center sm:p-12">
        <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Make the decision explicit before the code makes it permanent.
        </h2>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Button asChild size="lg">
            <Link to="/demo">Run the live demo</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/docs/install">Install the Codex plugin</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function Section({
  id,
  title,
  kicker,
  children,
}: {
  id?: string;
  title: string;
  kicker?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mx-auto max-w-7xl scroll-mt-16 px-4 py-14 sm:px-6 sm:py-16">
      {kicker && (
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {kicker}
        </div>
      )}
      <h2 className="max-w-3xl text-2xl font-semibold leading-tight tracking-tight sm:text-3xl">
        {title}
      </h2>
      <div className="mt-6">{children}</div>
    </section>
  );
}
