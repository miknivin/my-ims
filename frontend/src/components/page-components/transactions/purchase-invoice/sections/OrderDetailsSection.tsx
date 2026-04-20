import {
  useGetPurchaseOrdersQuery,
  useLazyGetPurchaseOrderByIdQuery,
} from "../../../../../app/api/purchaseOrderApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import { usePurchaseInvoiceForm } from "../PurchaseInvoiceFormContext";
import TransactionSectionCard from "../../shared/TransactionSectionCard";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function OrderDetailsSection() {
  const { state, setDocument, setSourceRef, hydrateFromPurchaseOrder } =
    usePurchaseInvoiceForm();
  const { data: purchaseOrders = [] } = useGetPurchaseOrdersQuery();
  const [getPurchaseOrderById] = useLazyGetPurchaseOrderByIdQuery();
  const { document, sourceRef } = state;

  return (
    <TransactionSectionCard title="Document Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Reference Type</label>
          <select
            className={inputClass}
            value={sourceRef.type}
            onChange={(event) =>
              setSourceRef({
                type: event.target.value as
                  | "Direct"
                  | "PurchaseOrder"
                  | "GoodsReceipt",
                referenceId: null,
                no: "",
              })
            }
          >
            <option value="Direct">Direct</option>
            <option value="PurchaseOrder">Purchase Order</option>
            <option value="GoodsReceipt">Goods Receipt</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Document No</label>
          <input
            className={inputClass}
            value={document.no}
            onChange={(event) => setDocument({ no: event.target.value })}
            placeholder="PI-0001"
          />
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={document.date}
            onChange={(event) => setDocument({ date: event.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Due Date</label>
          <input
            type="date"
            className={inputClass}
            value={document.dueDate}
            onChange={(event) => setDocument({ dueDate: event.target.value })}
          />
        </div>

        {sourceRef.type === "PurchaseOrder" ? (
          <div className="md:col-span-2">
            <label className={labelClass}>Purchase Order</label>
            <AutocompleteSelect
              value={sourceRef.no}
              className="bg-transparent"
              placeholder="Search purchase order"
              search={async (keyword) => {
                const normalizedKeyword = keyword.trim().toLowerCase();

                return purchaseOrders
                  .filter((purchaseOrder) =>
                    [purchaseOrder.no, purchaseOrder.vendorName].some((value) =>
                      value.toLowerCase().includes(normalizedKeyword),
                    ),
                  )
                  .slice(0, 10);
              }}
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

        {sourceRef.type === "GoodsReceipt" ? (
          <div className="md:col-span-2">
            <label className={labelClass}>Goods Receipt No</label>
            <input
              className={inputClass}
              value={sourceRef.no}
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
      </div>
    </TransactionSectionCard>
  );
}
