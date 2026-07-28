import {
  useLazyGetSalesOrdersQuery,
  useLazyGetSalesOrderByIdQuery,
} from "@/redux/api/salesOrderApi";
import AutocompleteSelect from "@/shared/components/form/AutocompleteSelect";
import CodeInput from "@/shared/components/form/CodeInput";
import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";
import { useDeliveryNoteForm } from "../DeliveryNoteFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function OrderDetailsSection() {
  const { state, setDocument, setSourceRef, hydrateFromSalesOrderFn } =
    useDeliveryNoteForm();
  const [searchSalesOrders] = useLazyGetSalesOrdersQuery();
  const [getSalesOrderById] = useLazyGetSalesOrderByIdQuery();

  return (
    <TransactionSectionCard title="Document Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Delivery Mode</label>
          <select
            className={inputClass}
            value={state.sourceRef.mode}
            onChange={(event) =>
              setSourceRef({
                mode: event.target.value as "Direct" | "AgainstSalesOrder",
                salesOrderId: null,
                salesOrderNo: "",
                directRefNo: "",
              })
            }
          >
            <option value="Direct">Direct</option>
            <option value="AgainstSalesOrder">Against Sales Order</option>
          </select>
        </div>

        <div>
          <CodeInput
            entity="delivery-note"
            label="DN No"
            required
            value={state.document.no}
            onChange={(value) => setDocument({ no: value })}
            placeholder="DN-001"
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
            placeholder="DN"
          />
        </div>

        <div>
          <label className={labelClass}>Date <span className="text-error-500">*</span></label>
          <input
            type="date"
            className={inputClass}
            value={state.document.date}
            onChange={(event) => setDocument({ date: event.target.value })}
          />
        </div>

        <div>
          <label className={labelClass}>Expected Delivery Date</label>
          <input
            type="date"
            className={inputClass}
            value={state.document.expectedDeliveryDate}
            onChange={(event) =>
              setDocument({ expectedDeliveryDate: event.target.value })
            }
          />
        </div>

        {state.sourceRef.mode === "AgainstSalesOrder" ? (
          <div className="md:col-span-2">
            <label className={labelClass}>Sales Order</label>
            <AutocompleteSelect
              value={state.sourceRef.salesOrderNo}
              className="bg-transparent"
              placeholder="Search sales order"
              search={(keyword) =>
                searchSalesOrders({ keyword, limit: 10 }).unwrap()
              }
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => item.no}
              onInputChange={(value) =>
                setSourceRef({ salesOrderId: null, salesOrderNo: value })
              }
              onSelect={async (item) => {
                setSourceRef({
                  salesOrderId: item?.id ?? null,
                  salesOrderNo: item?.no ?? "",
                });

                if (!item) return;

                try {
                  const salesOrder = await getSalesOrderById(item.id).unwrap();
                  hydrateFromSalesOrderFn(salesOrder);
                } catch {
                  // Keep the selected sales order reference if hydration fails.
                }
              }}
            />
          </div>
        ) : (
          <div>
            <label className={labelClass}>Reference No</label>
            <input
              className={inputClass}
              value={state.sourceRef.directRefNo}
              onChange={(event) =>
                setSourceRef({ directRefNo: event.target.value })
              }
              placeholder="Optional reference"
            />
          </div>
        )}
      </div>
    </TransactionSectionCard>
  );
}
