import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import PurchaseInvoiceForm from "@/features/operations/purchase-invoice/create/PurchaseInvoiceForm";

export default function PurchaseInvoiceFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Purchase Invoice" />
      <PurchaseInvoiceForm />
    </div>
  );
}

