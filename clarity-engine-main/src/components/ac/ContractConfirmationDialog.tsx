import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Interpretation } from "@/lib/ac/types";

export function ContractConfirmationDialog({
  open,
  onOpenChange,
  chosen,
  rejected,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  chosen?: Interpretation;
  rejected: Interpretation[];
  onConfirm: (note: string) => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  const [note, setNote] = useState("");

  if (!chosen) return null;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) {
          setConfirmed(false);
          setNote("");
        }
      }}
    >
      <AlertDialogContent className="max-w-lg">
        <AlertDialogHeader>
          <AlertDialogTitle>
            Lock contract {chosen.id}: {chosen.title}
          </AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-sm">
              <p className="text-foreground/90">{chosen.contract}</p>
              {rejected.length > 0 && (
                <div className="rounded-md border border-border bg-elevated p-3">
                  <div className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    Not selected
                  </div>
                  <ul className="space-y-1 text-xs">
                    {rejected.map((r) => (
                      <li key={r.id}>
                        <span className="font-mono text-muted-foreground">Contract {r.id}</span> ·{" "}
                        {r.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div>
                <Label
                  htmlFor="decision-note"
                  className="text-xs uppercase tracking-wider text-muted-foreground"
                >
                  Decision note (optional)
                </Label>
                <Textarea
                  id="decision-note"
                  className="mt-1.5"
                  placeholder="e.g. Matches accounting policy in Q1 2025."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  id="confirm-check"
                  checked={confirmed}
                  onCheckedChange={(v) => setConfirmed(v === true)}
                />
                <span>I confirm this is the behavior Codex should implement.</span>
              </label>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            disabled={!confirmed}
            onClick={(e) => {
              if (!confirmed) {
                e.preventDefault();
                return;
              }
              onConfirm(note);
            }}
          >
            Lock contract
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
