import { useLazyGetVendorByIdQuery } from "../../../../../app/api/vendorApi";
import { useLazySearchLookupQuery } from "../../../../../app/api/lookupApi";
import { LookupOption } from "../../../../../types/filtering";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useGoodsReceiptForm } from "../GoodsReceiptFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";

export default function VendorInformationSection() {
  const { state, setVendorInformation } = useGoodsReceiptForm();
  const [searchLookup] = useLazySearchLookupQuery();
  const [getVendorById] = useLazyGetVendorByIdQuery();

  return (
    <TransactionSectionCard title="Vendor Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
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
                setVendorInformation({
                  vendorId: vendor.id,
                  vendorLabel: vendor.basicInfo.name,
                  address: vendor.addressAndContact.address ?? "",
                  attention: vendor.addressAndContact.contactName ?? "",
                  phone: vendor.addressAndContact.phone ?? "",
                });
              } catch {
                // Keep the selected vendor label if detail hydration fails.
              }
            }}
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

        <div className="md:col-span-2">
          <label className={labelClass}>Vendor Address</label>
          <textarea
            rows={3}
            className={areaClass}
            value={state.vendorInformation.address}
            onChange={(event) =>
              setVendorInformation({ address: event.target.value })
            }
            placeholder="Vendor address"
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
