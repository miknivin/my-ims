import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import SalesInvoiceForm from "@/features/operations/sales-invoice/create/SalesInvoiceForm";

export default function SalesInvoiceFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Sales Invoice" />
      <SalesInvoiceForm />
    </div>
  );
}
