import { useLazySearchLookupQuery } from "../../../../../app/api/lookupApi";
import { LookupOption } from "../../../../../types/filtering";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { usePurchaseAdjustmentNoteForm } from "../PurchaseAdjustmentNoteFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function FinancialDetailsSection() {
  const { state, setFinancialDetails } = usePurchaseAdjustmentNoteForm();
  const [searchLookup] = useLazySearchLookupQuery();

  return (
    <TransactionSectionCard title="Financial Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Payment Mode</label>
          <select
            className={inputClass}
            value={state.financialDetails.paymentMode}
            onChange={(event) =>
              setFinancialDetails({
                paymentMode: event.target.value as "Cash" | "Credit",
              })
            }
          >
            <option value="Credit">Credit</option>
            <option value="Cash">Cash</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Currency</label>
          <AutocompleteSelect
            value={state.financialDetails.currencyCode}
            className="bg-transparent"
            placeholder="Search currency"
            search={(keyword) =>
              searchLookup({ source: "currencies", keyword, limit: 10 }).unwrap()
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              item.secondaryLabel
                ? `${item.label} (${item.secondaryLabel})`
                : item.label
            }
            onInputChange={(value) =>
              setFinancialDetails({ currencyCode: value, currencyId: null })
            }
            onSelect={(item: LookupOption | null) =>
              setFinancialDetails({
                currencyId: item?.id ?? null,
                currencyCode: item?.label ?? "",
                currencySymbol: item?.secondaryLabel ?? "",
              })
            }
          />
        </div>

        <div>
          <label className={labelClass}>Supplier Invoice No</label>
          <input
            className={inputClass}
            value={state.financialDetails.supplierInvoiceNo}
            onChange={(event) =>
              setFinancialDetails({ supplierInvoiceNo: event.target.value })
            }
            placeholder="Vendor invoice number"
          />
        </div>

        <div>
          <label className={labelClass}>LR No</label>
          <input
            className={inputClass}
            value={state.financialDetails.lrNo}
            onChange={(event) => setFinancialDetails({ lrNo: event.target.value })}
            placeholder="Transport / LR reference"
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
