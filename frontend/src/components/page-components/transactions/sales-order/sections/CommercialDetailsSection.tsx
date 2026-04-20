import { useGetCurrenciesQuery } from "../../../../../app/api/currencyApi";
import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useSalesOrderForm } from "../SalesOrderFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function CommercialDetailsSection() {
  const { state, setCommercialDetails } = useSalesOrderForm();
  const { data: currencies = [] } = useGetCurrenciesQuery();

  return (
    <TransactionSectionCard title="Commercial Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Rate Level</label>
          <select
            className={inputClass}
            value={state.commercialDetails.rateLevel}
            onChange={(event) =>
              setCommercialDetails({
                rateLevel: event.target.value as "WRATE" | "RRATE" | "MRATE",
              })
            }
          >
            <option value="WRATE">Wholesale</option>
            <option value="RRATE">Retail</option>
            <option value="MRATE">MRP</option>
          </select>
        </div>

        <div>
          <label className={labelClass}>Currency</label>
          <select
            className={inputClass}
            value={state.commercialDetails.currencyId ?? ""}
            onChange={(event) => {
              const selectedCurrency = currencies.find(
                (currency) => currency.id === event.target.value,
              );

              setCommercialDetails({
                currencyId: selectedCurrency?.id ?? null,
                currencyCode: selectedCurrency?.code ?? "",
                currencySymbol: selectedCurrency?.symbol ?? "",
              });
            }}
          >
            <option value="">None</option>
            {currencies.map((currency) => (
              <option key={currency.id} value={currency.id}>
                {currency.code} {currency.symbol ? `(${currency.symbol})` : ""}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className={labelClass}>Credit Limit</label>
          <input
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            value={state.commercialDetails.creditLimit}
            onChange={(event) =>
              setCommercialDetails({ creditLimit: event.target.value })
            }
          />
        </div>

        <div className="md:col-span-2">
          <label className={labelClass}>Inter State</label>
          <select
            className={inputClass}
            value={state.commercialDetails.isInterState ? "yes" : "no"}
            onChange={(event) =>
              setCommercialDetails({ isInterState: event.target.value === "yes" })
            }
          >
            <option value="no">No</option>
            <option value="yes">Yes</option>
          </select>
        </div>
      </div>
    </TransactionSectionCard>
  );
}
