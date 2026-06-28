import { ProfitAndLossGroup, ProfitAndLossReport } from "@/redux/api/financialStatementsApi";

interface Props {
  report: ProfitAndLossReport;
}

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ProfitAndLossStatement({ report }: Props) {
  const isProfit = report.netProfit >= 0;

  return (
    <div className="divide-y divide-gray-100 dark:divide-gray-800">
      {/* Column headers */}
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:divide-x md:divide-gray-200 dark:md:divide-gray-700">
        {/* Expenditure column (left — traditional P&L format) */}
        <StatementSection
          title="Expenditure"
          groups={report.expenseGroups}
          total={report.totalExpense}
          totalLabel="Total Expenditure"
        />

        {/* Income column (right) */}
        <StatementSection
          title="Income"
          groups={report.incomeGroups}
          total={report.totalIncome}
          totalLabel="Total Income"
        />
      </div>

      {/* Net Profit / Loss */}
      <div className="flex items-center justify-between px-6 py-4">
        <span
          className={`text-base font-bold uppercase tracking-wide ${
            isProfit
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          {isProfit ? "Net Profit" : "Net Loss"}
        </span>
        <span
          className={`text-lg font-bold tabular-nums ${
            isProfit
              ? "text-green-700 dark:text-green-400"
              : "text-red-700 dark:text-red-400"
          }`}
        >
          {fmt(Math.abs(report.netProfit))}
        </span>
      </div>
    </div>
  );
}

function StatementSection({
  title,
  groups,
  total,
  totalLabel,
}: {
  title: string;
  groups: ProfitAndLossGroup[];
  total: number;
  totalLabel: string;
}) {
  return (
    <div className="px-6 py-5 space-y-4">
      {/* Section header */}
      <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-700">
        <h3 className="text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
          {title}
        </h3>
      </div>

      {groups.length === 0 ? (
        <p className="text-sm text-gray-400 dark:text-gray-500">No entries</p>
      ) : (
        <>
          {groups.map((group) => (
            <div key={group.groupId} className="space-y-1">
              {/* Group name */}
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide dark:text-gray-400 mt-3 first:mt-0">
                {group.groupName}
              </div>

              {/* Lines */}
              {group.lines.map((line) => (
                <div
                  key={line.ledgerId}
                  className="flex items-center justify-between pl-4"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {line.ledgerName}
                  </span>
                  <span className="text-sm tabular-nums text-gray-800 dark:text-white/90">
                    {fmt(line.amount)}
                  </span>
                </div>
              ))}

              {/* Group subtotal — when multiple lines */}
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
          ))}
        </>
      )}

      {/* Section total */}
      <div className="flex items-center justify-between border-t-2 border-gray-300 pt-3 dark:border-gray-600">
        <span className="text-sm font-bold text-gray-700 dark:text-gray-200">
          {totalLabel}
        </span>
        <span className="text-sm font-bold tabular-nums text-gray-800 dark:text-white/90">
          {fmt(total)}
        </span>
      </div>
    </div>
  );
}
