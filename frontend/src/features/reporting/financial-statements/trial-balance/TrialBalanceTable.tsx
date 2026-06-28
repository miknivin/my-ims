import { Fragment, useMemo } from "react";
import { TrialBalanceRow, TrialBalanceTotals } from "@/redux/api/financialStatementsApi";
import { ReportLayout } from "@/features/reporting/components";

interface Props {
  rows: TrialBalanceRow[];
  totals: TrialBalanceTotals | undefined;
  isLoading: boolean;
  isError: boolean;
}

const NATURES = ["Asset", "Liability", "Equity", "Income", "Expense"];

const fmt = (n: number) =>
  n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const TH = "px-3 py-3 text-right text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400";
const TD = "px-3 py-2.5 text-right text-sm tabular-nums text-gray-700 dark:text-gray-300";
const TD_TOTAL = "px-3 py-2.5 text-right text-sm font-semibold tabular-nums";

export default function TrialBalanceTable({ rows, totals, isLoading, isError }: Props) {
  const grouped = useMemo(() => {
    return NATURES.map((nature) => {
      const nRows = rows.filter((r) => r.nature === nature);
      const groupNames = [...new Set(nRows.map((r) => r.groupName))];
      const groups = groupNames.map((gn) => ({
        name: gn,
        rows: nRows.filter((r) => r.groupName === gn),
      }));
      return { nature, groups, rows: nRows };
    }).filter((n) => n.rows.length > 0);
  }, [rows]);

  if (isLoading) {
    return (
      <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
        Loading…
      </div>
    );
  }

  if (isError) {
    return (
      <ReportLayout.EmptyState
        title="Failed to load"
        description="Unable to fetch the trial balance. Please try again."
      />
    );
  }

  if (rows.length === 0) {
    return (
      <ReportLayout.EmptyState
        title="No transactions found"
        description="Select a date range to generate the trial balance."
      />
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
      <thead className="bg-gray-50 dark:bg-gray-800">
        <tr>
          <th
            scope="col"
            className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400"
          >
            Code
          </th>
          <th
            scope="col"
            className="px-3 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 min-w-[180px]"
          >
            Ledger Name
          </th>
          <th scope="col" className={TH}>Opening Dr</th>
          <th scope="col" className={TH}>Opening Cr</th>
          <th scope="col" className={TH}>Period Dr</th>
          <th scope="col" className={TH}>Period Cr</th>
          <th scope="col" className={TH}>Closing Dr</th>
          <th scope="col" className={TH}>Closing Cr</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
        {grouped.map(({ nature, groups }) => (
          <NatureSection key={nature} nature={nature} groups={groups} />
        ))}
      </tbody>
      {totals && (
        <tfoot className="border-t-2 border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/50">
          <tr>
            <td
              colSpan={2}
              className="px-3 py-3 text-left text-sm font-bold uppercase text-gray-800 dark:text-white/90"
            >
              Grand Total
            </td>
            <td className={`${TD_TOTAL} text-gray-800 dark:text-white/90`}>{fmt(totals.openingDebit)}</td>
            <td className={`${TD_TOTAL} text-gray-800 dark:text-white/90`}>{fmt(totals.openingCredit)}</td>
            <td className={`${TD_TOTAL} text-gray-800 dark:text-white/90`}>{fmt(totals.periodDebit)}</td>
            <td className={`${TD_TOTAL} text-gray-800 dark:text-white/90`}>{fmt(totals.periodCredit)}</td>
            <td className={`${TD_TOTAL} text-gray-800 dark:text-white/90`}>{fmt(totals.closingDebit)}</td>
            <td className={`${TD_TOTAL} text-gray-800 dark:text-white/90`}>{fmt(totals.closingCredit)}</td>
          </tr>
        </tfoot>
      )}
    </table>
  );
}

function NatureSection({
  nature,
  groups,
}: {
  nature: string;
  groups: { name: string; rows: TrialBalanceRow[] }[];
}) {
  const allRows = groups.flatMap((g) => g.rows);
  const natDr = (key: keyof TrialBalanceRow) =>
    allRows.reduce((s, r) => s + (r[key] as number), 0);

  return (
    <>
      {/* Nature header */}
      <tr className="bg-gray-100 dark:bg-gray-800/60">
        <td
          colSpan={8}
          className="px-3 py-2 text-xs font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300"
        >
          {nature}
        </td>
      </tr>

      {groups.map(({ name, rows }) => {
        const grpSum = (key: keyof TrialBalanceRow) =>
          rows.reduce((s, r) => s + (r[key] as number), 0);

        return (
          <Fragment key={name}>
            {/* Group header */}
            <tr className="bg-gray-50 dark:bg-gray-800/30">
              <td
                colSpan={8}
                className="px-3 py-1.5 pl-5 text-xs font-medium text-gray-500 dark:text-gray-400"
              >
                {name}
              </td>
            </tr>

            {/* Ledger rows */}
            {rows.map((row) => (
              <tr
                key={row.ledgerId}
                className="hover:bg-gray-50 dark:hover:bg-white/[0.02]"
              >
                <td className="px-3 py-2.5 pl-8 text-sm text-gray-500 dark:text-gray-400">
                  {row.ledgerCode}
                </td>
                <td className="px-3 py-2.5 text-sm text-gray-800 dark:text-white/90">
                  {row.ledgerName}
                </td>
                <td className={TD}>{fmt(row.openingDebit)}</td>
                <td className={TD}>{fmt(row.openingCredit)}</td>
                <td className={TD}>{fmt(row.periodDebit)}</td>
                <td className={TD}>{fmt(row.periodCredit)}</td>
                <td className={TD}>{fmt(row.closingDebit)}</td>
                <td className={TD}>{fmt(row.closingCredit)}</td>
              </tr>
            ))}

            {/* Group subtotal — only when group has multiple ledgers */}
            {rows.length > 1 && (
              <tr
                key={`gs-${name}`}
                className="border-t border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/30"
              >
                <td
                  colSpan={2}
                  className="px-3 py-2 pl-5 text-xs font-semibold text-gray-600 dark:text-gray-300"
                >
                  Total {name}
                </td>
                <td className={`${TD_TOTAL} text-gray-600 dark:text-gray-300`}>
                  {fmt(grpSum("openingDebit"))}
                </td>
                <td className={`${TD_TOTAL} text-gray-600 dark:text-gray-300`}>
                  {fmt(grpSum("openingCredit"))}
                </td>
                <td className={`${TD_TOTAL} text-gray-600 dark:text-gray-300`}>
                  {fmt(grpSum("periodDebit"))}
                </td>
                <td className={`${TD_TOTAL} text-gray-600 dark:text-gray-300`}>
                  {fmt(grpSum("periodCredit"))}
                </td>
                <td className={`${TD_TOTAL} text-gray-600 dark:text-gray-300`}>
                  {fmt(grpSum("closingDebit"))}
                </td>
                <td className={`${TD_TOTAL} text-gray-600 dark:text-gray-300`}>
                  {fmt(grpSum("closingCredit"))}
                </td>
              </tr>
            )}
          </Fragment>
        );
      })}

      {/* Nature total */}
      <tr className="border-t border-gray-300 bg-gray-100 dark:border-gray-600 dark:bg-gray-700/40">
        <td
          colSpan={2}
          className="px-3 py-2.5 text-sm font-bold text-gray-700 dark:text-gray-200"
        >
          Total {nature}
        </td>
        <td className={`${TD_TOTAL} text-gray-700 dark:text-gray-200`}>{fmt(natDr("openingDebit"))}</td>
        <td className={`${TD_TOTAL} text-gray-700 dark:text-gray-200`}>{fmt(natDr("openingCredit"))}</td>
        <td className={`${TD_TOTAL} text-gray-700 dark:text-gray-200`}>{fmt(natDr("periodDebit"))}</td>
        <td className={`${TD_TOTAL} text-gray-700 dark:text-gray-200`}>{fmt(natDr("periodCredit"))}</td>
        <td className={`${TD_TOTAL} text-gray-700 dark:text-gray-200`}>{fmt(natDr("closingDebit"))}</td>
        <td className={`${TD_TOTAL} text-gray-700 dark:text-gray-200`}>{fmt(natDr("closingCredit"))}</td>
      </tr>
    </>
  );
}
