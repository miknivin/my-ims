import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import BillWiseReceiptForm from "../../../components/page-components/transactions/bill-wise-receipt/BillWiseReceiptForm";

export default function BillWiseReceiptFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Bill Wise Receipt" />
      <BillWiseReceiptForm />
    </div>
  );
}
