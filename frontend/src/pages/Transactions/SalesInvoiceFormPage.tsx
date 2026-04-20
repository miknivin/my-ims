import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SalesInvoiceForm from "../../components/page-components/transactions/sales-invoice/SalesInvoiceForm";

export default function SalesInvoiceFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Sales Invoice" />
      <SalesInvoiceForm />
    </div>
  );
}
