import { usePurchaseOrderForm } from "../PurchaseOrderFormContext";
import TransactionSectionCard from "../../shared/TransactionSectionCard";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function OrderDetailsSection() {
  const { state, setOrderDetails } = usePurchaseOrderForm();
  const { orderDetails } = state;

  return (
    <TransactionSectionCard title="Order Details">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>Voucher Type</label>
          <select
            className={inputClass}
            value={orderDetails.voucherType}
            onChange={(event) => setOrderDetails({ voucherType: event.target.value })}
          >
            <option value="PO">PO</option>
            <option value="PH">PH</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Order No</label>
          <input
            className={inputClass}
            value={orderDetails.no}
            onChange={(event) => setOrderDetails({ no: event.target.value })}
            placeholder="PO-0001"
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
          <label className={labelClass}>Due Date</label>
          <input
            type="date"
            className={inputClass}
            value={orderDetails.dueDate}
            onChange={(event) => setOrderDetails({ dueDate: event.target.value })}
          />
        </div>
        <div className="md:col-span-2">
          <label className={labelClass}>Expected Delivery Date</label>
          <input
            type="date"
            className={inputClass}
            value={orderDetails.deliveryDate}
            onChange={(event) => setOrderDetails({ deliveryDate: event.target.value })}
          />
        </div>
      </div>
    </TransactionSectionCard>
  );
}
