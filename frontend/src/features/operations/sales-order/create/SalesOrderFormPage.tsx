import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import SalesOrderForm from "@/features/operations/sales-order/create/SalesOrderForm";

export default function SalesOrderFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Sales Order" />
      <SalesOrderForm />
    </div>
  );
}
