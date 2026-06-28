import { StockMovementRow } from "@/redux/api/inventoryReportsApi";
import { ReportLayout } from "@/features/reporting/components";

interface Props {
  rows: StockMovementRow[];
  openingQuantity: number | undefined;
  openingValue: number | undefined;
  isLoading: boolean;
  isError: boolean;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TH = "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
const TD = "px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";

const movementBadgeClass = (type: string) => {
  if (type === "Receipt" || type === "AdjustmentIn" || type === "TransferIn") {
    return "bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-400";
  }
  if (type === "Issue" || type === "AdjustmentOut" || type === "TransferOut") {
    return "bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-400";
  }
  return "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300";
};

export default function StockMovementTable({
  rows,
  openingQuantity,
  openingValue,
  isLoading,
  isError,
}: Props) {
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
        description="Unable to fetch stock movement. Please try again."
      />
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Date</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Movement</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Source</th>
          <th className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Warehouse</th>
          <th className={TH}>Qty Change</th>
          <th className={TH}>Rate</th>
          <th className={TH}>Value Change</th>
          <th className={TH}>Balance Qty</th>
          <th className={TH}>Balance Value</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        <tr className="bg-gray-50 dark:bg-gray-800/40">
          <td colSpan={7} className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
            Opening Balance
          </td>
          <td className={`${TD} font-semibold`}>{fmt(openingQuantity ?? 0)}</td>
          <td className={`${TD} font-semibold`}>{fmt(openingValue ?? 0)}</td>
        </tr>
        {rows.length === 0 ? (
          <tr>
            <td colSpan={9} className="px-6 py-10 text-center text-sm text-gray-400 dark:text-gray-500">
              No movement in this period.
            </td>
          </tr>
        ) : (
          rows.map((row) => (
            <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
              <td className="px-3 py-2.5 text-sm text-gray-600 dark:text-gray-300">
                {new Date(row.postingDateUtc).toLocaleDateString()}
              </td>
              <td className="px-3 py-2.5">
                <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${movementBadgeClass(row.movementType)}`}>
                  {row.movementType}
                </span>
              </td>
              <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.sourceType}</td>
              <td className="px-3 py-2.5 text-sm text-gray-500 dark:text-gray-400">{row.warehouseName ?? "—"}</td>
              <td className={`${TD} ${row.quantityChange < 0 ? "text-red-600 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}>
                {fmt(row.quantityChange)}
              </td>
              <td className={TD}>{fmt(row.valuationRate)}</td>
              <td className={`${TD} ${row.valueChange < 0 ? "text-red-600 dark:text-red-400" : "text-green-700 dark:text-green-400"}`}>
                {fmt(row.valueChange)}
              </td>
              <td className={`${TD} font-semibold text-gray-800 dark:text-white/90`}>{fmt(row.balanceQuantity)}</td>
              <td className={`${TD} font-semibold text-gray-800 dark:text-white/90`}>{fmt(row.balanceValue)}</td>
            </tr>
          ))
        )}
      </tbody>
    </table>
  );
}
