import {
  useLazyGetPurchaseOrdersQuery,
  useLazyGetPurchaseOrderByIdQuery,
} from "@/redux/api/purchaseOrderApi";
import {
  useLazyGetGoodsReceiptNotesQuery,
  useLazyGetGoodsReceiptNoteByIdQuery,
} from "@/redux/api/goodsReceiptNoteApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";
import { usePurchaseInvoiceForm } from "../PurchaseInvoiceFormContext";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function OrderDetailsSection() {
  const { state, setDocument, setSourceRef, hydrateFromPurchaseOrder, hydrateFromGoodsReceiptNote } =
    usePurchaseInvoiceForm();
  const [searchPurchaseOrders] = useLazyGetPurchaseOrdersQuery();
  const [getPurchaseOrderById] = useLazyGetPurchaseOrderByIdQuery();
  const [fetchAllGrns] = useLazyGetGoodsReceiptNotesQuery();
  const [getGrnById] = useLazyGetGoodsReceiptNoteByIdQuery();
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
          <CodeInput
            entity="purchase-invoice"
            label="No"
            required
            value={document.no}
            onChange={(value) => setDocument({ no: value })}
            placeholder="PI-001"
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
              search={(keyword) =>
                searchPurchaseOrders({ keyword, page: 1, limit: 10 }).unwrap()
              }
              getItems={(result) => result.items}
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
            <AutocompleteSelect
              value={sourceRef.no}
              className="bg-transparent"
              placeholder="Search goods receipt"
              search={async (keyword) => {
                const all = await fetchAllGrns(undefined).unwrap();
                return all.filter((g) =>
                  g.no.toLowerCase().includes(keyword.toLowerCase()),
                );
              }}
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => item.no}
              onInputChange={(value) =>
                setSourceRef({ referenceId: null, no: value })
              }
              onSelect={async (item) => {
                setSourceRef({
                  referenceId: item?.id ?? null,
                  no: item?.no ?? "",
                });

                if (!item) return;

                try {
                  const grn = await getGrnById(item.id).unwrap();
                  hydrateFromGoodsReceiptNote(grn);
                } catch {
                  // Keep the selected reference number if hydration fails.
                }
              }}
            />
          </div>
        ) : null}
      </div>
    </TransactionSectionCard>
  );
}
