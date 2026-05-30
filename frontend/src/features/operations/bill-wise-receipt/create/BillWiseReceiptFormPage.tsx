import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import BillWiseReceiptForm from "@/features/operations/bill-wise-receipt/create/BillWiseReceiptForm";

export default function BillWiseReceiptFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Bill Wise Receipt" />
      <BillWiseReceiptForm />
    </div>
  );
}
