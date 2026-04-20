import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { usePurchaseAdjustmentNoteForm } from "../PurchaseAdjustmentNoteFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const readOnlyInputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function VendorInformationSection() {
  const { state, setVendorInformation } = usePurchaseAdjustmentNoteForm();

  return (
    <TransactionSectionCard title="Vendor Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Vendor</label>
          <input
            className={readOnlyInputClass}
            value={state.vendorInformation.vendorLabel}
            readOnly
            placeholder="Select a source purchase invoice"
          />
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Vendor is loaded from the selected purchase invoice.
          </p>
        </div>

        <div>
          <label className={labelClass}>Attention</label>
          <input
            className={inputClass}
            value={state.vendorInformation.attention}
            onChange={(event) =>
              setVendorInformation({ attention: event.target.value })
            }
            placeholder="Contact person"
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Vendor Address</label>
          <textarea
            rows={3}
            className={areaClass}
            value={state.vendorInformation.address}
            onChange={(event) =>
              setVendorInformation({ address: event.target.value })
            }
            placeholder="Vendor billing address"
          />
        </div>

        <div>
          <label className={labelClass}>Vendor Phone</label>
          <input
            className={inputClass}
            value={state.vendorInformation.phone}
            onChange={(event) =>
              setVendorInformation({ phone: event.target.value })
            }
            placeholder="Phone"
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
