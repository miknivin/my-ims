import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import SalesAdjustmentNoteForm from "../../../components/page-components/transactions/sales-adjustment-note/SalesAdjustmentNoteForm";

export default function SalesDebitNoteFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Sales Debit Note" />
      <SalesAdjustmentNoteForm variant="debit" />
    </div>
  );
}
