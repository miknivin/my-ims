import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import SalesOrderForm from "../../components/page-components/transactions/sales-order/SalesOrderForm";

export default function SalesOrderFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Sales Order" />
      <SalesOrderForm />
    </div>
  );
}
