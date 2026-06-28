import {
  JournalEntryRow,
  JournalEntryTotals,
} from "@/redux/api/journalEntryApi";
import { Link } from "react-router";

interface JournalEntryTableProps {
  rows: JournalEntryRow[];
  totals?: JournalEntryTotals;
  isLoading: boolean;
  isError: boolean;
}

export default function JournalEntryTable({
  rows,
  totals,
  isLoading,
  isError,
}: JournalEntryTableProps) {
  return (
    <div className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead className="bg-gray-50 dark:bg-white/[0.02]">
            <tr>
              {[
                "Date",
                "Voucher No",
                "Source",
                "Ledger",
                "Narration",
                "Debit",
                "Credit",
                "Status",
              ].map((header) => (
                <th
                  key={header}
                  className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                >
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {isLoading ? (
              <EmptyRow message="Loading journal entries..." />
            ) : isError ? (
              <EmptyRow message="Unable to load journal entries." isError />
            ) : rows.length === 0 ? (
              <EmptyRow message="No journal entries found." />
            ) : (
              rows.map((row) => (
                <tr key={row.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.postingDate}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                    <Link
                      to={`/operations/accounting/journal-vouchers/${row.journalVoucherId}`}
                      className="text-brand-600 hover:underline dark:text-brand-400"
                    >
                      {row.voucherNo}
                    </Link>
                    <span className="ml-2 text-xs font-normal text-gray-400">
                      #{row.lineNo}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {row.source}
                    </span>
                  </td>
                  <td className="min-w-64 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="font-medium text-gray-900 dark:text-white">
                      {row.ledgerName}
                    </span>
                    {row.ledgerCode ? (
                      <span className="ml-2 text-xs text-gray-400">
                        {row.ledgerCode}
                      </span>
                    ) : null}
                  </td>
                  <td className="min-w-72 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.narration || "-"}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                    {formatAmount(row.debitAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                    {formatAmount(row.creditAmount)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                    {row.status}
                  </td>
                </tr>
              ))
            )}
          </tbody>
          <tfoot className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
            <tr>
              <td
                colSpan={5}
                className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white"
              >
                Total
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                {formatAmount(totals?.debitAmount ?? 0)}
              </td>
              <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                {formatAmount(totals?.creditAmount ?? 0)}
              </td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

function EmptyRow({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <tr>
      <td
        colSpan={8}
        className={`px-4 py-8 text-center text-sm ${
          isError ? "text-error-500" : "text-gray-500 dark:text-gray-400"
        }`}
      >
        {message}
      </td>
    </tr>
  );
}

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
