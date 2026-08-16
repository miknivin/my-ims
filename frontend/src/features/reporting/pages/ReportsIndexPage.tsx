import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ReportCategoryCard from "../components/ReportCategoryCard";

const categories = [
  {
    title: "Financial Statements",
    description:
      "Trial balance, profit & loss, balance sheet, and cash flow reports for your business.",
    path: "/reports/financial-statements",
    label: "Explore",
  },
  {
    title: "Receivables & Payables",
    description:
      "Ageing analysis and bill-wise outstanding balances for customers and vendors.",
    path: "/reports/receivables-payables",
    label: "Explore",
  },
  {
    title: "Inventory",
    description:
      "Stock balances, movements, valuation, and item-wise analysis across warehouses.",
    path: "/reports/inventory",
    label: "Explore",
  },
  {
    title: "Sales & Purchase",
    description:
      "Transaction registers for sales and purchase invoices with flexible filtering.",
    path: "/reports/sales-purchase",
    label: "Explore",
  },
];

export default function ReportsIndexPage() {
  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Reports" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Report Categories
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Select a category to explore the available reports.
          </p>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <ReportCategoryCard key={cat.path} {...cat} />
          ))}
        </div>
      </div>
    </div>
  );
}
