import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ReportCategoryCard from "../components/ReportCategoryCard";

const reports = [
  {
    title: "Receivables Ageing",
    description:
      "Outstanding customer balances bucketed by ageing period — current, 30, 60, 90+ days.",
    path: "/reports/receivables-payables/receivables-ageing",
  },
  {
    title: "Payables Ageing",
    description:
      "Outstanding vendor balances bucketed by ageing period — current, 30, 60, 90+ days.",
    path: "/reports/receivables-payables/payables-ageing",
  },
  {
    title: "Bill-wise Receivables",
    description:
      "Invoice-level breakdown of customer outstanding with due dates and payment status.",
    path: "/reports/receivables-payables/bill-wise-receivables",
  },
  {
    title: "Bill-wise Payables",
    description:
      "Invoice-level breakdown of vendor outstanding with due dates and payment status.",
    path: "/reports/receivables-payables/bill-wise-payables",
  },
];

export default function ReceivablesPayablesPage() {
  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Receivables & Payables" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Receivables & Payables
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Ageing analysis and bill-wise outstanding for customers and vendors.
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
