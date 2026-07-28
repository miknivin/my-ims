import { useLazyGetWarehousesQuery } from "@/redux/api/warehouseApi";
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

export default function DeliveryInformationSection() {
  const [searchWarehouses] = useLazyGetWarehousesQuery();
  const { state, setDeliveryInformation, editConfig } = usePurchaseOrderEditForm();
  const isSubmitted = editConfig.status === "Submitted";

  return (
    <TransactionSectionCard title="Delivery Information">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Warehouse</label>
          {isSubmitted ? (
            <input className={disabledClass} value={state.deliveryInformation.warehouseName} disabled />
          ) : (
            <AutocompleteSelect
              value={state.deliveryInformation.warehouseName}
              className="bg-transparent"
              placeholder="Search warehouse"
              search={(keyword) =>
                searchWarehouses({ keyword, limit: 10 }).unwrap()
              }
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) =>
                item.code ? `${item.name} (${item.code})` : item.name
              }
              onInputChange={(value) =>
                setDeliveryInformation({ warehouseId: null, warehouseName: value })
              }
              onSelect={(item) =>
                setDeliveryInformation({
                  warehouseId: item?.id ?? null,
                  warehouseName: item?.name ?? "",
                  address: item?.address ?? "",
                  attention: item?.contactPerson ?? "",
                  phone: item?.phone ?? "",
                })
              }
            />
          )}
        </div>
        <div>
          <label className={labelClass}>Contact / Attention</label>
          <input
            className={inputClass}
            value={state.deliveryInformation.attention}
            onChange={(event) => setDeliveryInformation({ attention: event.target.value })}
            placeholder="Receiving contact"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Delivery Address</label>
          <textarea
            rows={2}
            className={areaClass}
            value={state.deliveryInformation.address}
            onChange={(event) => setDeliveryInformation({ address: event.target.value })}
            placeholder="Editable delivery address snapshot"
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Phone</label>
          <input
            className={inputClass}
            value={state.deliveryInformation.phone}
            onChange={(event) => setDeliveryInformation({ phone: event.target.value })}
            placeholder="Receiving phone"
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
