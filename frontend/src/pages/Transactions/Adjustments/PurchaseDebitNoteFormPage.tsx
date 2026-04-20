import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import PurchaseAdjustmentNoteForm from "../../../components/page-components/transactions/purchase-adjustment-note/PurchaseAdjustmentNoteForm";

export default function PurchaseDebitNoteFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Purchase Debit Note" />
      <PurchaseAdjustmentNoteForm variant="debit" />
    </div>
  );
}
