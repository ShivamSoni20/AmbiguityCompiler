type ContractTestCodeInput = {
  requirement: string;
  interpretationId: string;
  criterionId: string;
  criterionText: string;
  scenarioId: string;
};

export function buildContractTestCode(input: ContractTestCodeInput) {
  if (
    input.requirement.trim() === "Users can export their monthly transactions." &&
    input.interpretationId === "A" &&
    input.criterionId === "AC1"
  ) {
    return `import { expect, it } from "vitest";
import { exportMonthlyTransactions } from "@/lib/ac/monthly-export-api";

it("includes a record inside the requested month", () => {
  const boundaryTransaction = {
    id: "txn_local_march_boundary",
    occurredAt: "2025-02-28T18:45:00.000Z",
    status: "posted" as const,
    amountMinor: 2_500,
    currency: "USD",
  };

  const exported = exportMonthlyTransactions({
    month: "2025-03",
    timeZone: "Asia/Kolkata",
    transactions: [boundaryTransaction],
  });

  expect(exported.transactions).toEqual([boundaryTransaction]);
});`;
  }

  return `it(${JSON.stringify(input.criterionText)}, async () => {
  throw new Error("Implement the assertion for ${input.scenarioId} and Contract ${input.interpretationId}.");
});`;
}
