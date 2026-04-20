import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import BillWisePaymentForm from "../../../components/page-components/transactions/bill-wise-payment/BillWisePaymentForm";

export default function BillWisePaymentFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Bill Wise Payment" />
      <BillWisePaymentForm />
    </div>
  );
}
