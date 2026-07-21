import type { Interpretation } from "@/lib/ac/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, FileText, Lock, ShieldAlert } from "lucide-react";

export function InterpretationCard({
  interp,
  selected,
  locked,
  disabled,
  onChoose,
  onInspect,
  compact,
}: {
  interp: Interpretation;
  selected?: boolean;
  locked?: boolean;
  disabled?: boolean;
  onChoose?: () => void;
  onInspect?: () => void;
  compact?: boolean;
}) {
  return (
    <article
      aria-labelledby={`interp-${interp.id}-title`}
      className={cn(
        "flex h-full flex-col rounded-xl border bg-surface p-4 transition-colors sm:p-5",
        selected
          ? "border-locked ring-1 ring-locked/40"
          : "border-border hover:border-border-strong",
        locked && !selected && "opacity-60",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Badge variant="outline" className="font-mono text-[10px]">
              Contract {interp.id}
            </Badge>
            {selected && (
              <span className="inline-flex items-center gap-1 text-locked">
                <Lock className="h-3 w-3" /> Locked
              </span>
            )}
            {locked && !selected && <span className="text-muted-foreground">Not selected</span>}
          </div>
          <h3
            id={`interp-${interp.id}-title`}
            className="mt-2 text-base font-semibold leading-tight"
          >
            {interp.title}
          </h3>
        </div>
      </div>

      <p className="mt-3 text-sm leading-relaxed text-foreground/90">{interp.contract}</p>

      {!compact && (
        <>
          {interp.assumptions.length > 0 && (
            <Section title="Assumptions">
              <ul className="space-y-1">
                {interp.assumptions.map((a, i) => (
                  <li key={i} className="flex gap-2 text-sm text-foreground/85">
                    <span
                      className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-ambiguous"
                      aria-hidden
                    />
                    {a}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {interp.acceptance.length > 0 && (
            <Section title="Acceptance criteria">
              <ul className="space-y-1">
                {interp.acceptance.map((a) => (
                  <li key={a.id} className="flex gap-2 text-sm">
                    <span className="mt-0.5 font-mono text-[11px] text-muted-foreground">
                      {a.id}
                    </span>
                    <span className="text-foreground/90">{a.text}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <Section title="Risk if wrong" icon={ShieldAlert}>
            <p className="text-sm text-foreground/85">{interp.risk}</p>
          </Section>

          {interp.evidence.length > 0 && (
            <Section title="Evidence" icon={FileText}>
              <ul className="space-y-1.5">
                {interp.evidence.map((e, i) => (
                  <li
                    key={i}
                    className="rounded-md border border-border bg-elevated px-2.5 py-1.5 text-xs"
                  >
                    <span className="font-mono text-evidence">
                      {e.path}:{e.anchor}
                    </span>
                    <span className="ml-2 text-muted-foreground">“{e.quote}”</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}
        </>
      )}

      <div className="mt-auto flex flex-wrap items-center gap-2 pt-4">
        {onInspect && (
          <Button variant="outline" size="sm" onClick={onInspect}>
            Inspect evidence
          </Button>
        )}
        {onChoose && !selected && (
          <Button size="sm" onClick={onChoose} disabled={disabled}>
            <Check className="mr-1.5 h-3.5 w-3.5" />
            Choose this contract
          </Button>
        )}
      </div>
    </article>
  );
}

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon?: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}) {
  return (
    <div className="mt-4">
      <h4 className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {Icon && <Icon className="h-3 w-3" aria-hidden />}
        {title}
      </h4>
      {children}
    </div>
  );
}
