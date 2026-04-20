import TransactionSummarySection, {
  TransactionSummaryMetric,
  TransactionSummaryTab,
} from "../shared/TransactionSummarySection";
import AdditionsSection from "./AdditionsSection";
import { useSalesInvoiceForm } from "./SalesInvoiceFormContext";

const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function SummaryFooterSection() {
  const { state, setGeneral, setFooter } = useSalesInvoiceForm();

  const tabs: TransactionSummaryTab[] = [
    {
      key: "general",
      label: "General",
      content: (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="lg:col-span-2">
            <label className={labelClass}>Notes</label>
            <textarea
              rows={4}
              className={areaClass}
              value={state.general.notes}
              onChange={(event) => setGeneral({ notes: event.target.value })}
              placeholder="Invoice notes, dispatch context, or stock remarks..."
            />
          </div>

          <div>
            <label className={labelClass}>Tax Application</label>
            <select
              className={inputClass}
              value={state.general.taxApplication}
              onChange={(event) =>
                setGeneral({
                  taxApplication: event.target.value as
                    | "After Discount"
                    | "Before Discount",
                })
              }
            >
              <option value="After Discount">After Discount</option>
              <option value="Before Discount">Before Discount</option>
            </select>
          </div>

          <div className="rounded-xl border border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:text-gray-400">
            Inventory valuation is company-controlled and not editable from the sales invoice.
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              checked={state.general.taxable}
              onChange={(event) => setGeneral({ taxable: event.target.checked })}
            />
            Taxable
          </label>

          <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              checked={state.general.interState}
              onChange={(event) =>
                setGeneral({ interState: event.target.checked })
              }
            />
            Inter-state
          </label>
        </div>
      ),
    },
    {
      key: "additions",
      label: "Additions",
      content: <AdditionsSection />,
    },
    {
      key: "remarks",
      label: "Remarks",
      content: (
        <div>
          <label className={labelClass}>Remarks</label>
          <textarea
            rows={6}
            className={areaClass}
            value={state.footer.notes}
            onChange={(event) => setFooter({ notes: event.target.value })}
            placeholder="Internal remarks for this sales invoice..."
          />
        </div>
      ),
    },
  ];

  const metrics: TransactionSummaryMetric[] = [
    {
      key: "total",
      label: "Total",
      value: state.footer.total.toFixed(2),
    },
    {
      key: "tax",
      label: "Tax",
      value: state.footer.tax.toFixed(2),
    },
    {
      key: "addition",
      label: "Addition",
      value: state.footer.addition.toFixed(2),
    },
    {
      key: "deduction",
      label: "Deduction",
      value: state.footer.deduction.toFixed(2),
    },
    {
      key: "paid",
      label: "Paid",
      content: (
        <input
          className={inputClass}
          type="number"
          min="0"
          step="0.01"
          value={state.footer.paid}
          onChange={(event) => setFooter({ paid: event.target.value })}
        />
      ),
    },
    {
      key: "netTotal",
      label: "Net Total",
      value: state.footer.netTotal.toFixed(2),
    },
    {
      key: "balance",
      label: "Balance",
      value: state.footer.balance.toFixed(2),
    },
  ];

  return <TransactionSummarySection tabs={tabs} metrics={metrics} />;
}
