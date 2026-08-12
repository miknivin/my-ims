import TransactionSectionCard from "@/features/operations/shared/TransactionSectionCard";
import { useDeliveryNoteForm } from "../DeliveryNoteFormContext";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function LogisticsSection() {
  const { state, setLogistics } = useDeliveryNoteForm();

  return (
    <TransactionSectionCard title="Logistics">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className={labelClass}>E-Way Bill No</label>
          <input
            className={inputClass}
            value={state.logistics.eWayBillNo}
            onChange={(event) => setLogistics({ eWayBillNo: event.target.value })}
            placeholder="GST e-way bill number"
            maxLength={20}
          />
        </div>

        <div>
          <label className={labelClass}>Transporter Name</label>
          <input
            className={inputClass}
            value={state.logistics.transporterName}
            onChange={(event) => setLogistics({ transporterName: event.target.value })}
            placeholder="Transporter / courier name"
          />
        </div>

        <div>
          <label className={labelClass}>Transport Mode</label>
          <input
            className={inputClass}
            value={state.logistics.transportMode}
            onChange={(event) =>
              setLogistics({ transportMode: event.target.value })
            }
            placeholder="Road, Air, Rail, Courier…"
          />
        </div>

        <div>
          <label className={labelClass}>Vehicle No</label>
          <input
            className={inputClass}
            value={state.logistics.vehicleNo}
            onChange={(event) =>
              setLogistics({ vehicleNo: event.target.value })
            }
            placeholder="Vehicle number"
          />
        </div>

        <div>
          <label className={labelClass}>LR No</label>
          <input
            className={inputClass}
            value={state.logistics.lrNo}
            onChange={(event) => setLogistics({ lrNo: event.target.value })}
            placeholder="Lorry receipt number"
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
