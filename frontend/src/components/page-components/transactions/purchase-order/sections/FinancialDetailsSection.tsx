import { useLazySearchLookupQuery } from "../../../../../app/api/lookupApi";
import { LookupOption } from "../../../../../types/filtering";
import AutocompleteSelect from "../../../../form/AutocompleteSelect";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { usePurchaseOrderForm } from "../PurchaseOrderFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function FinancialDetailsSection() {
  const { state, setFinancialDetails } = usePurchaseOrderForm();
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
              setFinancialDetails({ paymentMode: event.target.value })
            }
          >
            <option value="Cash">Cash</option>
            <option value="Credit">Credit</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Currency</label>
          <AutocompleteSelect
            value={state.financialDetails.currencyLabel}
            className="bg-transparent"
            placeholder="Search currency"
            search={(keyword) =>
              searchLookup({ source: "currencies", keyword, limit: 10 }).unwrap()
            }
            getItems={(result) => result}
            getOptionKey={(item) => item.id}
            getOptionLabel={(item) =>
              item.secondaryLabel ? `${item.label} (${item.secondaryLabel})` : item.label
            }
            onInputChange={(value) =>
              setFinancialDetails({ currencyLabel: value, currencyId: null })
            }
            onSelect={(item: LookupOption | null) =>
              setFinancialDetails({
                currencyId: item?.id ?? null,
                currencyLabel: item
                  ? item.secondaryLabel
                    ? `${item.label} (${item.secondaryLabel})`
                    : item.label
                  : "",
              })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Credit Limit</label>
          <input
            className={inputClass}
            type="number"
            min="0"
            step="0.01"
            value={state.financialDetails.creditLimit}
            onChange={(event) =>
              setFinancialDetails({ creditLimit: event.target.value })
            }
          />
        </div>
        <div>
          <label className={labelClass}>Balance</label>
          <input
            className={`${inputClass} bg-gray-100 dark:bg-gray-800`}
            value={state.financialDetails.balance}
            readOnly
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
