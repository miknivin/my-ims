import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import { useGetDeliveryNoteByIdQuery } from "@/redux/api/deliveryNoteApi";
import { fromDeliveryNoteDto } from "./create/types/types";
import DeliveryNoteEditForm from "./DeliveryNoteEditForm";

export default function DeliveryNoteEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: dn, isLoading, isError } = useGetDeliveryNoteByIdQuery(id ?? "");

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 text-gray-500 dark:text-gray-400">
        Loading delivery note...
      </div>
    );
  }

  if (isError || !dn) {
    return (
      <div className="p-10 text-red-600 dark:text-red-400">
        Delivery note not found.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/delivery-note")}
        >
          Go back
        </button>
      </div>
    );
  }

  if (dn.status !== "Draft") {
    return (
      <div className="p-10 text-gray-500 dark:text-gray-400">
        Only Draft delivery notes can be edited.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/delivery-note")}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={`Edit ${dn.document.no}`} />
      <DeliveryNoteEditForm initialState={fromDeliveryNoteDto(dn)} id={dn.id} />
    </div>
  );
}
