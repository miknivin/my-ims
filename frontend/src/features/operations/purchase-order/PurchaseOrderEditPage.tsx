import { useParams, useNavigate } from "react-router";
import { useGetPurchaseOrderByIdQuery } from "@/redux/api/purchaseOrderApi";
import { fromPurchaseOrderDto } from "./create/types/types";
import PurchaseOrderEditForm from "./edit/PurchaseOrderEditForm";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";

export default function PurchaseOrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: po, isLoading, isError } = useGetPurchaseOrderByIdQuery(id ?? "");

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 text-gray-500 dark:text-gray-400">
        Loading purchase order...
      </div>
    );
  }

  if (isError || !po) {
    return (
      <div className="p-10 text-red-600 dark:text-red-400">
        Purchase order not found.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/purchase-order")}
        >
          Go back
        </button>
      </div>
    );
  }

  if (po.status === "Cancelled") {
    return (
      <div className="p-10 text-gray-500 dark:text-gray-400">
        Cancelled purchase orders cannot be edited.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/purchase-order")}
        >
          Go back
        </button>
      </div>
    );
  }

  const initialState = fromPurchaseOrderDto(po);
  const editConfig = { id: po.id, status: po.status };

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={`Edit ${po.orderDetails.no}`} />
      <PurchaseOrderEditForm initialState={initialState} editConfig={editConfig} />
    </div>
  );
}
