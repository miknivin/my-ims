import { useNavigate } from "react-router";
import { useGetPurchaseOrdersQuery } from "../../app/api/purchaseOrderApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import PurchaseOrderTable from "../../components/tables/PurchaseOrderTable";

export default function PurchaseOrderListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetPurchaseOrdersQuery();

  const purchaseOrders = data;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Purchase Order" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/purchase-order/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Purchase Orders" desc="">
          <PurchaseOrderTable
            purchaseOrders={purchaseOrders}
            isLoading={isLoading}
            isError={isError}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
