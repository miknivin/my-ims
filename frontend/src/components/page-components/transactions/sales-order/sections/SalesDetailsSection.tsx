import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useSalesOrderForm } from "../SalesOrderFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function SalesDetailsSection() {
  const { state, setSalesDetails } = useSalesOrderForm();

  return (
    <TransactionSectionCard title="Sales Details">
      <div>
        <label className={labelClass}>Salesman</label>
        <input
          className={inputClass}
          value={state.salesDetails.salesMan}
          onChange={(event) => setSalesDetails({ salesMan: event.target.value })}
          placeholder="Sales representative"
        />
      </div>
    </TransactionSectionCard>
  );
}
