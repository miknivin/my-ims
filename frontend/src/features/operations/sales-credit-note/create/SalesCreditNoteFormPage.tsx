import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import SalesAdjustmentNoteForm from "@/features/operations/shared/adjustment-notes/sales-adjustment-note/SalesAdjustmentNoteForm";

export default function SalesCreditNoteFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Sales Credit Note" />
      <SalesAdjustmentNoteForm variant="credit" />
    </div>
  );
}
