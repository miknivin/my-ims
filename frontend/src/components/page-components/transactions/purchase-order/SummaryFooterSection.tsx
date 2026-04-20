import TransactionSummarySection, {
  TransactionSummaryMetric,
  TransactionSummaryTab,
} from "../shared/TransactionSummarySection";
import { usePurchaseOrderForm } from "./PurchaseOrderFormContext";
import AdditionsSection from "./AdditionsSection";

const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function SummaryFooterSection() {
  const { state, setFooter } = usePurchaseOrderForm();

  const advance = Number.parseFloat(state.footer.advance) || 0;

  const tabs: TransactionSummaryTab[] = [
    {
      key: "general",
      label: "General",
      content: (
        <div className="space-y-4">
          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              rows={6}
              className={areaClass}
              value={state.footer.notes}
              onChange={(event) => setFooter({ notes: event.target.value })}
              placeholder="Supplier notes, receiving instructions, internal remarks..."
            />
          </div>

          <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              checked={state.footer.taxable}
              onChange={(event) => setFooter({ taxable: event.target.checked })}
            />
            Taxable
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
            value={state.footer.remarks}
            onChange={(event) => setFooter({ remarks: event.target.value })}
            placeholder="Additional purchase order remarks..."
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
      key: "discount",
      label: "Discount",
      value: state.footer.discount.toFixed(2),
    },
    {
      key: "tax",
      label: "Tax",
      value: state.footer.tax.toFixed(2),
    },
    {
      key: "additions",
      label: "Additions",
      value: state.footer.addition.toFixed(2),
    },
    {
      key: "advance",
      label: "Advance",
      value: advance.toFixed(2),
    },
    {
      key: "netTotal",
      label: "Net Total",
      value: state.footer.netTotal.toFixed(2),
    },
  ];

  return <TransactionSummarySection tabs={tabs} metrics={metrics} />;
}
