// Core data contracts for Ambiguity Compiler.
// These mirror the MCP tool schemas — one source of truth for web + embedded UI.

export type CompilationStatus =
  | "draft"
  | "compiling"
  | "needs_context"
  | "awaiting_selection"
  | "contract_locked"
  | "tests_generated"
  | "verification_recorded"
  | "receipt_ready"
  | "failed";

export type AmbiguityCategory = "boundary_time" | "authorization_actor" | "lifecycle_state";

export interface ContextExcerpt {
  id: string;
  path: string;
  anchor: string;
  kind: "source" | "test" | "doc" | "config";
  sanitized: boolean;
  excerpt: string;
}

export interface EvidenceAnchor {
  path: string;
  anchor: string;
  quote: string;
}

export interface AcceptanceCriterion {
  id: string;
  text: string;
}

export interface Interpretation {
  id: string; // "A" | "B" | "C"
  title: string;
  contract: string;
  assumptions: string[];
  acceptance: AcceptanceCriterion[];
  risk: string;
  evidence: EvidenceAnchor[];
}

export type ScenarioOutcome = "included" | "excluded" | "error" | "empty";

export interface DiscriminatingScenario {
  id: string;
  name: string;
  fixture: string;
  separates: string;
  expected: Record<string, { outcome: ScenarioOutcome; note: string }>;
}

export interface TestContract {
  id: string;
  name: string;
  criterionId: string;
  scenarioId: string;
  code: string;
  result: "passed" | "failed" | "pending";
}

export interface VerificationRun {
  baselinePassed: number;
  baselineFailed: number;
  implementedPassed: number;
  implementedFailed: number;
  durationMs: number;
  patchHash: string;
}

export interface Compilation {
  id: string;
  title: string;
  requirement: string;
  source: string;
  status: CompilationStatus;
  version: number;
  updatedAt: string;
  categories: AmbiguityCategory[];
  context: ContextExcerpt[];
  interpretations: Interpretation[];
  scenarios: DiscriminatingScenario[];
  selectedInterpretationId?: string;
  contractHash?: string;
  tests?: TestContract[];
  verification?: VerificationRun;
  questions?: string[];
}

export const STATUS_LABEL: Record<CompilationStatus, string> = {
  draft: "Draft",
  compiling: "Compiling",
  needs_context: "Needs context",
  awaiting_selection: "Awaiting decision",
  contract_locked: "Contract locked",
  tests_generated: "Tests generated",
  verification_recorded: "Verification recorded",
  receipt_ready: "Receipt ready",
  failed: "Analysis failed",
};

export const CATEGORY_LABEL: Record<AmbiguityCategory, string> = {
  boundary_time: "Boundary & time",
  authorization_actor: "Authorization & actor",
  lifecycle_state: "Lifecycle & state",
};
