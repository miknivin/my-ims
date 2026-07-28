import TransactionSummarySection, {
  TransactionSummaryMetric,
  TransactionSummaryTab,
} from "@/features/operations/shared/TransactionSummarySection";
import { useDeliveryNoteForm } from "./DeliveryNoteFormContext";

const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function SummaryFooterSection() {
  const { state, setGeneral } = useDeliveryNoteForm();

  const tabs: TransactionSummaryTab[] = [
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
            placeholder="Delivery remarks, packing info, or dispatch instructions..."
          />
        </div>
      ),
    },
  ];

  const metrics: TransactionSummaryMetric[] = [
    { key: "totalQty", label: "Total Qty", value: state.footer.totalQty.toFixed(2) },
    { key: "totalAmount", label: "Total Amount", value: state.footer.totalAmount.toFixed(2) },
    { key: "netTotal", label: "Net Total", value: state.footer.netTotal.toFixed(2) },
  ];

  return <TransactionSummarySection tabs={tabs} metrics={metrics} />;
}
