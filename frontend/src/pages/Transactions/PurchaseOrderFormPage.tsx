import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PurchaseOrderForm from "../../components/page-components/transactions/purchase-order/PurchaseOrderForm";

export default function PurchaseOrderFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Purchase Order" />
      <PurchaseOrderForm />
    </div>
  );
}
