import {
  useGetPurchaseInvoicesQuery,
  useLazyGetPurchaseInvoiceByIdQuery,
} from "../../../../../app/api/purchaseInvoiceApi";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { usePurchaseAdjustmentNoteForm } from "../PurchaseAdjustmentNoteFormContext";
import { PurchaseAdjustmentNoteNature } from "../types/types";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

function formatNatureLabel(value: PurchaseAdjustmentNoteNature) {
  switch (value) {
    case "RateDifference":
      return "Rate Difference";
    case "DiscountAdjustment":
      return "Discount Adjustment";
    case "DamageClaim":
      return "Damage Claim";
    default:
      return value;
  }
}

export default function OrderDetailsSection() {
  const {
    config,
    inventoryEffectLabel,
    state,
    setDocument,
    setNoteNature,
    setSourceRef,
    clearSourceInvoiceSelection,
    hydrateFromPurchaseInvoice,
  } = usePurchaseAdjustmentNoteForm();
  const { data: purchaseInvoices = [] } = useGetPurchaseInvoicesQuery();
  const [getPurchaseInvoiceById] = useLazyGetPurchaseInvoiceByIdQuery();

  return (
    <TransactionSectionCard title="Document Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Note Nature</label>
          <select
            className={inputClass}
            value={state.noteNature}
            onChange={(event) =>
              setNoteNature(event.target.value as PurchaseAdjustmentNoteNature)
            }
          >
            {config.allowedNatures.map((nature) => (
              <option key={nature} value={nature}>
                {formatNatureLabel(nature)}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Voucher Type</label>
          <input className={inputClass} value={state.document.voucherType} readOnly />
        </div>

        <div>
          <label className={labelClass}>Note No</label>
          <input
            className={inputClass}
            value={state.document.no}
            onChange={(event) => setDocument({ no: event.target.value })}
            placeholder={config.voucherType + "-0001"}
          />
        </div>

        <div>
          <label className={labelClass}>Inventory Effect</label>
          <input className={inputClass} value={inventoryEffectLabel} readOnly />
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
          <label className={labelClass}>Due Date</label>
          <input
            type="date"
            className={inputClass}
            value={state.document.dueDate}
            onChange={(event) => setDocument({ dueDate: event.target.value })}
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Source Purchase Invoice</label>
          <AutocompleteSelect
            value={state.sourceRef.referenceNo}
            className="bg-transparent"
            placeholder="Search purchase invoice"
            search={async (keyword) => {
              const normalizedKeyword = keyword.trim().toLowerCase();

              return purchaseInvoices
                .filter((purchaseInvoice) =>
                  [purchaseInvoice.no, purchaseInvoice.vendorName].some((value) =>
                    value.toLowerCase().includes(normalizedKeyword),
                  ),
                )
                .slice(0, 10);
            }}
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) => `${item.no} - ${item.vendorName}`}
            onInputChange={(value) => {
              if (!value.trim()) {
                clearSourceInvoiceSelection();
                return;
              }

              setSourceRef({
                referenceId: null,
                referenceNo: value,
              });
            }}
            onSelect={async (item) => {
              if (!item) {
                clearSourceInvoiceSelection();
                return;
              }

              setSourceRef({
                referenceId: item.id,
                referenceNo: item.no,
              });

              try {
                const purchaseInvoice = await getPurchaseInvoiceById(item.id).unwrap();
                hydrateFromPurchaseInvoice(purchaseInvoice);
              } catch {
                // Keep the selected source reference if detail hydration fails.
              }
            }}
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
