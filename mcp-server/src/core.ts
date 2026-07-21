import { createHash, randomUUID } from "node:crypto";
import OpenAI from "openai";
import { z } from "zod";

const categorySchema = z.enum(["boundary_time", "authorization_actor", "lifecycle_state"]);
const workspaceIdSchema = z.string().trim().min(1).max(120).default("default");
const contextSchema = z.object({
  path: z.string().min(1).max(260),
  anchor: z.string().min(1).max(120),
  kind: z.enum(["source", "test", "doc", "config"]),
  excerpt: z.string().min(1).max(4_000),
});

export const compileInputSchema = z.object({
  title: z.string().min(1).max(160).optional(),
  requirement: z.string().trim().min(10).max(5_000),
  source: z.string().max(120).optional(),
  context: z.array(contextSchema).max(12).default([]),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
});

const evidenceSchema = z.object({
  path: z.string().min(1).max(260),
  anchor: z.string().min(1).max(120),
  quote: z.string().max(240),
});
const acceptanceSchema = z.object({
  id: z.string().regex(/^AC[1-9][0-9]*$/),
  text: z.string().min(8).max(320),
});
const interpretationSchema = z.object({
  id: z.enum(["A", "B", "C"]),
  title: z.string().min(4).max(80),
  contract: z.string().min(24).max(700),
  assumptions: z.array(z.string().min(4).max(240)).max(5),
  acceptance: z.array(acceptanceSchema).min(1).max(5),
  risk: z.string().min(8).max(320),
  evidence: z.array(evidenceSchema).max(6),
});
const scenarioSchema = z.object({
  id: z.string().regex(/^sc_[a-z0-9_]+$/),
  name: z.string().min(4).max(120),
  fixture: z.string().min(2).max(800),
  separates: z.string().min(8).max(320),
  expected: z.record(
    z.enum(["A", "B", "C"]),
    z.object({
      outcome: z.enum(["included", "excluded", "error", "empty"]),
      note: z.string().min(3).max(200),
    }),
  ),
});
const contextAnswerSchema = z.object({
  question: z.string().min(8).max(280),
  answer: z.string().min(1).max(2_000),
});
const verificationSchema = z.object({
  framework: z.literal("vitest"),
  exitCode: z.number().int().min(0).max(255),
  passed: z.number().int().min(0),
  failed: z.number().int().min(0),
  durationMs: z.number().int().min(0),
  patchHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  selectedContractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  expectedVersion: z.number().int().min(1),
  idempotencyKey: z.string().trim().min(8).max(120).optional(),
  failureExcerpt: z.string().max(1_200).optional(),
});
const modelRunSchema = z.object({
  provider: z.enum(["openai", "openrouter", "fixture"]),
  model: z.string().min(1).max(160),
  mode: z.enum(["live", "deterministic_fixture"]),
  generatedAt: z.string().datetime(),
});
const auditEventSchema = z.object({
  event: z.enum(["compiled", "context_provided", "contract_selected", "verification_recorded"]),
  at: z.string().datetime(),
  version: z.number().int().min(1),
  actor: z.string().min(1).max(120),
});

export const modelOutputSchema = z.object({
  status: z.enum(["compiled", "needs_context"]),
  categories: z.array(categorySchema).max(3),
  interpretations: z.array(interpretationSchema).max(3),
  scenarios: z.array(scenarioSchema).max(8),
  questions: z.array(z.string().min(8).max(280)).max(3),
});

export type CompileInput = z.infer<typeof compileInputSchema>;
export type ModelOutput = z.infer<typeof modelOutputSchema>;
export type VerificationInput = z.infer<typeof verificationSchema>;
export type WorkspaceId = z.infer<typeof workspaceIdSchema>;
export type ModelRun = z.infer<typeof modelRunSchema>;

export type CompilationRecord = ModelOutput & {
  id: string;
  workspaceId: WorkspaceId;
  version: number;
  title: string;
  requirement: string;
  source?: string;
  context: CompileInput["context"];
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  selectedInterpretationId?: "A" | "B" | "C";
  selectedContractHash?: string;
  selectionNote?: string;
  verification?: VerificationInput;
  modelRun: ModelRun;
  audit: Array<z.infer<typeof auditEventSchema>>;
};

export const selectContractInputSchema = z.object({
  interpretationId: z.enum(["A", "B", "C"]),
  confirmation: z.literal(true),
  expectedVersion: z.number().int().min(1),
  note: z.string().trim().max(1_000).optional(),
  actor: z.string().trim().min(1).max(120).default("web-user"),
});
export const contextAnswersInputSchema = z.object({
  answers: z.array(contextAnswerSchema).min(1).max(3),
  expectedVersion: z.number().int().min(1),
  actor: z.string().trim().min(1).max(120).default("web-user"),
});
export const testContractInputSchema = z.object({
  targetFramework: z.literal("vitest"),
  expectedVersion: z.number().int().min(1),
  selectedContractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
});

const compilationStore = new Map<string, CompilationRecord>();
const likelySecretPattern =
  /(?:api[_-]?key|authorization|password|secret|token|private[_-]?key)\s*[:=]\s*["']?[^\s"']+|\bsk-[a-z0-9_-]{16,}\b|\bAKIA[0-9A-Z]{16}\b|\bgh[pousr]_[A-Za-z0-9]{20,}\b|\beyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9._-]+/i;
const defaultWorkspaceId = "default";

export async function compileRequirement(
  rawInput: unknown,
  rawWorkspaceId: unknown = defaultWorkspaceId,
): Promise<CompilationRecord> {
  const input = compileInputSchema.parse(rawInput);
  const workspaceId = workspaceIdSchema.parse(rawWorkspaceId);
  assertSafeContext(input.context);

  if (input.idempotencyKey) {
    const existing = [...compilationStore.values()].find(
      (record) =>
        record.workspaceId === workspaceId && record.idempotencyKey === input.idempotencyKey,
    );
    if (existing) return existing;
  }

  let output: ModelOutput;
  let modelRun: ModelRun;
  try {
    ({ output, modelRun } = await requestModelCompilation(input));
  } catch (error) {
    if (!isGoldenRequirement(input.requirement)) throw error;
    output = goldenFallback();
    modelRun = {
      provider: "fixture",
      model: "golden-monthly-export-v1",
      mode: "deterministic_fixture",
      generatedAt: new Date().toISOString(),
    };
  }

  validateSemantics(output, input.context);
  const now = new Date().toISOString();
  const record: CompilationRecord = {
    ...output,
    id: `cmp_${randomUUID().replaceAll("-", "").slice(0, 12)}`,
    workspaceId,
    version: 1,
    title: input.title ?? "Untitled compilation",
    requirement: input.requirement,
    source: input.source,
    context: input.context,
    idempotencyKey: input.idempotencyKey,
    createdAt: now,
    updatedAt: now,
    modelRun,
    audit: [{ event: "compiled", at: now, version: 1, actor: "compiler" }],
  };
  compilationStore.set(record.id, record);
  return record;
}

export function selectContract(
  id: string,
  rawInput: unknown,
  rawWorkspaceId: unknown = defaultWorkspaceId,
): CompilationRecord {
  const input = selectContractInputSchema.parse(rawInput);
  const record = getCompilation(id, rawWorkspaceId);
  assertExpectedVersion(record, input.expectedVersion);
  if (record.status !== "compiled")
    throw new Error("A contract cannot be selected until compilation succeeds.");
  if (!record.interpretations.some((item) => item.id === input.interpretationId))
    throw new Error("Unknown interpretation.");
  if (record.selectedInterpretationId && record.selectedInterpretationId !== input.interpretationId)
    throw new Error("A different contract is already locked for this compilation version.");

  const now = new Date().toISOString();
  record.selectedInterpretationId = input.interpretationId;
  record.selectionNote = input.note;
  record.version += 1;
  record.updatedAt = now;
  record.selectedContractHash = contractHash(record, input.interpretationId);
  record.audit.push({
    event: "contract_selected",
    at: now,
    version: record.version,
    actor: input.actor,
  });
  return record;
}

export async function provideContextAnswers(
  id: string,
  rawInput: unknown,
  rawWorkspaceId: unknown = defaultWorkspaceId,
): Promise<CompilationRecord> {
  const input = contextAnswersInputSchema.parse(rawInput);
  const record = getCompilation(id, rawWorkspaceId);
  assertExpectedVersion(record, input.expectedVersion);
  if (record.status !== "needs_context")
    throw new Error("Clarification answers are only accepted for a needs-context compilation.");
  const excerpt = input.answers
    .map((answer) => `Q: ${answer.question}\nA: ${answer.answer}`)
    .join("\n\n");
  assertSafeText(excerpt, "Clarification answers");
  const context = [
    ...record.context,
    {
      path: "ambiguity-compiler/clarification.md",
      anchor: `v${record.version + 1}`,
      kind: "doc" as const,
      excerpt,
    },
  ];

  let output: ModelOutput;
  let modelRun: ModelRun;
  try {
    ({ output, modelRun } = await requestModelCompilation({
      title: record.title,
      requirement: record.requirement,
      source: record.source,
      context,
    }));
  } catch (error) {
    if (!isGoldenRequirement(record.requirement)) throw error;
    output = goldenFallback();
    modelRun = {
      provider: "fixture",
      model: "golden-monthly-export-v1",
      mode: "deterministic_fixture",
      generatedAt: new Date().toISOString(),
    };
  }
  validateSemantics(output, context);

  const now = new Date().toISOString();
  record.status = output.status;
  record.categories = output.categories;
  record.interpretations = output.interpretations;
  record.scenarios = output.scenarios;
  record.questions = output.questions;
  record.context = context;
  record.modelRun = modelRun;
  record.version += 1;
  record.updatedAt = now;
  record.selectedInterpretationId = undefined;
  record.selectedContractHash = undefined;
  record.selectionNote = undefined;
  record.verification = undefined;
  record.audit.push({
    event: "context_provided",
    at: now,
    version: record.version,
    actor: input.actor,
  });
  return record;
}

export function generateTestContracts(
  id: string,
  rawInput: unknown,
  rawWorkspaceId: unknown = defaultWorkspaceId,
) {
  const input = testContractInputSchema.parse(rawInput);
  const record = getCompilation(id, rawWorkspaceId);
  assertExpectedVersion(record, input.expectedVersion);
  const selected = record.interpretations.find(
    (item) => item.id === record.selectedInterpretationId,
  );
  if (!selected || !record.selectedInterpretationId || !record.selectedContractHash)
    throw new Error("Select a contract before generating test contracts.");
  if (input.selectedContractHash !== record.selectedContractHash)
    throw new Error("Selected contract hash does not match the locked contract.");
  const testContracts = selected.acceptance.map((criterion, index) => ({
    id: `tc_${record.selectedInterpretationId!.toLowerCase()}_${index + 1}`,
    criterionId: criterion.id,
    scenarioId: record.scenarios[index]?.id ?? "manual",
    name: criterion.text,
    targetFramework: input.targetFramework,
    materialization:
      "Create a Vitest case that calls the target repository's public API and asserts this criterion.",
  }));
  return {
    compilationId: record.id,
    workspaceId: record.workspaceId,
    version: record.version,
    selectedContractHash: record.selectedContractHash,
    testContracts,
    traceability: testContracts.map(({ criterionId, id: testId, scenarioId }) => ({
      criterionId,
      testId,
      scenarioId,
    })),
  };
}

export function renderCompilation(
  id: string,
  view: "compact" | "compare" | "cases" | "receipt" = "compare",
  rawWorkspaceId: unknown = defaultWorkspaceId,
) {
  const record = getCompilation(id, rawWorkspaceId);
  return {
    compilationId: record.id,
    workspaceId: record.workspaceId,
    version: record.version,
    view,
    compilation: view === "receipt" ? buildReceipt(id, rawWorkspaceId) : record,
  };
}

export function recordVerification(
  id: string,
  rawVerification: unknown,
  rawWorkspaceId: unknown = defaultWorkspaceId,
): CompilationRecord {
  const record = getCompilation(id, rawWorkspaceId);
  const verification = verificationSchema.parse(rawVerification);
  assertExpectedVersion(record, verification.expectedVersion);
  if (!record.selectedInterpretationId || !record.selectedContractHash)
    throw new Error("Select a contract before recording verification.");
  if (verification.selectedContractHash !== record.selectedContractHash)
    throw new Error("Verification does not reference the locked contract hash.");
  if (verification.failureExcerpt)
    assertSafeText(verification.failureExcerpt, "Verification excerpt");
  if (
    record.verification?.idempotencyKey &&
    record.verification.idempotencyKey === verification.idempotencyKey
  )
    return record;
  if (record.verification)
    throw new Error(
      "Verification is already recorded. Create a new compilation version to rerun it.",
    );

  const now = new Date().toISOString();
  record.verification = verification;
  record.version += 1;
  record.updatedAt = now;
  record.audit.push({
    event: "verification_recorded",
    at: now,
    version: record.version,
    actor: "verifier",
  });
  return record;
}

export function getCompilation(
  id: string,
  rawWorkspaceId: unknown = defaultWorkspaceId,
): CompilationRecord {
  const workspaceId = workspaceIdSchema.parse(rawWorkspaceId);
  const record = compilationStore.get(id);
  if (!record || record.workspaceId !== workspaceId) throw new Error("Compilation not found.");
  return record;
}

export function listCompilations(
  rawWorkspaceId: unknown = defaultWorkspaceId,
): CompilationRecord[] {
  const workspaceId = workspaceIdSchema.parse(rawWorkspaceId);
  return [...compilationStore.values()]
    .filter((record) => record.workspaceId === workspaceId)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt));
}

export function listAllCompilations(): CompilationRecord[] {
  return [...compilationStore.values()].sort((left, right) =>
    right.updatedAt.localeCompare(left.updatedAt),
  );
}

const persistedRecordSchema = modelOutputSchema.extend({
  id: z.string().min(1),
  workspaceId: workspaceIdSchema,
  version: z.number().int().min(1),
  title: z.string().min(1).max(160),
  requirement: z.string().min(10).max(5_000),
  source: z.string().max(120).optional(),
  context: z.array(contextSchema).max(12),
  idempotencyKey: z.string().min(8).max(120).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime().optional(),
  selectedInterpretationId: z.enum(["A", "B", "C"]).optional(),
  selectedContractHash: z
    .string()
    .regex(/^sha256:[a-f0-9]{64}$/)
    .optional(),
  selectionNote: z.string().max(1_000).optional(),
  verification: verificationSchema.optional(),
  modelRun: modelRunSchema.optional(),
  audit: z.array(auditEventSchema).optional(),
});

export function replaceCompilationStore(rawRecords: unknown) {
  const records = z.array(persistedRecordSchema).parse(rawRecords);
  compilationStore.clear();
  for (const stored of records) {
    const record: CompilationRecord = {
      ...stored,
      workspaceId: stored.workspaceId ?? defaultWorkspaceId,
      updatedAt: stored.updatedAt ?? stored.createdAt,
      modelRun: stored.modelRun ?? {
        provider: "fixture",
        model: "legacy-record",
        mode: "deterministic_fixture",
        generatedAt: stored.createdAt,
      },
      audit: stored.audit ?? [],
    };
    if (record.selectedInterpretationId && !record.selectedContractHash) {
      record.selectedContractHash = contractHash(record, record.selectedInterpretationId);
    }
    compilationStore.set(record.id, record);
  }
}

export function buildReceipt(id: string, rawWorkspaceId: unknown = defaultWorkspaceId) {
  const record = getCompilation(id, rawWorkspaceId);
  const selected = record.interpretations.find(
    (item) => item.id === record.selectedInterpretationId,
  );
  return {
    compilationId: record.id,
    workspaceId: record.workspaceId,
    version: record.version,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    requirement: record.requirement,
    context: record.context.map(({ path, anchor, kind }) => ({ path, anchor, kind })),
    categories: record.categories,
    interpretations: record.interpretations,
    selectedContract: selected ? { ...selected, hash: record.selectedContractHash ?? null } : null,
    rejectedContracts: record.selectedInterpretationId
      ? record.interpretations.filter((item) => item.id !== record.selectedInterpretationId)
      : [],
    scenarios: record.scenarios,
    verification: record.verification ?? null,
    model: record.modelRun,
    audit: record.audit,
    limitations: [
      "Records persist to the configured local JSON data store; no multi-user database or retention policy is included in this prototype.",
      "Only caller-supplied, scoped context is analyzed and likely secrets are rejected before model invocation.",
    ],
  };
}

export function resetCompilationStore() {
  compilationStore.clear();
}

function assertExpectedVersion(record: CompilationRecord, expectedVersion: number) {
  if (record.version !== expectedVersion)
    throw new Error(
      `Version conflict: expected v${expectedVersion}, current version is v${record.version}.`,
    );
}

function contractHash(record: CompilationRecord, interpretationId: "A" | "B" | "C") {
  const interpretation = record.interpretations.find((item) => item.id === interpretationId);
  if (!interpretation) throw new Error("Unknown interpretation.");
  return `sha256:${createHash("sha256")
    .update(
      JSON.stringify({
        compilationId: record.id,
        workspaceId: record.workspaceId,
        lockedAtVersion: record.version,
        interpretationId,
        contract: interpretation.contract,
        acceptance: interpretation.acceptance,
      }),
    )
    .digest("hex")}`;
}

function assertSafeContext(context: CompileInput["context"]) {
  for (const item of context)
    assertSafeText(item.excerpt, `Context excerpt at ${item.path}:${item.anchor}`);
}

function assertSafeText(value: string, label: string) {
  if (likelySecretPattern.test(value))
    throw new Error(`${label} appears to contain a secret. Remove it before analysis.`);
}

async function requestModelCompilation(
  input: CompileInput,
): Promise<{ output: ModelOutput; modelRun: ModelRun }> {
  const provider = resolveProvider();
  if (provider === "openai") return requestOpenAiCompilation(input);
  return requestOpenRouterCompilation(input);
}

function resolveProvider(): "openai" | "openrouter" {
  const configured = process.env.AMBIGUITY_COMPILER_MODEL_PROVIDER?.trim().toLowerCase();
  if (configured === "openai" || configured === "openrouter") return configured;
  if (process.env.OPENAI_API_KEY) return "openai";
  return "openrouter";
}

async function requestOpenAiCompilation(
  input: CompileInput,
): Promise<{ output: ModelOutput; modelRun: ModelRun }> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY is required when the OpenAI provider is selected.");
  const model = process.env.OPENAI_MODEL ?? "gpt-5.6";
  const client = new OpenAI({ apiKey, timeout: 30_000, maxRetries: 2 });
  const response = await client.responses.create({
    model,
    instructions: systemPrompt(),
    input: JSON.stringify(input),
    text: {
      format: {
        type: "json_schema",
        name: "ambiguity_compilation",
        strict: true,
        schema: modelJsonSchema,
      },
    },
  });
  if (!response.output_text) throw new Error("OpenAI returned no structured content.");
  return {
    output: parseModelOutput(response.output_text),
    modelRun: { provider: "openai", model, mode: "live", generatedAt: new Date().toISOString() },
  };
}

async function requestOpenRouterCompilation(
  input: CompileInput,
): Promise<{ output: ModelOutput; modelRun: ModelRun }> {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    throw new Error("OPENROUTER_API_KEY is required when the OpenRouter provider is selected.");
  const model = process.env.OPENROUTER_MODEL ?? "openai/gpt-5.6-sol";
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.OPENROUTER_SITE_URL ?? "http://localhost:3001",
      "X-Title": "Ambiguity Compiler",
    },
    signal: AbortSignal.timeout(30_000),
    body: JSON.stringify({
      model,
      messages: [
        { role: "system", content: systemPrompt() },
        { role: "user", content: JSON.stringify(input) },
      ],
      response_format: {
        type: "json_schema",
        json_schema: { name: "ambiguity_compilation", strict: true, schema: modelJsonSchema },
      },
      provider: { require_parameters: true },
    }),
  });
  if (!response.ok) {
    const detail = await readOpenRouterError(response);
    throw new Error(`OpenRouter API failed with status ${response.status}: ${detail}`);
  }
  const payload = (await response.json()) as {
    choices?: Array<{ message?: { content?: string | Array<{ text?: string }> } }>;
  };
  const content = payload.choices?.[0]?.message?.content;
  const output =
    typeof content === "string" ? content : content?.map((part) => part.text ?? "").join("");
  if (!output) throw new Error("OpenRouter returned no structured content.");
  return {
    output: parseModelOutput(output),
    modelRun: {
      provider: "openrouter",
      model,
      mode: "live",
      generatedAt: new Date().toISOString(),
    },
  };
}

function parseModelOutput(rawOutput: string): ModelOutput {
  const parsed = JSON.parse(rawOutput) as unknown;
  return modelOutputSchema.parse(normalizeModelOutput(parsed));
}

function normalizeModelOutput(value: unknown): unknown {
  if (!isPlainObject(value)) return value;
  return {
    ...value,
    interpretations: Array.isArray(value.interpretations)
      ? value.interpretations.map((interpretation) => {
          if (!isPlainObject(interpretation) || !Array.isArray(interpretation.acceptance))
            return interpretation;
          return {
            ...interpretation,
            acceptance: interpretation.acceptance.map((criterion, index) =>
              isPlainObject(criterion) ? { ...criterion, id: `AC${index + 1}` } : criterion,
            ),
          };
        })
      : value.interpretations,
    scenarios: Array.isArray(value.scenarios)
      ? value.scenarios.map((scenario) => {
          if (!isPlainObject(scenario) || !isPlainObject(scenario.expected)) return scenario;
          return {
            ...scenario,
            expected: Object.fromEntries(
              Object.entries(scenario.expected).filter(([, outcome]) => outcome !== null),
            ),
          };
        })
      : value.scenarios,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function readOpenRouterError(response: Response): Promise<string> {
  const body = await response.text();
  let detail = body;
  try {
    const parsed = JSON.parse(body) as { error?: { message?: unknown }; message?: unknown };
    detail =
      typeof parsed.error?.message === "string"
        ? parsed.error.message
        : typeof parsed.message === "string"
          ? parsed.message
          : body;
  } catch {
    detail = body;
  }
  const sanitized = detail
    .replace(/Bearer\s+\S+/gi, "Bearer [redacted]")
    .replace(/sk-[A-Za-z0-9_-]{8,}/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim();
  return sanitized.slice(0, 500) || "No error detail returned.";
}

function validateSemantics(output: ModelOutput, context: CompileInput["context"]) {
  if (output.status === "needs_context") {
    if (
      output.questions.length === 0 ||
      output.interpretations.length > 0 ||
      output.scenarios.length > 0
    )
      throw new Error("needs_context requires targeted questions only.");
    return;
  }
  if (output.interpretations.length < 2)
    throw new Error("A compiled result requires two or three interpretations.");
  if (output.questions.length > 0)
    throw new Error("Compiled results cannot include clarification questions.");
  const identifiers = output.interpretations.map((item) => item.id);
  if (new Set(identifiers).size !== identifiers.length)
    throw new Error("Interpretation identifiers must be unique.");
  const criteria = output.interpretations.map((item) =>
    item.acceptance.map((criterion) => criterion.text.trim().toLowerCase()).join("|"),
  );
  if (new Set(criteria).size !== criteria.length)
    throw new Error("Interpretations must have distinct acceptance criteria.");
  const anchors = new Set(context.map((item) => `${item.path}:${item.anchor}`));
  for (const interpretation of output.interpretations) {
    for (const evidence of interpretation.evidence) {
      if (!anchors.has(`${evidence.path}:${evidence.anchor}`))
        throw new Error("Model cited context that was not supplied.");
    }
  }
  for (let left = 0; left < identifiers.length; left += 1) {
    for (let right = left + 1; right < identifiers.length; right += 1) {
      const separated = output.scenarios.some(
        (scenario) =>
          scenario.expected[identifiers[left]]?.outcome !==
          scenario.expected[identifiers[right]]?.outcome,
      );
      if (!separated)
        throw new Error(
          `No discriminating scenario for ${identifiers[left]} and ${identifiers[right]}.`,
        );
    }
  }
}

function isGoldenRequirement(requirement: string) {
  return requirement.trim() === "Users can export their monthly transactions.";
}

function goldenFallback(): ModelOutput {
  return {
    status: "compiled",
    categories: ["boundary_time", "lifecycle_state"],
    questions: [],
    interpretations: [
      {
        id: "A",
        title: "User-local calendar month",
        contract:
          "Export posted transactions that fall in the named calendar month in the user's display timezone.",
        assumptions: ["Display timezone is the reporting timezone."],
        acceptance: [
          { id: "AC1", text: "A user-local March boundary transaction is included in March." },
        ],
        risk: "UTC ledger reports may differ at the boundary.",
        evidence: [],
      },
      {
        id: "B",
        title: "UTC calendar month",
        contract: "Export posted transactions that fall in the named UTC calendar month.",
        assumptions: ["UTC storage is the reporting authority."],
        acceptance: [{ id: "AC1", text: "A UTC-February transaction is excluded from March." }],
        risk: "Local statements may not match the exported period.",
        evidence: [],
      },
    ],
    scenarios: [
      {
        id: "sc_timezone_boundary",
        name: "Timezone month boundary",
        fixture: '{ occurredAt: "2025-02-28T18:45:00Z", timezone: "Asia/Kolkata" }',
        separates: "The same instant falls in different calendar dates.",
        expected: {
          A: { outcome: "included", note: "It is March in the user timezone." },
          B: { outcome: "excluded", note: "It is February in UTC." },
        },
      },
    ],
  };
}

function systemPrompt() {
  return "You compile underspecified software requirements into behaviorally different contracts. Return only the requested JSON. Never reveal chain-of-thought or write implementation code. Use only the supplied context; do not invent repository facts. Support only boundary_time, authorization_actor, lifecycle_state. Return compiled with exactly two or three interpretations only when each is evidence-grounded and every pair has a differing scenario outcome. Number each interpretation's acceptance IDs AC1, AC2, and so on. For every scenario, include expected.A, expected.B, and expected.C; use null for an ID that is not one of the returned interpretations. Otherwise return needs_context with one to three targeted questions and no interpretations or scenarios.";
}

const modelJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: ["status", "categories", "interpretations", "scenarios", "questions"],
  properties: {
    status: { type: "string", enum: ["compiled", "needs_context"] },
    categories: {
      type: "array",
      items: { type: "string", enum: ["boundary_time", "authorization_actor", "lifecycle_state"] },
    },
    interpretations: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "title", "contract", "assumptions", "acceptance", "risk", "evidence"],
        properties: {
          id: { type: "string", enum: ["A", "B", "C"] },
          title: { type: "string" },
          contract: { type: "string" },
          assumptions: { type: "array", items: { type: "string" } },
          acceptance: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["id", "text"],
              properties: {
                id: { type: "string", pattern: "^AC[1-9][0-9]*$" },
                text: { type: "string" },
              },
            },
          },
          risk: { type: "string" },
          evidence: {
            type: "array",
            items: {
              type: "object",
              additionalProperties: false,
              required: ["path", "anchor", "quote"],
              properties: {
                path: { type: "string" },
                anchor: { type: "string" },
                quote: { type: "string" },
              },
            },
          },
        },
      },
    },
    scenarios: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "name", "fixture", "separates", "expected"],
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          fixture: { type: "string" },
          separates: { type: "string" },
          expected: {
            type: "object",
            additionalProperties: false,
            required: ["A", "B", "C"],
            properties: {
              A: { anyOf: [{ $ref: "#/$defs/outcome" }, { type: "null" }] },
              B: { anyOf: [{ $ref: "#/$defs/outcome" }, { type: "null" }] },
              C: { anyOf: [{ $ref: "#/$defs/outcome" }, { type: "null" }] },
            },
          },
        },
      },
    },
    questions: { type: "array", items: { type: "string" } },
  },
  $defs: {
    outcome: {
      type: "object",
      additionalProperties: false,
      required: ["outcome", "note"],
      properties: {
        outcome: { type: "string", enum: ["included", "excluded", "error", "empty"] },
        note: { type: "string" },
      },
    },
  },
};
