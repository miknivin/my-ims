import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useGoodsReceiptForm } from "../GoodsReceiptFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function LogisticsSection() {
  const { state, setLogistics } = useGoodsReceiptForm();

  return (
    <TransactionSectionCard title="Logistics">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>LR Service</label>
          <input
            className={inputClass}
            value={state.logistics.lrService}
            onChange={(event) =>
              setLogistics({ lrService: event.target.value })
            }
            placeholder="Transport service"
          />
        </div>

        <div>
          <label className={labelClass}>LR No</label>
          <input
            className={inputClass}
            value={state.logistics.lrNo}
            onChange={(event) => setLogistics({ lrNo: event.target.value })}
            placeholder="LR / challan no"
          />
        </div>

        <div>
          <label className={labelClass}>LR Date</label>
          <input
            type="date"
            className={inputClass}
            value={state.logistics.lrDate}
            onChange={(event) => setLogistics({ lrDate: event.target.value })}
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
