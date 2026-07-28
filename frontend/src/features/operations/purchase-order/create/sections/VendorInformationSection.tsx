import { useState } from "react";
import { useLazyGetVendorByIdQuery, Vendor } from "@/redux/api/vendorApi";
import { useLazySearchLookupQuery } from "@/redux/api/lookupApi";
import { LookupOption } from "@/shared/types/filtering";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";
import QuickAddVendorModal from "@/shared/components/quick-add/QuickAddVendorModal";
import { usePurchaseOrderForm } from "../PurchaseOrderFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass =
  "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function VendorInformationSection() {
  const {
    state,
    setVendorInformation,
    setFinancialDetails,
    setProductInformation,
  } = usePurchaseOrderForm();
  const [searchLookup] = useLazySearchLookupQuery();
  const [getVendorById] = useLazyGetVendorByIdQuery();
  const [quickAdd, setQuickAdd] = useState({ open: false, keyword: "" });

  const hydrateVendor = (vendor: Vendor) => {
    setVendorInformation({
      vendorId: vendor.id,
      vendorLabel: vendor.basicInfo.name,
      address: vendor.addressAndContact.address ?? "",
      attention: vendor.addressAndContact.contactName ?? "",
      phone: vendor.addressAndContact.phone ?? "",
    });
    setFinancialDetails({
      creditLimit: String(vendor.creditAndFinance.creditLimit ?? 0),
      currencyId: vendor.creditAndFinance.currencyId,
      currencyLabel: vendor.creditAndFinance.currencyCode ?? "",
    });
  };

  return (
    <>
    <TransactionSectionCard title="Vendor Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className={labelClass}>Vendor</label>
          <AutocompleteSelect
            value={state.vendorInformation.vendorLabel}
            className="bg-transparent"
            placeholder="Search vendor"
            search={(keyword) =>
              searchLookup({ source: "vendors", keyword, limit: 10 }).unwrap()
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => item.label}
            onInputChange={(value) =>
              setVendorInformation({ vendorLabel: value, vendorId: null })
            }
            onSelect={async (item: LookupOption | null) => {
              if (!item) {
                return;
              }

              setVendorInformation({
                vendorId: item.id,
                vendorLabel: item.label,
              });

              try {
                const vendor = await getVendorById(item.id).unwrap();
                hydrateVendor(vendor);
              } catch {
                // Ignore hydration failure and keep the selected vendor label.
              }
            }}
            onNoMatchClick={(kw) => setQuickAdd({ open: true, keyword: kw })}
          />
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
        <div>
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={state.vendorInformation.phone}
            onChange={(event) =>
              setVendorInformation({ phone: event.target.value })
            }
            placeholder="Phone"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Vendor Address</label>
          <textarea
            rows={2}
            className={areaClass}
            value={state.vendorInformation.address}
            onChange={(event) =>
              setVendorInformation({ address: event.target.value })
            }
            placeholder="Vendor billing address"
          />
        </div>
        <div>
          <label className={labelClass}>Vendor Products</label>
          <select
            className={inputClass}
            value={state.productInformation.vendorProducts}
            onChange={(e) =>
              setProductInformation({ vendorProducts: e.target.value })
            }
          >
            <option value="Re-Order Level">Re-Order Level</option>
            <option value="All Products">All Products</option>
          </select>
        </div>
        <div className="flex items-end pb-2">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
              checked={state.productInformation.ownProductsOnly}
              onChange={(e) =>
                setProductInformation({ ownProductsOnly: e.target.checked })
              }
            />
            Own products only
          </label>
        </div>
      </div>
    </TransactionSectionCard>
    <QuickAddVendorModal
      open={quickAdd.open}
      keyword={quickAdd.keyword}
      onClose={() => setQuickAdd({ open: false, keyword: "" })}
      onSuccess={(vendor) => {
        hydrateVendor(vendor);
        setQuickAdd({ open: false, keyword: "" });
      }}
    />
    </>
  );
}
