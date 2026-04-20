import { useNavigate } from "react-router";
import { useGetSalesInvoicesQuery } from "../../app/api/salesInvoiceApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import Button from "../../components/ui/button/Button";
import SalesInvoiceTable from "../../components/tables/SalesInvoiceTable";

export default function SalesInvoiceListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetSalesInvoicesQuery();

  const salesInvoices = data;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Sales Invoice" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
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
