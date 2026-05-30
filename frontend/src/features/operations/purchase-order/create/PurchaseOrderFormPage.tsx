import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import PurchaseOrderForm from "@/features/operations/purchase-order/create/PurchaseOrderForm";

export default function PurchaseOrderFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Purchase Order" />
      <PurchaseOrderForm />
    </div>
  );
}
