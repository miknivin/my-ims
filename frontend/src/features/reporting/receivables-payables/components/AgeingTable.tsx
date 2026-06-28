import { AgeingBuckets, AgeingRow } from "@/redux/api/receivablesPayablesApi";
import { ReportLayout } from "@/features/reporting/components";

interface Props {
  rows: AgeingRow[];
  totals: AgeingBuckets | undefined;
  partyLabel: string;
  isLoading: boolean;
  isError: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TH = "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
const TD = "px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";
const TD_TOTAL = "px-3 py-3 text-right text-sm font-bold tabular-nums text-gray-800 dark:text-white/90";

export default function AgeingTable({ rows, totals, partyLabel, isLoading, isError }: Props) {
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
        description="Unable to fetch the ageing report. Please try again."
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
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[180px]">
            {partyLabel}
          </th>
          <th className={TH}>Current</th>
          <th className={TH}>1–30 Days</th>
          <th className={TH}>31–60 Days</th>
          <th className={TH}>61–90 Days</th>
          <th className={TH}>90+ Days</th>
          <th className={TH}>Total</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <tr key={row.partyId} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-white/90">
              {row.partyName}
            </td>
            <td className={TD}>{fmt(row.buckets.current)}</td>
            <td className={TD}>{fmt(row.buckets.days1To30)}</td>
            <td className={TD}>{fmt(row.buckets.days31To60)}</td>
            <td className={TD}>{fmt(row.buckets.days61To90)}</td>
            <td className={`${TD} ${row.buckets.over90 > 0 ? "text-red-600 dark:text-red-400 font-semibold" : ""}`}>
              {fmt(row.buckets.over90)}
            </td>
            <td className={`${TD} font-semibold text-gray-800 dark:text-white/90`}>
              {fmt(row.buckets.total)}
            </td>
          </tr>
        ))}
      </tbody>
      {totals && (
        <tfoot className="border-t-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50">
          <tr>
            <td className="px-3 py-3 text-left text-sm font-bold uppercase text-gray-800 dark:text-white/90">
              Grand Total
            </td>
            <td className={TD_TOTAL}>{fmt(totals.current)}</td>
            <td className={TD_TOTAL}>{fmt(totals.days1To30)}</td>
            <td className={TD_TOTAL}>{fmt(totals.days31To60)}</td>
            <td className={TD_TOTAL}>{fmt(totals.days61To90)}</td>
            <td className={TD_TOTAL}>{fmt(totals.over90)}</td>
            <td className={TD_TOTAL}>{fmt(totals.total)}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}
