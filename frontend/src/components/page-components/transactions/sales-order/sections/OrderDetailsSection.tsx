import TransactionSectionCard from "../../shared/TransactionSectionCard";
import { useSalesOrderForm } from "../SalesOrderFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function OrderDetailsSection() {
  const { state, setOrderDetails } = useSalesOrderForm();
  const { orderDetails } = state;

  return (
    <TransactionSectionCard title="Order Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Voucher Type</label>
          <select
            className={inputClass}
            value={orderDetails.voucherType}
            onChange={(event) =>
              setOrderDetails({ voucherType: event.target.value as "SL" | "PH" })
            }
          >
            <option value="SL">Sales</option>
            <option value="PH">Proforma</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Order No</label>
          <input
            className={inputClass}
            value={orderDetails.no}
            onChange={(event) =>
              setOrderDetails({ no: event.target.value.toUpperCase() })
            }
            placeholder="SO-0001"
          />
        </div>
        <div>
          <label className={labelClass}>Date</label>
          <input
            type="date"
            className={inputClass}
            value={orderDetails.date}
            onChange={(event) => setOrderDetails({ date: event.target.value })}
          />
        </div>
        <div>
          <label className={labelClass}>Delivery Date</label>
          <input
            type="date"
            className={inputClass}
            value={orderDetails.deliveryDate}
            onChange={(event) =>
              setOrderDetails({ deliveryDate: event.target.value })
            }
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
