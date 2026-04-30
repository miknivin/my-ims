import {
  useLazyGetPurchaseOrdersQuery,
  useLazyGetPurchaseOrderByIdQuery,
} from "../../../../../app/api/purchaseOrderApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { usePurchaseInvoiceForm } from "../PurchaseInvoiceFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";
const radioClass =
  "inline-flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 dark:border-white/[0.05] dark:text-gray-300";

export default function DeliveryInformationSection() {
  const { state, setSourceRef, hydrateFromPurchaseOrder } =
    usePurchaseInvoiceForm();
  const [searchPurchaseOrders] = useLazyGetPurchaseOrdersQuery();
  const [getPurchaseOrderById] = useLazyGetPurchaseOrderByIdQuery();

  return (
    <TransactionSectionCard title="Source Reference">
      <div className="space-y-4">
        <div>
          <label className={labelClass}>Reference Type</label>
          <div className="flex flex-wrap gap-2">
            {(
              ["Direct", "PurchaseOrder", "GoodsReceipt"] as const
            ).map((type) => (
              <label key={type} className={radioClass}>
                <input
                  type="radio"
                  name="purchase-invoice-ref-type"
                  checked={state.sourceRef.type === type}
                  onChange={() =>
                    setSourceRef({
                      type,
                      referenceId: null,
                      no: type === "Direct" ? "" : state.sourceRef.no,
                    })
                  }
                />
                {type === "PurchaseOrder"
                  ? "Purchase Order"
                  : type === "GoodsReceipt"
                    ? "Goods Receipt"
                    : "Direct"}
              </label>
            ))}
          </div>
        </div>

        {state.sourceRef.type === "PurchaseOrder" ? (
          <div>
            <label className={labelClass}>Purchase Order</label>
            <AutocompleteSelect
              value={state.sourceRef.no}
              className="bg-transparent"
              placeholder="Search purchase order"
              search={(keyword) =>
                searchPurchaseOrders({ keyword, limit: 10 }).unwrap()
              }
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => item.no}
              onInputChange={(value) =>
                setSourceRef({
                  referenceId: null,
                  no: value,
                })
              }
              onSelect={async (item) => {
                setSourceRef({
                  referenceId: item?.id ?? null,
                  no: item?.no ?? "",
                });

                if (!item) {
                  return;
                }

                try {
                  const purchaseOrder = await getPurchaseOrderById(item.id).unwrap();
                  hydrateFromPurchaseOrder(purchaseOrder);
                } catch {
                  // Keep the selected reference number if hydration fails.
                }
              }}
            />
          </div>
        ) : null}

        {state.sourceRef.type === "GoodsReceipt" ? (
          <div>
            <label className={labelClass}>Goods Receipt No</label>
            <input
              className={inputClass}
              value={state.sourceRef.no}
              onChange={(event) =>
                setSourceRef({
                  referenceId: null,
                  no: event.target.value,
                })
              }
              placeholder="Enter GR number"
            />
          </div>
        ) : null}

        {state.sourceRef.type === "Direct" ? (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Direct invoices do not bind to a prior purchase transaction.
          </p>
        ) : null}
      </div>
    </TransactionSectionCard>
  );
}
