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
  timeZone: string,
) {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
  });
  return transactions.filter(
    (transaction) =>
      transaction.status === "posted" && toMonth(transaction.occurredAt, formatter) === month,
  );
}

function toMonth(occurredAt: string, formatter: Intl.DateTimeFormat) {
  const parts = formatter.formatToParts(new Date(occurredAt));
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) throw new Error("Unable to determine transaction month.");
  return `${year}-${month}`;
}
