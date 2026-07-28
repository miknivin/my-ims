import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";
import { usePurchaseOrderEditForm } from "../PurchaseOrderEditFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const disabledClass =
  "h-11 w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed";
const labelClass =
  "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const disabledAreaClass =
  "w-full rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 cursor-not-allowed";

export default function VendorInformationSection() {
  const { state, setVendorInformation, setProductInformation, editConfig } = usePurchaseOrderEditForm();
  const [searchLookup] = useLazySearchLookupQuery();
  const isSubmitted = editConfig.status === "Submitted";

  return (
    <TransactionSectionCard title="Vendor Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Vendor</label>
          <input className={disabledClass} value={state.vendorInformation.vendorLabel} disabled />
        </div>
        <div>
          <label className={labelClass}>Attention</label>
          <input
            className={inputClass}
            value={state.vendorInformation.attention}
            onChange={(event) => setVendorInformation({ attention: event.target.value })}
            placeholder="Contact person"
          />
        </div>
        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={state.vendorInformation.phone}
            onChange={(event) => setVendorInformation({ phone: event.target.value })}
            placeholder="Phone"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Vendor Address</label>
          <textarea
            rows={2}
            className={isSubmitted ? disabledAreaClass : areaClass}
            disabled={isSubmitted}
            value={state.vendorInformation.address}
            onChange={(event) => setVendorInformation({ address: event.target.value })}
            placeholder="Vendor billing address"
          />
        </div>
        <div>
          <label className={labelClass}>Vendor Products</label>
          {isSubmitted ? (
            <input className={disabledClass} value={state.productInformation.vendorProducts} disabled />
          ) : (
            <AutocompleteSelect
              value={state.productInformation.vendorProducts}
              className="bg-transparent"
              placeholder="Search vendor products"
              search={(keyword) =>
                searchLookup({ source: "vendors", keyword, limit: 10 }).unwrap()
              }
              getItems={() => [
                { id: "Re-Order Level", label: "Re-Order Level" },
                { id: "All Products", label: "All Products" },
              ]}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => item.label}
              onInputChange={(value) =>
                setProductInformation({ vendorProducts: value })
              }
              onSelect={(item: LookupOption | null) => {
                if (item) setProductInformation({ vendorProducts: item.id });
              }}
            />
          )}
        </div>
        <div className="flex items-end pb-2">
          <label className={`inline-flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300 ${isSubmitted ? "cursor-not-allowed opacity-50" : "cursor-pointer"}`}>
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              checked={state.productInformation.ownProductsOnly}
              disabled={isSubmitted}
              onChange={(e) => setProductInformation({ ownProductsOnly: e.target.checked })}
            />
            Own products only
          </label>
        </div>
      </div>
    </TransactionSectionCard>
  );
}
