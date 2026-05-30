import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import BillWisePaymentForm from "@/features/operations/bill-wise-payment/create/BillWisePaymentForm";

export default function BillWisePaymentFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Bill Wise Payment" />
      <BillWisePaymentForm />
    </div>
  );
}
