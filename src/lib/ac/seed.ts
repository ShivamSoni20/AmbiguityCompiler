import type { Compilation } from "./types";

const now = Date.now();
const iso = (daysAgo: number) => new Date(now - daysAgo * 86_400_000).toISOString();

export const GOLDEN_COMPILATION: Compilation = {
  id: "cmp_ac142",
  title: "Monthly transaction export",
  requirement: "Users can export their monthly transactions.",
  source: "AC-142",
  status: "receipt_ready",
  version: 3,
  updatedAt: iso(0),
  categories: ["boundary_time", "lifecycle_state"],
  context: [
    {
      id: "ctx1",
      path: "src/routes/exports.ts",
      anchor: "L18-L64",
      kind: "source",
      sanitized: true,
      excerpt: `router.post("/exports/monthly", async (req, res) => {\n  const { userId, month } = req.body;\n  // TODO: choose window semantics\n  const txns = await listTransactions(userId, month);\n  return res.json(toCsv(txns));\n});`,
    },
    {
      id: "ctx2",
      path: "src/domain/transaction.ts",
      anchor: "L4-L22",
      kind: "source",
      sanitized: true,
      excerpt: `export type TransactionState = "pending" | "posted" | "failed";\nexport interface Transaction {\n  id: string;\n  userId: string;\n  amount: number;\n  currency: string;\n  state: TransactionState;\n  occurredAt: string; // ISO-8601, UTC\n}`,
    },
    {
      id: "ctx3",
      path: "test/exports.test.ts",
      anchor: "L1-L20",
      kind: "test",
      sanitized: true,
      excerpt: `it("returns csv for a month", async () => {\n  const csv = await exportMonthly(user.id, "2025-03");\n  expect(csv.split("\\n").length).toBeGreaterThan(1);\n});`,
    },
    {
      id: "ctx4",
      path: "README.md",
      anchor: "domain-notes",
      kind: "doc",
      sanitized: true,
      excerpt: `All timestamps stored as UTC. Users configure a display timezone in settings; reports historically used the display timezone.`,
    },
  ],
  interpretations: [
    {
      id: "A",
      title: "Local calendar month",
      contract:
        "Export includes posted transactions whose occurredAt, when converted to the user's configured timezone, falls within the named calendar month. Pending transactions are excluded. Empty months return an empty CSV with a header row.",
      assumptions: [
        "User's display timezone is authoritative for reporting.",
        "Pending transactions are not yet real for the user.",
      ],
      acceptance: [
        {
          id: "AC1",
          text: "A transaction at March 1 00:15 in user timezone appears in March export.",
        },
        { id: "AC2", text: "Pending transactions never appear." },
        { id: "AC3", text: "An empty month returns a header-only CSV." },
      ],
      risk: "If chosen incorrectly, reports may double-count edge transactions vs. the accounting ledger which uses UTC.",
      evidence: [
        {
          path: "README.md",
          anchor: "domain-notes",
          quote: "reports historically used the display timezone",
        },
        {
          path: "src/domain/transaction.ts",
          anchor: "L4-L22",
          quote: 'state: "pending" | "posted" | "failed"',
        },
      ],
    },
    {
      id: "B",
      title: "UTC calendar month",
      contract:
        "Export includes posted transactions whose occurredAt falls within the UTC calendar month. Pending transactions are excluded. Empty months return an empty CSV with a header row.",
      assumptions: [
        "Ledger consistency with UTC storage is authoritative.",
        "Users understand that a boundary transaction may belong to a different month than their local clock.",
      ],
      acceptance: [
        {
          id: "AC1",
          text: "A transaction at March 1 00:15 user-local (Feb 28 in UTC) appears in the February export.",
        },
        { id: "AC2", text: "Pending transactions never appear." },
        { id: "AC3", text: "An empty month returns a header-only CSV." },
      ],
      risk: "Users comparing to a local bank statement may see discrepancies at month boundaries.",
      evidence: [
        {
          path: "src/domain/transaction.ts",
          anchor: "L4-L22",
          quote: "occurredAt: string; // ISO-8601, UTC",
        },
      ],
    },
    {
      id: "C",
      title: "Rolling 30 days",
      contract:
        "Export includes posted transactions with occurredAt within the past 30 days from request time. Pending transactions are excluded.",
      assumptions: ['"monthly" is interpreted as a 30-day window, not a calendar month.'],
      acceptance: [
        { id: "AC1", text: "Result depends on request timestamp, not a month identifier." },
        { id: "AC2", text: "Pending transactions never appear." },
      ],
      risk: "Diverges from user mental model of 'March export' and cannot be reproduced later.",
      evidence: [],
    },
  ],
  scenarios: [
    {
      id: "sc1",
      name: "March 1, 00:15 in user timezone (Feb 28 UTC)",
      fixture: '{ occurredAt: "2025-02-28T18:45:00Z", tz: "Asia/Kolkata" }',
      separates: "Interpretations A and B disagree on which month owns this transaction.",
      expected: {
        A: { outcome: "included", note: "In user-local March" },
        B: { outcome: "excluded", note: "In UTC February" },
        C: { outcome: "included", note: "Within last 30 days" },
      },
    },
    {
      id: "sc2",
      name: "Pending transaction inside window",
      fixture: '{ state: "pending", occurredAt: "2025-03-15T10:00:00Z" }',
      separates: "All contracts agree, but confirms lifecycle handling.",
      expected: {
        A: { outcome: "excluded", note: "Pending excluded" },
        B: { outcome: "excluded", note: "Pending excluded" },
        C: { outcome: "excluded", note: "Pending excluded" },
      },
    },
    {
      id: "sc3",
      name: "Exact month-end boundary",
      fixture: '{ occurredAt: "2025-03-31T23:59:59Z", tz: "UTC" }',
      separates: "A and B agree; C depends on request time.",
      expected: {
        A: { outcome: "included", note: "Last second of March" },
        B: { outcome: "included", note: "Last second of March UTC" },
        C: { outcome: "included", note: "If requested by April 30" },
      },
    },
    {
      id: "sc4",
      name: "Empty result month",
      fixture: '{ userId: "u1", month: "2024-11" }',
      separates: "Confirms empty-state shape.",
      expected: {
        A: { outcome: "empty", note: "Header-only CSV" },
        B: { outcome: "empty", note: "Header-only CSV" },
        C: { outcome: "empty", note: "Rolling window may be non-empty" },
      },
    },
  ],
  selectedInterpretationId: "A",
  contractHash: "sha256:9f2c…a41b",
  tests: [
    {
      id: "t1",
      name: "includes user-local boundary transaction",
      criterionId: "AC1",
      scenarioId: "sc1",
      result: "passed",
      code: `it("includes user-local boundary transaction", async () => {\n  const csv = await exportMonthly("u1", "2025-03", { tz: "Asia/Kolkata" });\n  expect(csv).toContain("txn_boundary");\n});`,
    },
    {
      id: "t2",
      name: "excludes pending transactions",
      criterionId: "AC2",
      scenarioId: "sc2",
      result: "passed",
      code: `it("excludes pending transactions", async () => {\n  const csv = await exportMonthly("u1", "2025-03");\n  expect(csv).not.toContain("txn_pending");\n});`,
    },
    {
      id: "t3",
      name: "empty month returns header-only csv",
      criterionId: "AC3",
      scenarioId: "sc4",
      result: "passed",
      code: `it("empty month returns header-only csv", async () => {\n  const csv = await exportMonthly("u1", "2024-11");\n  expect(csv.trim().split("\\n").length).toBe(1);\n});`,
    },
    {
      id: "t4",
      name: "month-end boundary included",
      criterionId: "AC1",
      scenarioId: "sc3",
      result: "passed",
      code: `it("month-end boundary included", async () => {\n  const csv = await exportMonthly("u1", "2025-03");\n  expect(csv).toContain("txn_month_end");\n});`,
    },
    {
      id: "t5",
      name: "rejects unsupported window keyword",
      criterionId: "AC1",
      scenarioId: "sc1",
      result: "passed",
      code: `it("rejects unsupported window keyword", async () => {\n  await expect(exportMonthly("u1", "rolling")).rejects.toThrow();\n});`,
    },
  ],
  verification: {
    baselinePassed: 3,
    baselineFailed: 2,
    implementedPassed: 5,
    implementedFailed: 0,
    durationMs: 412,
    patchHash: "sha256:71ee…c033",
  },
};

export const SEEDED_COMPILATIONS: Compilation[] = [
  GOLDEN_COMPILATION,
  {
    id: "cmp_ac155",
    title: "Admin retry for failed jobs",
    requirement: "Admins can retry failed background jobs.",
    source: "AC-155",
    status: "awaiting_selection",
    version: 1,
    updatedAt: iso(1),
    categories: ["authorization_actor", "lifecycle_state"],
    context: [],
    interpretations: [
      {
        id: "A",
        title: "Any admin can retry any failed job",
        contract:
          "A user with role=admin may POST /jobs/:id/retry when job.state === 'failed'. The retry re-enqueues with a new attempt number.",
        assumptions: ["'Admin' means role=admin in the user table."],
        acceptance: [{ id: "AC1", text: "Non-admin returns 403." }],
        risk: "Cross-tenant admins could retry other tenants' jobs.",
        evidence: [],
      },
      {
        id: "B",
        title: "Tenant admins retry only their own tenant's jobs",
        contract:
          "A user with role=admin may retry jobs where job.tenantId === user.tenantId and job.state === 'failed'.",
        assumptions: ["Multi-tenant isolation must hold for admins."],
        acceptance: [{ id: "AC1", text: "Admin from other tenant returns 404." }],
        risk: "May block platform staff from cross-tenant recovery.",
        evidence: [],
      },
    ],
    scenarios: [],
  },
  {
    id: "cmp_ac161",
    title: "Delete inactive accounts after 30 days",
    requirement: "Delete accounts that have been inactive for 30 days.",
    source: "AC-161",
    status: "needs_context",
    version: 1,
    updatedAt: iso(3),
    categories: ["boundary_time", "lifecycle_state"],
    context: [],
    interpretations: [],
    scenarios: [],
    questions: [
      "How is 'inactive' defined — no logins, no API calls, or no billable events?",
      "Should the 30-day window use the account's timezone, UTC, or the last-known session timezone?",
      "Is deletion a hard delete or a soft delete with retention?",
    ],
  },
  {
    id: "cmp_ac168",
    title: "Notify owner when processing completes",
    requirement: "Notify the resource owner when async processing completes.",
    source: "AC-168",
    status: "verification_recorded",
    version: 2,
    updatedAt: iso(5),
    categories: ["lifecycle_state"],
    context: [],
    interpretations: [
      {
        id: "A",
        title: "Notify on terminal success only",
        contract: "Send an in-app notification when job transitions to 'completed'.",
        assumptions: [],
        acceptance: [{ id: "AC1", text: "No notification on 'failed'." }],
        risk: "Owner unaware of failures.",
        evidence: [],
      },
      {
        id: "B",
        title: "Notify on any terminal state",
        contract: "Send an in-app notification when job transitions to 'completed' or 'failed'.",
        assumptions: [],
        acceptance: [{ id: "AC1", text: "Failure notifications include reason." }],
        risk: "Higher notification volume.",
        evidence: [],
      },
    ],
    scenarios: [],
    selectedInterpretationId: "B",
    verification: {
      baselinePassed: 1,
      baselineFailed: 1,
      implementedPassed: 3,
      implementedFailed: 1,
      durationMs: 260,
      patchHash: "sha256:aa11…ffcc",
    },
  },
];

const localCompilations: Compilation[] = [];

export function findCompilation(id: string): Compilation | undefined {
  return localCompilations.find((c) => c.id === id) ?? SEEDED_COMPILATIONS.find((c) => c.id === id);
}

export function createLocalCompilation(input: {
  title: string;
  requirement: string;
  source?: string;
  context: Compilation["context"];
}): Compilation {
  const normalizedRequirement = input.requirement.trim();
  const hasAuthorizationLanguage = /\b(admin|owner|user|permission|role|access)\b/i.test(
    normalizedRequirement,
  );
  const categories: Compilation["categories"] = hasAuthorizationLanguage
    ? ["boundary_time", "authorization_actor"]
    : ["boundary_time"];
  const evidence = input.context.slice(0, 2).map((excerpt) => ({
    path: excerpt.path,
    anchor: excerpt.anchor,
    quote: excerpt.excerpt.slice(0, 120).replace(/\s+/g, " "),
  }));
  const id = `cmp_local_${Date.now().toString(36)}`;
  const compilation: Compilation = {
    id,
    title: input.title.trim(),
    requirement: normalizedRequirement,
    source: input.source?.trim() || "LOCAL-DEMO",
    status: "awaiting_selection",
    version: 1,
    updatedAt: new Date().toISOString(),
    categories,
    context: input.context,
    interpretations: [
      {
        id: "A",
        title: "Named calendar period",
        contract:
          "Interpret the stated period as a calendar boundary in the relevant user or product timezone. Include only records in the requested calendar period.",
        assumptions: [
          "The requirement's period word refers to a named calendar period.",
          "The applicable timezone must be made explicit before implementation.",
        ],
        acceptance: [
          {
            id: "AC1",
            text: "A record at the start boundary belongs to the requested calendar period.",
          },
          { id: "AC2", text: "A record immediately before the start boundary is excluded." },
        ],
        risk: "Timezone or boundary assumptions can produce surprising results at the start and end of a period.",
        evidence,
      },
      {
        id: "B",
        title: "Rolling duration",
        contract:
          "Interpret the stated period as a rolling duration ending when the request is made. Include records within that elapsed-time window.",
        assumptions: [
          "The requirement describes elapsed time rather than a named calendar period.",
          "Request time is available and deterministic for tests.",
        ],
        acceptance: [
          { id: "AC1", text: "A record exactly inside the rolling duration is included." },
          { id: "AC2", text: "The same record can be excluded when the request time advances." },
        ],
        risk: "Results vary by request time and may not match a user's expectation of a named month or week.",
        evidence,
      },
    ],
    scenarios: [
      {
        id: "sc_boundary",
        name: "Record at a calendar boundary",
        fixture:
          '{ occurredAt: "2025-02-28T18:45:00Z", timezone: "Asia/Kolkata", requestedPeriod: "2025-03" }',
        separates:
          "Calendar membership and an elapsed-time window disagree around the period boundary.",
        expected: {
          A: {
            outcome: "included",
            note: "Included when the applicable calendar timezone places it in March.",
          },
          B: { outcome: "excluded", note: "Excluded when it falls outside the rolling window." },
        },
      },
      {
        id: "sc_request_time",
        name: "Same record, later request time",
        fixture: '{ occurredAt: "2025-03-01T00:00:00Z", requestedAt: "2025-03-31T00:00:01Z" }',
        separates: "Only a rolling-duration contract changes when request time changes.",
        expected: {
          A: { outcome: "included", note: "Calendar membership does not depend on request time." },
          B: { outcome: "excluded", note: "The rolling duration has elapsed." },
        },
      },
    ],
  };

  localCompilations.unshift(compilation);
  return compilation;
}

export function lockLocalCompilation(
  id: string,
  interpretationId: string,
): Compilation | undefined {
  const compilation = findCompilation(id);
  const chosen = compilation?.interpretations.find(
    (interpretation) => interpretation.id === interpretationId,
  );
  if (!compilation || !chosen) return undefined;

  compilation.selectedInterpretationId = chosen.id;
  compilation.contractHash = `local:${id.slice(-6)}:${chosen.id}`;
  compilation.status = "tests_generated";
  compilation.updatedAt = new Date().toISOString();
  compilation.tests = chosen.acceptance.map((criterion, index) => ({
    id: `tc_${chosen.id.toLowerCase()}_${index + 1}`,
    name: criterion.text.replace(/\.$/, "").toLowerCase(),
    criterionId: criterion.id,
    scenarioId: compilation.scenarios[index]?.id ?? compilation.scenarios[0]?.id ?? "manual",
    result: "pending",
    code: `it(${JSON.stringify(criterion.text)}, async () => {\n  // Arrange the fixture from ${compilation.scenarios[index]?.id ?? "the selected contract"}.\n  // Act through the repository's public API.\n  // Assert the locked Contract ${chosen.id} behavior.\n});`,
  }));
  return compilation;
}
