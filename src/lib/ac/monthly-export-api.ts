import { z } from "zod";

const transactionSchema = z.object({
  id: z.string().min(1),
  occurredAt: z.string().datetime(),
  status: z.enum(["pending", "posted", "reversed"]),
  amountMinor: z.number().int(),
  currency: z.string().length(3),
});

export const monthlyExportRequestSchema = z.object({
  month: z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/),
  timeZone: z.string().min(1),
  transactions: z.array(transactionSchema),
});

export type MonthlyExportRequest = z.infer<typeof monthlyExportRequestSchema>;

export type MonthlyExport = Pick<MonthlyExportRequest, "month" | "timeZone"> & {
  transactions: MonthlyExportRequest["transactions"];
};

const monthFormatters = new Map<string, Intl.DateTimeFormat>();

export function exportMonthlyTransactions(rawRequest: unknown): MonthlyExport {
  const request = monthlyExportRequestSchema.parse(rawRequest);
  const formatter = getMonthFormatter(request.timeZone);
  return {
    month: request.month,
    timeZone: request.timeZone,
    transactions: request.transactions.filter(
      (transaction) =>
        transaction.status === "posted" &&
        monthForDate(new Date(transaction.occurredAt), formatter) === request.month,
    ),
  };
}

function getMonthFormatter(timeZone: string) {
  let formatter = monthFormatters.get(timeZone);
  if (!formatter) {
    formatter = new Intl.DateTimeFormat("en-US", {
      timeZone,
      year: "numeric",
      month: "2-digit",
    });
    monthFormatters.set(timeZone, formatter);
  }
  return formatter;
}

function monthForDate(date: Date, formatter: Intl.DateTimeFormat) {
  const parts = formatter.formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  if (!year || !month) throw new Error("Unable to determine the transaction month.");
  return `${year}-${month}`;
}
