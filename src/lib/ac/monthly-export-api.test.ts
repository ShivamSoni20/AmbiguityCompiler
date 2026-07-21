import { describe, expect, it } from "vitest";
import { exportMonthlyTransactions } from "./monthly-export-api";

describe("monthly transaction export", () => {
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
  });
});
