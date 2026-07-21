import { expect, it } from "vitest";
import { exportMonthlyTransactions } from "../src/export-transactions";

it("includes a record inside the requested user-local month", () => {
  const boundaryTransaction = {
    id: "txn_local_march_boundary",
    occurredAt: "2025-02-28T18:45:00.000Z",
    status: "posted" as const,
    amountMinor: 2_500,
    currency: "USD",
  };

  const exported = exportMonthlyTransactions([boundaryTransaction], "2025-03", "Asia/Kolkata");

  expect(exported).toEqual([boundaryTransaction]);
});
