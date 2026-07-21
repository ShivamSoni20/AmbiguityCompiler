import { cn } from "@/lib/utils";
import type { CompilationStatus } from "@/lib/ac/types";
import { STATUS_LABEL } from "@/lib/ac/types";
import {
  CheckCircle2,
  Circle,
  GitBranch,
  HelpCircle,
  Loader2,
  Lock,
  ShieldAlert,
  ScrollText,
  TestTube2,
  XCircle,
} from "lucide-react";

const CONFIG: Record<
  CompilationStatus,
  { icon: React.ComponentType<{ className?: string }>; tone: string }
> = {
  draft: { icon: Circle, tone: "bg-muted text-muted-foreground border-border" },
  compiling: { icon: Loader2, tone: "bg-evidence/10 text-evidence border-evidence/30" },
  needs_context: { icon: HelpCircle, tone: "bg-ambiguous/10 text-ambiguous border-ambiguous/30" },
  awaiting_selection: {
    icon: GitBranch,
    tone: "bg-ambiguous/10 text-ambiguous border-ambiguous/30",
  },
  contract_locked: { icon: Lock, tone: "bg-locked/10 text-locked border-locked/40" },
  tests_generated: { icon: TestTube2, tone: "bg-locked/10 text-locked border-locked/40" },
  verification_recorded: { icon: CheckCircle2, tone: "bg-locked/10 text-locked border-locked/40" },
  receipt_ready: { icon: ScrollText, tone: "bg-locked/10 text-locked border-locked/40" },
  failed: { icon: XCircle, tone: "bg-destructive/10 text-destructive border-destructive/40" },
};

export function StatusBadge({
  status,
  className,
}: {
  status: CompilationStatus;
  className?: string;
}) {
  const { icon: Icon, tone } = CONFIG[status] ?? {
    icon: ShieldAlert,
    tone: "bg-muted text-muted-foreground border-border",
  };
  return (
    <span
      role="status"
      aria-label={`Status: ${STATUS_LABEL[status]}`}
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium",
        tone,
        className,
      )}
    >
      <Icon className={cn("h-3.5 w-3.5", status === "compiling" && "animate-spin")} aria-hidden />
      <span>{STATUS_LABEL[status]}</span>
    </span>
  );
}
