import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ReportCategoryCard from "../components/ReportCategoryCard";

const reports = [
  {
    title: "Stock Summary",
    description:
      "Current stock quantity and value per item as of today, grouped by category or warehouse.",
    path: "/reports/inventory/stock-summary",
  },
  {
    title: "Item-wise Stock",
    description:
      "Opening, inward, outward, and closing quantities with unit cost and value for any date range.",
    path: "/reports/inventory/item-wise-stock",
  },
  {
    title: "Stock Statement",
    description:
      "Detailed stock movement summary grouped by category or warehouse for a selected period.",
    path: "/reports/inventory/stock-statement",
  },
  {
    title: "Stock Movement",
    description:
      "Line-by-line movement history for a specific item — every receipt, issue, and transfer.",
    path: "/reports/inventory/stock-movement",
  },
  {
    title: "Inventory Valuation",
    description:
      "Stock value at cost for any as-of date, broken down by item, category, or warehouse.",
    path: "/reports/inventory/inventory-valuation",
  },
];

export default function InventoryReportsPage() {
  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Inventory" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Inventory Reports
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Stock balances, movements, and valuation across your warehouses.
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
