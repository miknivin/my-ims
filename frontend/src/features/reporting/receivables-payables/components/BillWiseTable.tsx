import { BillWiseRow, BillWiseTotals } from "@/redux/api/receivablesPayablesApi";
import { ReportLayout } from "@/features/reporting/components";

interface Props {
  rows: BillWiseRow[];
  totals: BillWiseTotals | undefined;
  partyLabel: string;
  isLoading: boolean;
  isError: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TH = "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
const TD = "px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";
const TD_TOTAL = "px-3 py-3 text-right text-sm font-bold tabular-nums text-gray-800 dark:text-white/90";

const statusBadgeClass = (status: string) =>
  status === "Submitted"
    ? "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400"
    : status === "Cancelled"
      ? "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400"
      : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";

export default function BillWiseTable({ rows, totals, partyLabel, isLoading, isError }: Props) {
  if (isLoading) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <ReportLayout.EmptyState
        title="Failed to load"
        description="Unable to fetch the report. Please try again."
      />
    );
  }

  if (rows.length === 0) {
    return (
      <ReportLayout.EmptyState
        title="No outstanding bills"
        description="There are no outstanding bills as of the selected date."
      />
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Document No</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Due Date</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[160px]">{partyLabel}</th>
          <th className={TH}>Invoice Amount</th>
          <th className={TH}>Paid</th>
          <th className={TH}>Balance</th>
          <th className={TH}>Overdue Days</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-white/90">{row.documentNo}</td>
            <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{row.documentDate}</td>
            <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">{row.dueDate}</td>
            <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-white/90">{row.partyName}</td>
            <td className={TD}>{fmt(row.invoiceAmount)}</td>
            <td className={TD}>{fmt(row.paidAmount)}</td>
            <td className={`${TD} font-semibold text-gray-800 dark:text-white/90`}>{fmt(row.balanceAmount)}</td>
            <td
              className={`${TD} ${
                row.overdueDays > 90
                  ? "font-semibold text-red-600 dark:text-red-400"
                  : row.overdueDays > 0
                    ? "text-amber-600 dark:text-amber-400"
                    : ""
              }`}
            >
              {row.overdueDays}
            </td>
            <td className="px-3 py-2.5">
              <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadgeClass(row.status)}`}>
                {row.status}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
      {totals && (
        <tfoot className="border-t-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50">
          <tr>
            <td colSpan={4} className="px-3 py-3 text-left text-sm font-bold uppercase text-gray-800 dark:text-white/90">
              Grand Total
            </td>
            <td className={TD_TOTAL}>{fmt(totals.invoiceAmount)}</td>
            <td className={TD_TOTAL}>{fmt(totals.paidAmount)}</td>
            <td className={TD_TOTAL}>{fmt(totals.balanceAmount)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      )}
    </table>
  );
}
