import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import { useGetSalesOrderByIdQuery } from "@/redux/api/salesOrderApi";
import { fromSalesOrderDto } from "./create/types/types";
import SalesOrderEditForm from "./SalesOrderEditForm";

export default function SalesOrderEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: so, isLoading, isError } = useGetSalesOrderByIdQuery(id ?? "");

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 text-gray-500 dark:text-gray-400">
        Loading sales order...
      </div>
    );
  }

  if (isError || !so) {
    return (
      <div className="p-10 text-red-600 dark:text-red-400">
        Sales order not found.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/sales-order")}
        >
          Go back
        </button>
      </div>
    );
  }

  if (so.status === "Cancelled") {
    return (
      <div className="p-10 text-gray-500 dark:text-gray-400">
        Cancelled sales orders cannot be edited.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/sales-order")}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={`Edit ${so.orderDetails.no}`} />
      <SalesOrderEditForm
        initialState={fromSalesOrderDto(so)}
        id={so.id}
        status={so.status}
      />
    </div>
  );
}
