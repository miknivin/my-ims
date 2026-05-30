import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import PurchaseAdjustmentNoteForm from "@/features/operations/shared/adjustment-notes/purchase-adjustment-note/PurchaseAdjustmentNoteForm";

export default function PurchaseCreditNoteFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Purchase Credit Note" />
      <PurchaseAdjustmentNoteForm variant="credit" />
    </div>
  );
}
