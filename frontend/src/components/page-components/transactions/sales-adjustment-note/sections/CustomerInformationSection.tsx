import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useSalesAdjustmentNoteForm } from "../SalesAdjustmentNoteFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function CustomerInformationSection() {
  const { state, setCustomerInformation } = useSalesAdjustmentNoteForm();

  return (
    <TransactionSectionCard title="Customer Information">
      <div className="grid grid-cols-1 gap-4">
        <div>
          <label className={labelClass}>Customer</label>
          <input
            className={inputClass}
            value={state.customerInformation.customerName}
            readOnly
            placeholder="Select a source sales invoice"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Customer is loaded from the selected sales invoice.
          </p>
        </div>

        <div>
          <label className={labelClass}>Customer Address</label>
          <textarea
            rows={3}
            className={areaClass}
            value={state.customerInformation.address}
            onChange={(event) =>
              setCustomerInformation({ address: event.target.value })
            }
            placeholder="Customer billing address"
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
