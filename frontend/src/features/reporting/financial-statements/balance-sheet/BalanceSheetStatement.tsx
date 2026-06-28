import { BalanceSheetGroup, BalanceSheetReport } from "@/redux/api/financialStatementsApi";

interface Props {
  report: BalanceSheetReport;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BalanceSheetStatement({ report }: Props) {
  const totalEquitySide = report.totalLiabilities + report.totalEquity + report.netProfit;
  const isBalanced = Math.abs(report.totalAssets - totalEquitySide) < 0.01;
  const isProfitable = report.netProfit >= 0;

  return (
    <div className="grid grid-cols-1 divide-y divide-gray-100 dark:divide-gray-800 md:grid-cols-2 md:divide-x md:divide-y-0 md:divide-gray-200 dark:md:divide-gray-700">
      {/* Left: Assets */}
      <div className="px-6 py-5 space-y-4">
        <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Assets
          </h3>
        </div>

        {report.assetGroups.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No asset accounts</p>
        ) : (
          report.assetGroups.map((group) => (
            <BsGroup key={group.groupId} group={group} />
          ))
        )}

        <SectionTotal label="Total Assets" value={report.totalAssets} bold />
      </div>

      {/* Right: Liabilities + Equity + Net Profit */}
      <div className="px-6 py-5 space-y-4">
        {/* Liabilities */}
        <div className="border-b border-gray-200 pb-2 dark:border-gray-700">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Liabilities
          </h3>
        </div>

        {report.liabilityGroups.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No liability accounts</p>
        ) : (
          report.liabilityGroups.map((group) => (
            <BsGroup key={group.groupId} group={group} />
          ))
        )}

        <SectionTotal label="Total Liabilities" value={report.totalLiabilities} />

        {/* Equity */}
        <div className="border-b border-gray-200 pb-2 pt-4 dark:border-gray-700">
          <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
            Equity
          </h3>
        </div>

        {report.equityGroups.length === 0 ? (
          <p className="text-sm text-gray-400 dark:text-gray-500">No equity accounts</p>
        ) : (
          report.equityGroups.map((group) => (
            <BsGroup key={group.groupId} group={group} />
          ))
        )}

        <SectionTotal label="Total Equity" value={report.totalEquity} />

        {/* Current Period Profit */}
        <div className="flex items-center justify-between border-t border-dashed border-gray-300 pt-3 dark:border-gray-600">
          <span
            className={`text-sm font-semibold ${
              isProfitable
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {isProfitable ? "Net Profit (Current Period)" : "Net Loss (Current Period)"}
          </span>
          <span
            className={`text-sm font-semibold tabular-nums ${
              isProfitable
                ? "text-green-700 dark:text-green-400"
                : "text-red-700 dark:text-red-400"
            }`}
          >
            {fmt(Math.abs(report.netProfit))}
          </span>
        </div>

        <SectionTotal
          label="Total Liabilities + Equity"
          value={totalEquitySide}
          bold
          hint={isBalanced ? undefined : "⚠ Does not balance — check entries"}
        />
      </div>
    </div>
  );
}

function BsGroup({ group }: { group: BalanceSheetGroup }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400">
        {group.groupName}
      </div>
      {group.lines.map((line) => (
        <div key={line.ledgerId} className="flex items-center justify-between pl-4">
          <span className="text-sm text-gray-700 dark:text-gray-300">{line.ledgerName}</span>
          <span className="text-sm tabular-nums text-gray-800 dark:text-white/90">
            {fmt(line.balance)}
          </span>
        </div>
      ))}
      {group.lines.length > 1 && (
        <div className="flex items-center justify-between border-t border-dashed border-gray-200 pt-1 pl-4 dark:border-gray-700">
          <span className="text-xs font-semibold text-gray-600 dark:text-gray-300">
            {group.groupName} Total
          </span>
          <span className="text-xs font-semibold tabular-nums text-gray-700 dark:text-gray-200">
            {fmt(group.total)}
          </span>
        </div>
      )}
    </div>
  );
}

function SectionTotal({
  label,
  value,
  bold,
  hint,
}: {
  label: string;
  value: number;
  bold?: boolean;
  hint?: string;
}) {
  return (
    <div>
      <div
        className={`flex items-center justify-between border-t-2 border-gray-300 pt-3 dark:border-gray-600 ${
          bold ? "" : "mt-1"
        }`}
      >
        <span
          className={`text-sm ${bold ? "font-bold text-gray-800 dark:text-white/90" : "font-semibold text-gray-700 dark:text-gray-200"}`}
        >
          {label}
        </span>
        <span
          className={`tabular-nums ${bold ? "text-base font-bold text-gray-800 dark:text-white/90" : "text-sm font-semibold text-gray-700 dark:text-gray-200"}`}
        >
          {fmt(value)}
        </span>
      </div>
      {hint && (
        <p className="mt-1 text-xs text-amber-600 dark:text-amber-400">{hint}</p>
      )}
    </div>
  );
}
