import { afterEach, describe, expect, it } from "vitest";
import {
  buildReceipt,
  compileRequirement,
  generateTestContracts,
  provideContextAnswers,
  recordVerification,
  replaceCompilationStore,
  resetCompilationStore,
  selectContract,
} from "./core";

const originalOpenRouterKey = process.env.OPENROUTER_API_KEY;
const originalOpenAiKey = process.env.OPENAI_API_KEY;
const originalProvider = process.env.AMBIGUITY_COMPILER_MODEL_PROVIDER;

afterEach(() => {
  resetCompilationStore();
  restoreEnv("OPENROUTER_API_KEY", originalOpenRouterKey);
  restoreEnv("OPENAI_API_KEY", originalOpenAiKey);
  restoreEnv("AMBIGUITY_COMPILER_MODEL_PROVIDER", originalProvider);
});

describe("Ambiguity Compiler core lifecycle", () => {
  it("compiles, requires explicit confirmation, locks a hash, and records verification", async () => {
    useFixtureMode();
    const compilation = await compileRequirement({
      requirement: "Users can export their monthly transactions.",
      idempotencyKey: "compile-monthly-export-001",
    });

    expect(compilation.version).toBe(1);
    expect(compilation.modelRun.mode).toBe("deterministic_fixture");
    expect(compilation.scenarios[0].fixture).toContain("Asia/Kolkata");
    expect(() =>
      selectContract(compilation.id, {
        interpretationId: "A",
        confirmation: false,
        expectedVersion: 1,
      }),
    ).toThrow();

    const selected = selectContract(compilation.id, {
      interpretationId: "A",
      confirmation: true,
      expectedVersion: 1,
      note: "User-visible reporting time is authoritative.",
    });
    expect(selected.version).toBe(2);
    expect(selected.selectedContractHash).toMatch(/^sha256:[a-f0-9]{64}$/);

    const testContracts = generateTestContracts(compilation.id, {
      targetFramework: "vitest",
      expectedVersion: selected.version,
      selectedContractHash: selected.selectedContractHash!,
    });
    expect(testContracts.testContracts).toHaveLength(1);
    expect(testContracts.traceability[0]).toMatchObject({
      criterionId: "AC1",
      scenarioId: "sc_timezone_boundary",
    });

    const verified = recordVerification(compilation.id, {
      framework: "vitest",
      exitCode: 0,
      passed: 1,
      failed: 0,
      durationMs: 17,
      patchHash: `sha256:${"a".repeat(64)}`,
      selectedContractHash: selected.selectedContractHash,
      expectedVersion: selected.version,
      idempotencyKey: "verify-monthly-export-001",
    });
    expect(verified.version).toBe(3);
    expect(buildReceipt(compilation.id).verification).toMatchObject({ passed: 1, failed: 0 });
  });

  it("rejects stale versions and mismatched hashes before mutation", async () => {
    useFixtureMode();
    const compilation = await compileRequirement({
      requirement: "Users can export their monthly transactions.",
    });
    const selected = selectContract(compilation.id, {
      interpretationId: "A",
      confirmation: true,
      expectedVersion: 1,
    });

    expect(() =>
      selectContract(compilation.id, {
        interpretationId: "A",
        confirmation: true,
        expectedVersion: 1,
      }),
    ).toThrow("Version conflict");
    expect(() =>
      generateTestContracts(compilation.id, {
        targetFramework: "vitest",
        expectedVersion: selected.version,
        selectedContractHash: `sha256:${"b".repeat(64)}`,
      }),
    ).toThrow("Selected contract hash");
    expect(() =>
      recordVerification(compilation.id, {
        framework: "vitest",
        exitCode: 0,
        passed: 1,
        failed: 0,
        durationMs: 1,
        patchHash: `sha256:${"c".repeat(64)}`,
        selectedContractHash: `sha256:${"b".repeat(64)}`,
        expectedVersion: selected.version,
      }),
    ).toThrow("does not reference");
  });

  it("returns the same compile result for the same workspace idempotency key", async () => {
    useFixtureMode();
    const input = {
      requirement: "Users can export their monthly transactions.",
      idempotencyKey: "compile-monthly-export-002",
    };
    const first = await compileRequirement(input, "workspace-a");
    const second = await compileRequirement(input, "workspace-a");
    const otherWorkspace = await compileRequirement(input, "workspace-b");

    expect(second.id).toBe(first.id);
    expect(otherWorkspace.id).not.toBe(first.id);
  });

  it("derives a locked hash when hydrating a legacy selected record", async () => {
    useFixtureMode();
    const compilation = await compileRequirement({
      requirement: "Users can export their monthly transactions.",
    });
    const selected = selectContract(compilation.id, {
      interpretationId: "A",
      confirmation: true,
      expectedVersion: 1,
    });

    replaceCompilationStore([{ ...selected, selectedContractHash: undefined }]);

    expect(buildReceipt(compilation.id).selectedContract).toMatchObject({
      hash: expect.stringMatching(/^sha256:[a-f0-9]{64}$/),
    });
  });

  it("rejects likely secrets in context and verification excerpts", async () => {
    useFixtureMode();
    await expect(
      compileRequirement({
        requirement: "Users can export their monthly transactions.",
        context: [
          {
            path: "src/config.ts",
            anchor: "L1",
            kind: "source",
            excerpt: "OPENAI_API_KEY=sk-this-is-not-safe-to-share",
          },
        ],
      }),
    ).rejects.toThrow("appears to contain a secret");

    const compilation = await compileRequirement({
      requirement: "Users can export their monthly transactions.",
    });
    const selected = selectContract(compilation.id, {
      interpretationId: "A",
      confirmation: true,
      expectedVersion: 1,
    });
    expect(() =>
      recordVerification(compilation.id, {
        framework: "vitest",
        exitCode: 1,
        passed: 0,
        failed: 1,
        durationMs: 1,
        patchHash: `sha256:${"d".repeat(64)}`,
        selectedContractHash: selected.selectedContractHash,
        expectedVersion: selected.version,
        failureExcerpt: "Authorization: Bearer sk-not-for-storage",
      }),
    ).toThrow("appears to contain a secret");
  });

  it("recompiles a needs-context record into a new version", async () => {
    useFixtureMode();
    replaceCompilationStore([
      {
        id: "cmp_needs_context",
        workspaceId: "default",
        version: 1,
        title: "Monthly transaction export",
        requirement: "Users can export their monthly transactions.",
        context: [],
        createdAt: "2026-07-19T00:00:00.000Z",
        updatedAt: "2026-07-19T00:00:00.000Z",
        status: "needs_context",
        categories: ["boundary_time"],
        interpretations: [],
        scenarios: [],
        questions: ["Which timezone defines a monthly export?"],
      },
    ]);

    const compilation = await provideContextAnswers("cmp_needs_context", {
      expectedVersion: 1,
      answers: [
        {
          question: "Which timezone defines a monthly export?",
          answer: "Use the user's display timezone.",
        },
      ],
    });

    expect(compilation.version).toBe(2);
    expect(compilation.status).toBe("compiled");
    expect(compilation.context).toHaveLength(1);
  });
});

function useFixtureMode() {
  delete process.env.OPENROUTER_API_KEY;
  delete process.env.OPENAI_API_KEY;
  process.env.AMBIGUITY_COMPILER_MODEL_PROVIDER = "openrouter";
}

function restoreEnv(key: string, value: string | undefined) {
  if (value === undefined) delete process.env[key];
  else process.env[key] = value;
}
