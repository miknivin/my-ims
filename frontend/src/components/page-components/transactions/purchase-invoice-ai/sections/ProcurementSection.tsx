import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { usePurchaseInvoiceForm } from "../PurchaseInvoiceFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function ProcurementSection() {
  const { state, setProductInformation } = usePurchaseInvoiceForm();

  return (
    <TransactionSectionCard title="Product Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Vendor Products</label>
          <select
            className={inputClass}
            value={state.productInformation.vendorProducts}
            onChange={(event) =>
              setProductInformation({ vendorProducts: event.target.value })
            }
          >
            <option value="Vendor Products">Vendor Products</option>
            <option value="All Products">All Products</option>
            <option value="Re-Order Level">Re-Order Level</option>
          </select>
        </div>

        <div className="flex items-end">
          <label className="inline-flex items-center gap-3 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              checked={state.productInformation.ownProductsOnly}
              onChange={(event) =>
                setProductInformation({ ownProductsOnly: event.target.checked })
              }
            />
            Own products only
          </label>
        </div>
      </div>
    </TransactionSectionCard>
  );
}
