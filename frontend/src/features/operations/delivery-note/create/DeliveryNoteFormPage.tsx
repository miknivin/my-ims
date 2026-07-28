import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import DeliveryNoteForm from "@/features/operations/delivery-note/create/DeliveryNoteForm";

export default function DeliveryNoteFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Delivery Note" />
      <DeliveryNoteForm />
    </div>
  );
}
