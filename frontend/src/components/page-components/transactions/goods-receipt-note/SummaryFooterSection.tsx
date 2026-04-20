import TransactionSummarySection, {
  TransactionSummaryMetric,
  TransactionSummaryTab,
} from "../shared/TransactionSummarySection";
import { useGoodsReceiptForm } from "./GoodsReceiptFormContext";

const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const metricInputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function SummaryFooterSection() {
  const { state, setGeneral, setFooter } = useGoodsReceiptForm();

  const tabs: TransactionSummaryTab[] = [
    {
      key: "general",
      label: "General",
      content: (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div>
            <label className={labelClass}>Taxable Mode</label>
            <select
              className={inputClass}
              value={state.general.taxableMode}
              onChange={(event) =>
                setGeneral({
                  taxableMode: event.target.value as "Taxable" | "NonTaxable",
                })
              }
            >
              <option value="Taxable">Taxable</option>
              <option value="NonTaxable">Non-Taxable</option>
            </select>
          </div>

          <div className="flex items-end">
            <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
              <input
                type="checkbox"
                className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                checked={state.general.ownProductsOnly}
                onChange={(event) =>
                  setGeneral({ ownProductsOnly: event.target.checked })
                }
              />
              Own products only
            </label>
          </div>
        </div>
      ),
    },
    {
      key: "remarks",
      label: "Remarks",
      content: (
        <div>
          <label className={labelClass}>Notes</label>
          <textarea
            rows={6}
            className={areaClass}
            value={state.general.notes}
            onChange={(event) => setGeneral({ notes: event.target.value })}
            placeholder="Receipt remarks, quality note, or receiving context..."
          />
        </div>
      ),
    },
  ];

  const metrics: TransactionSummaryMetric[] = [
    { key: "totalQty", label: "Total Qty", value: state.footer.totalQty.toFixed(2) },
    { key: "totalFoc", label: "Total FOC", value: state.footer.totalFoc.toFixed(2) },
    { key: "totalAmount", label: "Total Amount", value: state.footer.totalAmount.toFixed(2) },
    {
      key: "addition",
      label: "Addition",
      content: (
        <input
          className={metricInputClass}
          type="number"
          step="0.01"
          value={state.footer.addition}
          onChange={(event) => setFooter({ addition: event.target.value })}
        />
      ),
    },
    {
      key: "discountFooter",
      label: "Discount",
      content: (
        <input
          className={metricInputClass}
          type="number"
          step="0.01"
          value={state.footer.discountFooter}
          onChange={(event) =>
            setFooter({ discountFooter: event.target.value })
          }
        />
      ),
    },
    {
      key: "roundOff",
      label: "Round Off",
      content: (
        <input
          className={metricInputClass}
          type="number"
          step="0.01"
          value={state.footer.roundOff}
          onChange={(event) => setFooter({ roundOff: event.target.value })}
        />
      ),
    },
    { key: "netTotal", label: "Net Total", value: state.footer.netTotal.toFixed(2) },
  ];

  return <TransactionSummarySection tabs={tabs} metrics={metrics} />;
}
