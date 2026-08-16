import { Fragment, useMemo } from "react";
import { StockStatementRow } from "@/redux/api/inventoryReportsApi";
import { ReportLayout } from "@/features/reporting/components";

interface Props {
  rows: StockStatementRow[];
  groupBy: "category" | "warehouse";
  totalOpeningValue: number | undefined;
  totalInwardValue: number | undefined;
  totalOutwardValue: number | undefined;
  totalClosingValue: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const fmtQty = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });

const TH = "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap";
const TD = "px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";
const TD_TOTAL = "px-3 py-3 text-right text-sm font-bold tabular-nums text-gray-800 dark:text-white/90";

const EXTRA_COLS = 1; // Category column shown in warehouse mode

export default function StockStatementTable({
  rows, groupBy,
  totalOpeningValue, totalInwardValue, totalOutwardValue, totalClosingValue,
  isLoading, isError,
}: Props) {
  const showCategoryCol = groupBy === "warehouse";
  const totalCols = 4 + (showCategoryCol ? 1 : 0) + 9; // fixed + optional + data cols

  const groups = useMemo(() => {
    const key = (r: StockStatementRow) =>
      groupBy === "warehouse"
        ? (r.warehouseName ?? "Unknown Warehouse")
        : (r.categoryName ?? "Uncategorized");
    const names = [...new Set(rows.map(key))];
    return names.map((name) => ({ name, rows: rows.filter((r) => key(r) === name) }));
  }, [rows, groupBy]);

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
        description="Unable to fetch stock statement. Please try again."
      />
    );
  }

  if (rows.length === 0) {
    return (
      <ReportLayout.EmptyState
        title="No data found"
        description="No stock activity matches the selected period and filters."
      />
    );
  }

  const sumField = (arr: StockStatementRow[], field: keyof StockStatementRow) =>
    arr.reduce((s, r) => s + (r[field] as number), 0);

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Code</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[180px] whitespace-nowrap">Item Name</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">UOM</th>
          {showCategoryCol && (
            <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 whitespace-nowrap">Category</th>
          )}
          <th className={TH}>Opening Qty</th>
          <th className={TH}>Opening Value</th>
          <th className={TH}>Inward Qty</th>
          <th className={TH}>Inward Value</th>
          <th className={TH}>Outward Qty</th>
          <th className={TH}>Outward Value</th>
          <th className={TH}>Closing Qty</th>
          <th className={TH}>Closing Rate</th>
          <th className={TH}>Closing Value</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {groups.map((group) => (
          <Fragment key={group.name}>
            <tr className="bg-gray-100 dark:bg-gray-800/60">
              <td colSpan={totalCols} className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300">
                {group.name}
              </td>
            </tr>
            {group.rows.map((row) => (
              <tr key={`${row.itemId}-${row.warehouseName ?? ""}`} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.itemCode}</td>
                <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-white/90">{row.itemName}</td>
                <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.uom}</td>
                {showCategoryCol && (
                  <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">
                    {row.categoryName ?? "—"}
                  </td>
                )}
                <td className={TD}>{fmtQty(row.openingQty)}</td>
                <td className={TD}>{fmt(row.openingValue)}</td>
                <td className={TD}>{fmtQty(row.inwardQty)}</td>
                <td className={TD}>{fmt(row.inwardValue)}</td>
                <td className={TD}>{fmtQty(row.outwardQty)}</td>
                <td className={TD}>{fmt(row.outwardValue)}</td>
                <td className={TD}>{fmtQty(row.closingQty)}</td>
                <td className={TD}>{fmt(row.closingRate)}</td>
                <td className={TD}>{fmt(row.closingValue)}</td>
              </tr>
            ))}
            {group.rows.length > 1 && (
              <tr className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30">
                <td colSpan={3 + (showCategoryCol ? 1 : 0)} className="px-3 py-2 pl-5 text-xs font-semibold text-gray-600 dark:text-gray-300">
                  Total {group.name}
                </td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmtQty(sumField(group.rows, "openingQty"))}</td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmt(sumField(group.rows, "openingValue"))}</td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmtQty(sumField(group.rows, "inwardQty"))}</td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmt(sumField(group.rows, "inwardValue"))}</td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmtQty(sumField(group.rows, "outwardQty"))}</td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmt(sumField(group.rows, "outwardValue"))}</td>
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmtQty(sumField(group.rows, "closingQty"))}</td>
                <td />
                <td className={`${TD} font-semibold text-gray-600 dark:text-gray-300`}>{fmt(sumField(group.rows, "closingValue"))}</td>
              </tr>
            )}
          </Fragment>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50">
        <tr>
          <td colSpan={3 + (showCategoryCol ? 1 : 0)} className="px-3 py-3 text-left text-sm font-bold uppercase text-gray-800 dark:text-white/90">
            Grand Total
          </td>
          <td className={TD_TOTAL} colSpan={2}>{fmt(totalOpeningValue ?? 0)}</td>
          <td className={TD_TOTAL} colSpan={2}>{fmt(totalInwardValue ?? 0)}</td>
          <td className={TD_TOTAL} colSpan={2}>{fmt(totalOutwardValue ?? 0)}</td>
          <td className={TD_TOTAL} colSpan={3}>{fmt(totalClosingValue ?? 0)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
