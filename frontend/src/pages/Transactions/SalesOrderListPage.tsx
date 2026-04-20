import { useNavigate } from "react-router";
import { useGetSalesOrdersQuery } from "../../app/api/salesOrderApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import SalesOrderTable from "../../components/tables/SalesOrderTable";

export default function SalesOrderListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetSalesOrdersQuery();

  const salesOrders = data;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Sales Order" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
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
