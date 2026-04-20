import { useNavigate } from "react-router";
import { useGetPurchaseInvoicesQuery } from "../../app/api/purchaseInvoiceApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import PurchaseInvoiceTable from "../../components/tables/PurchaseInvoiceTable";

export default function PurchaseInvoiceListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetPurchaseInvoicesQuery();

  const purchaseInvoices = data;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Purchase Invoice" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/purchase-invoice/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Purchase Invoices" desc="">
          <PurchaseInvoiceTable
            purchaseInvoices={purchaseInvoices}
            isLoading={isLoading}
            isError={isError}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
