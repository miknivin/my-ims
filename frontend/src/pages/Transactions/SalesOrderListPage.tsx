import { useState } from "react";
import { useNavigate } from "react-router";
import { useGetSalesOrdersQuery } from "../../app/api/salesOrderApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import SalesOrderTable from "../../components/tables/SalesOrderTable";

export default function SalesOrderListPage() {
  const navigate = useNavigate();
  const [keyword, setKeyword] = useState("");
  const { data = [], isLoading, isError } = useGetSalesOrdersQuery({
    keyword,
  });

  const salesOrders = data;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Sales Order" />

      <div className="my-5 flex w-full flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <input
          className="h-10 w-full rounded-lg border border-gray-300 bg-transparent px-4 py-2 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white/90 lg:max-w-sm"
          value={keyword}
          onChange={(event) => setKeyword(event.target.value)}
          placeholder="Search order or customer"
        />
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/sales-order/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Sales Orders" desc="">
          <SalesOrderTable
            salesOrders={salesOrders}
            isLoading={isLoading}
            isError={isError}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
