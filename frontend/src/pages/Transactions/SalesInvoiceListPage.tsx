import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetSalesInvoicesQuery } from "../../app/api/salesInvoiceApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import SalesInvoiceTable from "../../components/tables/SalesInvoiceTable";

export default function SalesInvoiceListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const { data = [], isLoading, isError } = useGetSalesInvoicesQuery({
    keyword,
  });

  const salesInvoices = data;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Sales Invoice" />

      <div className="my-5 flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 lg:max-w-sm"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search invoice or customer"
        />
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/sales-invoice/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Sales Invoices" desc="">
          <SalesInvoiceTable
            salesInvoices={salesInvoices}
            isLoading={isLoading}
            isError={isError}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
