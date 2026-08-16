import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ReportCategoryCard from "../components/ReportCategoryCard";

const reports = [
  {
    title: "Sales Register",
    description:
      "All sales invoices with filtering by date, customer, status, and keyword — paginated and sortable.",
    path: "/reports/sales-purchase/sales-register",
  },
  {
    title: "Purchase Register",
    description:
      "All purchase invoices with filtering by date, vendor, status, and keyword — paginated and sortable.",
    path: "/reports/sales-purchase/purchase-register",
  },
];

export default function SalesPurchasePage() {
  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Sales & Purchase" />
      <div className="min-h-screen rounded-2xl border border-gray-200 bg-white px-5 py-7 dark:border-gray-800 dark:bg-white/[0.03] xl:px-10 xl:py-12">
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
            Sales & Purchase Reports
          </h3>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Transaction registers for sales and purchase invoices.
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
