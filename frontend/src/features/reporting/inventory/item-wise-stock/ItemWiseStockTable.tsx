import { ItemWiseStockRow } from "@/redux/api/inventoryReportsApi";
import { ReportLayout } from "@/features/reporting/components";

interface Props {
  rows: ItemWiseStockRow[];
  totalClosingQty: number | undefined;
  totalClosingValue: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

const fmtQty = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 3 });
const fmtVal = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TH = "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
const TD = "px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";
const TD_TOTAL = "px-3 py-3 text-right text-sm font-bold tabular-nums text-gray-800 dark:text-white/90";

export default function ItemWiseStockTable({ rows, totalClosingQty, totalClosingValue, isLoading, isError }: Props) {
  if (isLoading) {
    return <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">Loading…</div>;
  }

  if (isError) {
    return (
      <ReportLayout.EmptyState title="Failed to load" description="Unable to fetch item-wise stock. Please try again." />
    );
  }

  if (rows.length === 0) {
    return (
      <ReportLayout.EmptyState title="No stock found" description="No items match the selected filters." />
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Code</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[160px]">Item Name</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">UOM</th>
          <th className={TH}>Opening</th>
          <th className={TH}>Inward</th>
          <th className={TH}>Outward</th>
          <th className={TH}>Closing</th>
          <th className={TH}>Unit Cost</th>
          <th className={TH}>Value</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {rows.map((row) => (
          <tr key={row.itemId} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
            <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.itemCode}</td>
            <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-white/90">{row.itemName}</td>
            <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.uom}</td>
            <td className={TD}>{fmtQty(row.openingQty)}</td>
            <td className={TD}>{fmtQty(row.inwardQty)}</td>
            <td className={TD}>{fmtQty(row.outwardQty)}</td>
            <td className={`${TD} font-medium text-gray-800 dark:text-white/90`}>{fmtQty(row.closingQty)}</td>
            <td className={TD}>{fmtVal(row.closingRate)}</td>
            <td className={`${TD} font-medium text-gray-800 dark:text-white/90`}>{fmtVal(row.closingValue)}</td>
          </tr>
        ))}
      </tbody>
      <tfoot className="border-t-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50">
        <tr>
          <td colSpan={6} className="px-3 py-3 text-left text-sm font-bold uppercase text-gray-800 dark:text-white/90">
            Grand Total
          </td>
          <td className={TD_TOTAL}>{fmtQty(totalClosingQty ?? 0)}</td>
          <td />
          <td className={TD_TOTAL}>{fmtVal(totalClosingValue ?? 0)}</td>
        </tr>
      </tfoot>
    </table>
  );
}
