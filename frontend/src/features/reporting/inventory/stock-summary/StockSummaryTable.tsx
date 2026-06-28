import { Fragment, useMemo } from "react";
import { StockSummaryRow } from "@/redux/api/inventoryReportsApi";
import { ReportLayout } from "@/features/reporting/components";

interface Props {
  rows: StockSummaryRow[];
  totalQuantity: number | undefined;
  totalValue: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });

const TH = "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
const TD = "px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";
const TD_TOTAL = "px-3 py-3 text-right text-sm font-bold tabular-nums text-gray-800 dark:text-white/90";

export default function StockSummaryTable({ rows, totalQuantity, totalValue, isLoading, isError }: Props) {
  const groups = useMemo(() => {
    const groupNames = [...new Set(rows.map((r) => r.categoryName ?? "Uncategorized"))];
    return groupNames.map((name) => ({
      name,
      rows: rows.filter((r) => (r.categoryName ?? "Uncategorized") === name),
    }));
  }, [rows]);

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
        description="Unable to fetch stock summary. Please try again."
      />
    );
  }

  if (rows.length === 0) {
    return (
      <ReportLayout.EmptyState
        title="No stock found"
        description="No items match the selected filters."
      />
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Code</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[200px]">Item Name</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">UOM</th>
          <th className={TH}>Quantity</th>
          <th className={TH}>Avg Rate</th>
          <th className={TH}>Value</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {groups.map((group) => (
          <Fragment key={group.name}>
            <tr className="bg-gray-100 dark:bg-gray-800/60">
              <td colSpan={6} className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                {group.name}
              </td>
            </tr>
            {group.rows.map((row) => (
              <tr key={row.itemId} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.itemCode}</td>
                <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-white/90">{row.itemName}</td>
                <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.uom}</td>
                <td className={TD}>{fmtQty(row.quantity)}</td>
                <td className={TD}>{fmt(row.averageRate)}</td>
                <td className={TD}>{fmt(row.value)}</td>
              </tr>
            ))}
            {group.rows.length > 1 && (
              <tr className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
                <td colSpan={3} className="px-3 py-2 pl-5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Total {group.name}
                </td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>
                  {fmtQty(group.rows.reduce((s, r) => s + r.quantity, 0))}
                </td>
                <td />
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>
                  {fmt(group.rows.reduce((s, r) => s + r.value, 0))}
                </td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50">
        <tr>
          <td colSpan={3} className="px-3 py-3 text-left text-sm font-bold uppercase text-gray-800 dark:text-white/90">
            Grand Total
          </td>
          <td className={TD_TOTAL}>{fmtQty(totalQuantity ?? 0)}</td>
          <td />
          <td className={TD_TOTAL}>{fmt(totalValue ?? 0)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
