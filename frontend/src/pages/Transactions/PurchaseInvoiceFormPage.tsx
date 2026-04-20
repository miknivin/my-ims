import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PurchaseInvoiceForm from "../../components/page-components/transactions/purchase-invoice/PurchaseInvoiceForm";

export default function PurchaseInvoiceFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Purchase Invoice" />
      <PurchaseInvoiceForm />
    </div>
  );
}

