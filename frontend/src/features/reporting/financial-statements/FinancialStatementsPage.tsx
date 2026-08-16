import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ReportCategoryCard from "../components/ReportCategoryCard";

const reports = [
  {
    title: "Trial Balance",
    description:
      "Closing debit and credit balances for all ledger accounts, with optional zero-balance toggle.",
    path: "/reports/financial-statements/trial-balance",
  },
  {
    title: "Profit & Loss",
    description:
      "Income and expense summary showing gross profit, operating profit, and net profit for a period.",
    path: "/reports/financial-statements/profit-and-loss",
  },
  {
    title: "Balance Sheet",
    description:
      "Snapshot of assets, liabilities, and equity as of any date.",
    path: "/reports/financial-statements/balance-sheet",
  },
  {
    title: "Cash Flow",
    description:
      "Operating, investing, and financing cash flows for a selected period.",
    path: "/reports/financial-statements/cash-flow",
  },
];

export default function FinancialStatementsPage() {
  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Financial Statements" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Financial Statements
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Core financial reports for your business — trial balance, P&L, balance sheet, and cash flow.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reports.map((r) => (
            <ReportCategoryCard key={r.path} {...r} />
          ))}
        </div>
      </div>
    </div>
  );
}
