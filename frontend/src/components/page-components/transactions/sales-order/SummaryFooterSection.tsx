import TransactionSummarySection, {
  TransactionSummaryMetric,
  TransactionSummaryTab,
} from "../shared/TransactionSummarySection";
import { useSalesOrderForm } from "./SalesOrderFormContext";
import AdditionsSection from "./AdditionsSection";

const inputClass =
  "h-11 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const areaClass =
  "w-full rounded-lg border border-gray-300 bg-transparent px-4 py-3 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90";
const labelClass = "mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function SummaryFooterSection() {
  const { state, setFooter, setCommercialDetails } = useSalesOrderForm();

  const taxTotal = state.items.reduce((sum, item) => sum + item.taxAmount, 0);
  const additionsNet = state.additions.reduce((sum, addition) => {
    const amount = Number.parseFloat(addition.amount);
    const parsedAmount = Number.isFinite(amount) ? amount : 0;
    return sum + (addition.type === "Deduction" ? -parsedAmount : parsedAmount);
  }, 0);
  const freight = Number.parseFloat(state.footer.freight) || 0;
  const soAdvance = Number.parseFloat(state.footer.soAdvance) || 0;
  const roundOff = Number.parseFloat(state.footer.roundOff) || 0;
  const adjustmentsTotal = additionsNet + freight + roundOff - soAdvance;

  const tabs: TransactionSummaryTab[] = [
    {
      key: "general",
      label: "General",
      content: (
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className={labelClass}>Vehicle No</label>
            <input
              className={inputClass}
              value={state.footer.vehicleNo}
              onChange={(event) =>
                setFooter({ vehicleNo: event.target.value.toUpperCase() })
              }
              placeholder="Vehicle or dispatch reference"
            />
          </div>
          <div>
            <label className={labelClass}>Tax Application</label>
            <select
              className={inputClass}
              value={state.commercialDetails.taxApplication}
              onChange={(event) =>
                setCommercialDetails({
                  taxApplication: event.target.value as
                    | "After Discount"
                    | "Before Discount",
                })
              }
            >
              <option value="After Discount">After Discount</option>
              <option value="Before Discount">Before Discount</option>
            </select>
          </div>
        </div>
      ),
    },
    {
      key: "additions",
      label: "Additions",
      content: <AdditionsSection />,
    },
    {
      key: "remarks",
      label: "Remarks",
      content: (
        <div>
          <label className={labelClass}>Remarks</label>
          <textarea
            rows={6}
            className={areaClass}
            value={state.footer.remarks}
            onChange={(event) => setFooter({ remarks: event.target.value })}
            placeholder="Delivery notes, dispatch instructions, internal remarks..."
          />
        </div>
      ),
    },
  ];

  const metrics: TransactionSummaryMetric[] = [
    {
      key: "total",
      label: "Total",
      value: state.footer.total.toFixed(2),
    },
    {
      key: "discount",
      label: "Discount",
      value: state.footer.discount.toFixed(2),
    },
    {
      key: "tax",
      label: "Tax",
      value: taxTotal.toFixed(2),
    },
    {
      key: "adjustments",
      label: "Adjustments",
      value: adjustmentsTotal.toFixed(2),
    },
    {
      key: "soAdvance",
      label: "SO Advance",
      content: (
        <input
          type="number"
          min="0"
          step="0.01"
          className={inputClass}
          value={state.footer.soAdvance}
          onChange={(event) => setFooter({ soAdvance: event.target.value })}
        />
      ),
    },
    {
      key: "netTotal",
      label: "Net Total",
      value: state.footer.netTotal.toFixed(2),
    },
    {
      key: "balance",
      label: "Balance",
      value: state.footer.balance.toFixed(2),
    },
  ];

  return <TransactionSummarySection tabs={tabs} metrics={metrics} />;
}
