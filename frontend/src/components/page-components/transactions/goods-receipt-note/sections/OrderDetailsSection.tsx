import {
  useLazyGetPurchaseOrdersQuery,
  useLazyGetPurchaseOrderByIdQuery,
} from "../../../../../app/api/purchaseOrderApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useGoodsReceiptForm } from "../GoodsReceiptFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function OrderDetailsSection() {
  const { state, setDocument, setSourceRef, hydrateFromPurchaseOrder } =
    useGoodsReceiptForm();
  const [searchPurchaseOrders] = useLazyGetPurchaseOrdersQuery();
  const [getPurchaseOrderById] = useLazyGetPurchaseOrderByIdQuery();

  return (
    <TransactionSectionCard title="Document Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Receipt Mode</label>
          <select
            className={inputClass}
            value={state.sourceRef.mode}
            onChange={(event) =>
              setSourceRef({
                mode: event.target.value as "AgainstPurchaseOrder" | "Direct",
                purchaseOrderId: null,
                purchaseOrderNo: "",
                directLpoNo: "",
                directVendorInvoiceNo: "",
              })
            }
          >
            <option value="Direct">Direct</option>
            <option value="AgainstPurchaseOrder">Against Purchase Order</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>GRN No</label>
          <input
            className={inputClass}
            value={state.document.no}
            onChange={(event) => setDocument({ no: event.target.value })}
            placeholder="GRN-0001"
          />
        </div>

        <div>
          <label className={labelClass}>Voucher Type</label>
          <input
            className={inputClass}
            value={state.document.voucherType}
            onChange={(event) =>
              setDocument({ voucherType: event.target.value.toUpperCase() })
            }
            placeholder="GRN"
          />
        </div>

        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={state.document.date}
            onChange={(event) => setDocument({ date: event.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Delivery Date</label>
          <input
            type="date"
            className={inputClass}
            value={state.document.deliveryDate}
            onChange={(event) =>
              setDocument({ deliveryDate: event.target.value })
            }
          />
        </div>

        {state.sourceRef.mode === "AgainstPurchaseOrder" ? (
          <div className="md:col-span-2">
            <label className={labelClass}>Purchase Order</label>
            <AutocompleteSelect
              value={state.sourceRef.purchaseOrderNo}
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
                  purchaseOrderId: null,
                  purchaseOrderNo: value,
                })
              }
              onSelect={async (item) => {
                setSourceRef({
                  purchaseOrderId: item?.id ?? null,
                  purchaseOrderNo: item?.no ?? "",
                });

                if (!item) {
                  return;
                }

                try {
                  const purchaseOrder = await getPurchaseOrderById(item.id).unwrap();
                  hydrateFromPurchaseOrder(purchaseOrder);
                } catch {
                  // Keep the selected purchase order reference if hydration fails.
                }
              }}
            />
          </div>
        ) : (
          <>
            <div>
              <label className={labelClass}>Direct LPO No</label>
              <input
                className={inputClass}
                value={state.sourceRef.directLpoNo}
                onChange={(event) =>
                  setSourceRef({ directLpoNo: event.target.value })
                }
                placeholder="Optional LPO reference"
              />
            </div>

            <div>
              <label className={labelClass}>Vendor Invoice No</label>
              <input
                className={inputClass}
                value={state.sourceRef.directVendorInvoiceNo}
                onChange={(event) =>
                  setSourceRef({ directVendorInvoiceNo: event.target.value })
                }
                placeholder="Supplier invoice reference"
              />
            </div>
          </>
        )}
      </div>
    </TransactionSectionCard>
  );
}
