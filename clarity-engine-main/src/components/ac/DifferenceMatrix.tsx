import type { DiscriminatingScenario, Interpretation, ScenarioOutcome } from "@/lib/ac/types";
import { cn } from "@/lib/utils";
import { CheckCircle2, Circle, AlertCircle, Inbox } from "lucide-react";

const OUTCOME: Record<
  ScenarioOutcome,
  { label: string; tone: string; Icon: React.ComponentType<{ className?: string }> }
> = {
  included: { label: "Included", tone: "text-locked bg-locked/10", Icon: CheckCircle2 },
  excluded: { label: "Excluded", tone: "text-muted-foreground bg-muted", Icon: Circle },
  error: { label: "Error", tone: "text-destructive bg-destructive/10", Icon: AlertCircle },
  empty: { label: "Empty", tone: "text-ambiguous bg-ambiguous/10", Icon: Inbox },
};

export function DifferenceMatrix({
  scenarios,
  interpretations,
  activeScenarioId,
  onSelectScenario,
}: {
  scenarios: DiscriminatingScenario[];
  interpretations: Interpretation[];
  activeScenarioId?: string;
  onSelectScenario?: (id: string) => void;
}) {
  if (scenarios.length === 0) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 text-sm text-muted-foreground">
        No discriminating scenarios available.
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* Desktop table */}
      <table className="hidden w-full text-sm md:table">
        <thead className="border-b border-border bg-elevated text-left text-xs uppercase tracking-wider text-muted-foreground">
          <tr>
            <th scope="col" className="w-2/5 px-4 py-3 font-medium">
              Discriminating scenario
            </th>
            {interpretations.map((i) => (
              <th key={i.id} scope="col" className="px-4 py-3 font-medium">
                <span className="font-mono">Contract {i.id}</span>
                <div className="mt-0.5 text-[11px] normal-case tracking-normal text-foreground/80">
                  {i.title}
                </div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s) => {
            const active = s.id === activeScenarioId;
            return (
              <tr
                key={s.id}
                className={cn(
                  "border-b border-border last:border-b-0 transition-colors",
                  onSelectScenario && "cursor-pointer hover:bg-elevated",
                  active && "bg-elevated",
                )}
                onClick={() => onSelectScenario?.(s.id)}
              >
                <th scope="row" className="px-4 py-3 text-left align-top font-medium">
                  <div>{s.name}</div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground">
                    {s.fixture}
                  </div>
                </th>
                {interpretations.map((i) => {
                  const cell = s.expected[i.id];
                  if (!cell)
                    return (
                      <td key={i.id} className="px-4 py-3 align-top text-muted-foreground">
                        —
                      </td>
                    );
                  const cfg = OUTCOME[cell.outcome];
                  return (
                    <td key={i.id} className="px-4 py-3 align-top">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-medium",
                          cfg.tone,
                        )}
                      >
                        <cfg.Icon className="h-3 w-3" aria-hidden />
                        {cfg.label}
                      </span>
                      <div className="mt-1 text-xs text-muted-foreground">{cell.note}</div>
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Mobile stacked cards */}
      <ul className="divide-y divide-border md:hidden">
        {scenarios.map((s) => (
          <li key={s.id} className="p-4">
            <button
              type="button"
              onClick={() => onSelectScenario?.(s.id)}
              className="w-full text-left"
              aria-expanded={s.id === activeScenarioId}
            >
              <div className="text-sm font-medium">{s.name}</div>
              <div className="mt-1 font-mono text-[11px] text-muted-foreground">{s.fixture}</div>
            </button>
            <ul className="mt-3 space-y-2">
              {interpretations.map((i) => {
                const cell = s.expected[i.id];
                if (!cell) return null;
                const cfg = OUTCOME[cell.outcome];
                return (
                  <li key={i.id} className="flex items-center justify-between gap-3 text-xs">
                    <span className="text-muted-foreground">
                      <span className="font-mono">Contract {i.id}</span> · {i.title}
                    </span>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded px-2 py-0.5 font-medium",
                        cfg.tone,
                      )}
                    >
                      <cfg.Icon className="h-3 w-3" />
                      {cfg.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  );
}
