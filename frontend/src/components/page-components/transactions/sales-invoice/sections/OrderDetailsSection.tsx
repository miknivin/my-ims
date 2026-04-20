import {
  useGetSalesOrdersQuery,
  useLazyGetSalesOrderByIdQuery,
} from "../../../../../app/api/salesOrderApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useSalesInvoiceForm } from "../SalesInvoiceFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function OrderDetailsSection() {
  const { state, setDocument, setSourceRef, hydrateFromSalesOrder } =
    useSalesInvoiceForm();
  const { data: salesOrders = [] } = useGetSalesOrdersQuery();
  const [getSalesOrderById] = useLazyGetSalesOrderByIdQuery();
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
                  | "SalesOrder"
                  | "DeliveryNote",
                referenceId: null,
                no: "",
              })
            }
          >
            <option value="Direct">Direct</option>
            <option value="SalesOrder">Sales Order</option>
            <option value="DeliveryNote">Delivery Note</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Invoice No</label>
          <input
            className={inputClass}
            value={document.no}
            onChange={(event) => setDocument({ no: event.target.value })}
            placeholder="SI-0001"
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

        {sourceRef.type === "SalesOrder" ? (
          <div className="md:col-span-2">
            <label className={labelClass}>Sales Order</label>
            <AutocompleteSelect
              value={sourceRef.no}
              className="bg-transparent"
              placeholder="Search sales order"
              search={async (keyword) => {
                const normalizedKeyword = keyword.trim().toLowerCase();

                return salesOrders
                  .filter((salesOrder) =>
                    [salesOrder.no, salesOrder.customerName].some((value) =>
                      value.toLowerCase().includes(normalizedKeyword),
                    ),
                  )
                  .slice(0, 10);
              }}
              getItems={(result) => result}
              getOptionKey={(item) => item.id}
              getOptionLabel={(item) => `${item.no} · ${item.customerName}`}
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
                  const salesOrder = await getSalesOrderById(item.id).unwrap();
                  hydrateFromSalesOrder(salesOrder);
                } catch {
                  // Keep the selected reference number if hydration fails.
                }
              }}
            />
          </div>
        ) : null}

        {sourceRef.type === "DeliveryNote" ? (
          <div className="md:col-span-2">
            <label className={labelClass}>Delivery Note No</label>
            <input
              className={inputClass}
              value={sourceRef.no}
              onChange={(event) =>
                setSourceRef({
                  referenceId: null,
                  no: event.target.value,
                })
              }
              placeholder="Enter delivery note number"
            />
          </div>
        ) : null}
      </div>
    </TransactionSectionCard>
  );
}
