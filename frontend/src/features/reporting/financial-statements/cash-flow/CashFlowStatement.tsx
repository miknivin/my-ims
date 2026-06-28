import { CashFlowReport } from "@/redux/api/financialStatementsApi";

interface Props {
  report: CashFlowReport;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtSigned = (n: number) => {
  const abs = Math.abs(n);
  const s = abs.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return n < 0 ? `(${s})` : s;
};

const amountClass = (n: number) =>
  n < 0
    ? "text-red-700 dark:text-red-400"
    : "text-gray-800 dark:text-white/90";

export default function CashFlowStatement({ report }: Props) {
  const isPositive = report.netCashFromOperations >= 0;

  return (
    <div className="px-6 py-6 space-y-6 max-w-2xl">
      {/* Operating Activities section */}
      <div>
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
          Cash Flow from Operating Activities
        </h3>

        {/* Net Profit */}
        <StatementRow
          label="Net Profit for the Period"
          value={fmt(report.netProfit)}
          valueClass={
            report.netProfit >= 0
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          }
        />

        {/* Adjustments sub-section */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
            Adjustments for Working Capital Changes
          </p>

          <AdjustmentRow
            label="Decrease / (Increase) in Trade Receivables"
            hint="A/R movement: positive = collections, negative = A/R grew"
            value={report.accountsReceivableChange}
          />

          <AdjustmentRow
            label="Increase / (Decrease) in Trade Payables"
            hint="A/P movement: positive = payables grew, negative = net payments"
            value={report.accountsPayableChange}
          />
        </div>
      </div>

      {/* Net Cash from Operations */}
      <div className="border-t-2 border-gray-300 pt-4 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <span
            className={`text-base font-bold uppercase tracking-wide ${
              isPositive
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            Net Cash from Operating Activities
          </span>
          <span
            className={`text-lg font-bold tabular-nums ${
              isPositive
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {fmtSigned(report.netCashFromOperations)}
          </span>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-xs text-gray-400 dark:text-gray-500">
        Prepared using the indirect method. Investing and financing activities require
        additional ledger classification.
      </p>
    </div>
  );
}

function StatementRow({
  label,
  value,
  valueClass,
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">{label}</span>
      <span className={`text-sm font-medium tabular-nums ${valueClass ?? "text-gray-800 dark:text-white/90"}`}>
        {value}
      </span>
    </div>
  );
}

function AdjustmentRow({
  label,
  hint,
  value,
}: {
  label: string;
  hint: string;
  value: number;
}) {
  return (
    <div className="flex items-start justify-between py-1.5 pl-4">
      <div>
        <p className="text-sm text-gray-700 dark:text-gray-300">{label}</p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{hint}</p>
      </div>
      <span className={`text-sm tabular-nums ml-4 shrink-0 ${amountClass(value)}`}>
        {fmtSigned(value)}
      </span>
    </div>
  );
}
