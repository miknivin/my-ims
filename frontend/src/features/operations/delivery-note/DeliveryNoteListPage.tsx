import { useNavigate } from "react-router";
import { useGetDeliveryNotesQuery } from "@/redux/api/deliveryNoteApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ComponentCard from "@/shared/components/common/ComponentCard";
import DeliveryNoteTable from "@/features/operations/delivery-note/DeliveryNoteTable";
import Button from "@/shared/components/ui/button/Button";

export default function DeliveryNoteListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetDeliveryNotesQuery();

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Delivery Note" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/delivery-note/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Delivery Notes" desc="">
          <DeliveryNoteTable
            deliveryNotes={data}
            isLoading={isLoading}
            isError={isError}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
