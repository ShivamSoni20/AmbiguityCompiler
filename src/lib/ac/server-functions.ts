import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import type { Compilation, CompilationStatus, ContextExcerpt, Interpretation } from "./types";
import { buildContractTestCode } from "./contract-test-code";
import {
  buildReceipt,
  compileInputSchema,
  compileRequirement,
  contextAnswersInputSchema,
  generateTestContracts,
  getCompilation,
  listCompilations,
  provideContextAnswers,
  recordVerification,
  selectContract,
  selectContractInputSchema,
  testContractInputSchema,
  type CompilationRecord,
} from "../../../mcp-server/src/core";
import {
  hydrateCompilationStore,
  persistCompilationStore,
} from "../../../mcp-server/src/persistence";

const workspaceId = process.env.AMBIGUITY_COMPILER_WORKSPACE_ID ?? "default";
const idSchema = z.object({ id: z.string().min(1) });
const selectSchema = z.object({
  id: z.string().min(1),
  ...selectContractInputSchema.shape,
});
const contextSchema = z.object({
  id: z.string().min(1),
  ...contextAnswersInputSchema.shape,
});
const testSchema = z.object({
  id: z.string().min(1),
  ...testContractInputSchema.shape,
});
const verificationSchema = z.object({
  id: z.string().min(1),
  framework: z.literal("vitest"),
  exitCode: z.number().int().min(0).max(255),
  passed: z.number().int().min(0),
  failed: z.number().int().min(0),
  durationMs: z.number().int().min(0),
  patchHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  selectedContractHash: z.string().regex(/^sha256:[a-f0-9]{64}$/),
  expectedVersion: z.number().int().min(1),
  idempotencyKey: z.string().min(8).max(120).optional(),
  failureExcerpt: z.string().max(1_200).optional(),
});

let mutationQueue = Promise.resolve();

export const compileCompilation = createServerFn({ method: "POST" })
  .validator(compileInputSchema)
  .handler(async ({ data }) =>
    toCompilation(await mutate(() => compileRequirement(data, workspaceId))),
  );

export const getCompilationById = createServerFn({ method: "GET" })
  .validator(idSchema)
  .handler(async ({ data }) =>
    toCompilation(await read(() => getCompilation(data.id, workspaceId))),
  );

export const listCompilationRecords = createServerFn({ method: "GET" }).handler(async () =>
  (await read(() => listCompilations(workspaceId))).map(toCompilation),
);

export const selectCompilationContract = createServerFn({ method: "POST" })
  .validator(selectSchema)
  .handler(async ({ data }) => {
    const { id, ...input } = data;
    return toCompilation(await mutate(() => selectContract(id, input, workspaceId)));
  });

export const provideCompilationContext = createServerFn({ method: "POST" })
  .validator(contextSchema)
  .handler(async ({ data }) => {
    const { id, ...input } = data;
    return toCompilation(await mutate(() => provideContextAnswers(id, input, workspaceId)));
  });

export const generateCompilationTests = createServerFn({ method: "POST" })
  .validator(testSchema)
  .handler(async ({ data }) => {
    const { id, ...input } = data;
    return read(() => generateTestContracts(id, input, workspaceId));
  });

export const getCompilationReceipt = createServerFn({ method: "GET" })
  .validator(idSchema)
  .handler(({ data }) => read(() => buildReceipt(data.id, workspaceId)));

export const recordCompilationVerification = createServerFn({ method: "POST" })
  .validator(verificationSchema)
  .handler(async ({ data }) => {
    const { id, ...verification } = data;
    return toCompilation(await mutate(() => recordVerification(id, verification, workspaceId)));
  });

async function read<T>(operation: () => T | Promise<T>): Promise<T> {
  await hydrateCompilationStore();
  return operation();
}

async function mutate<T>(operation: () => T | Promise<T>): Promise<T> {
  const run = async () => {
    await hydrateCompilationStore();
    const result = await operation();
    await persistCompilationStore();
    return result;
  };
  const result = mutationQueue.then(run, run);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

function toCompilation(record: CompilationRecord): Compilation {
  const selected = record.selectedInterpretationId;
  const status: CompilationStatus =
    record.status === "needs_context"
      ? "needs_context"
      : record.verification
        ? "verification_recorded"
        : selected
          ? "tests_generated"
          : "awaiting_selection";
  const context: ContextExcerpt[] = record.context.map((excerpt, index) => ({
    id: `ctx_${index + 1}`,
    path: excerpt.path,
    anchor: excerpt.anchor,
    kind: excerpt.kind,
    sanitized: true,
    excerpt: excerpt.excerpt,
  }));
  const interpretations: Interpretation[] = record.interpretations;
  const selectedInterpretation = interpretations.find((item) => item.id === selected);
  return {
    id: record.id,
    title: record.title,
    requirement: record.requirement,
    source: record.source ?? "—",
    status,
    version: record.version,
    updatedAt: record.updatedAt,
    categories: record.categories,
    context,
    interpretations,
    scenarios: record.scenarios,
    selectedInterpretationId: selected,
    contractHash: record.selectedContractHash,
    questions: record.questions,
    tests: selectedInterpretation
      ? selectedInterpretation.acceptance.map((criterion, index) => ({
          id: `tc_${selected.toLowerCase()}_${index + 1}`,
          name: criterion.text.replace(/\.$/, "").toLowerCase(),
          criterionId: criterion.id,
          scenarioId: record.scenarios[index]?.id ?? "manual",
          result: record.verification
            ? record.verification.failed === 0
              ? ("passed" as const)
              : ("failed" as const)
            : ("pending" as const),
          code: buildContractTestCode({
            requirement: record.requirement,
            interpretationId: selected,
            criterionId: criterion.id,
            criterionText: criterion.text,
            scenarioId: record.scenarios[index]?.id ?? "the selected contract",
          }),
        }))
      : undefined,
    verification: record.verification
      ? {
          baselinePassed: 0,
          baselineFailed: 0,
          implementedPassed: record.verification.passed,
          implementedFailed: record.verification.failed,
          durationMs: record.verification.durationMs,
          patchHash: record.verification.patchHash,
        }
      : undefined,
  };
}
