export type Transaction = {
  id: string;
  occurredAt: string;
  status: "pending" | "posted" | "reversed";
  amountMinor: number;
  currency: string;
};

export function exportMonthlyTransactions(
  transactions: Transaction[],
  month: string,
  _timeZone: string,
) {
  return transactions.filter(
    (transaction) =>
      transaction.status === "posted" && transaction.occurredAt.slice(0, 7) === month,
  );
}
