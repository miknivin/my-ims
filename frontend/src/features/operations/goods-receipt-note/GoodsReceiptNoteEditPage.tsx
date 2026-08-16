import { useNavigate, useParams } from "react-router";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import { useGetGoodsReceiptNoteByIdQuery } from "@/redux/api/goodsReceiptNoteApi";
import { fromGoodsReceiptNoteDto } from "./create/types/types";
import GoodsReceiptNoteEditForm from "./GoodsReceiptNoteEditForm";

export default function GoodsReceiptNoteEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: grn, isLoading, isError } = useGetGoodsReceiptNoteByIdQuery(id ?? "");

  if (isLoading) {
    return (
      <div className="flex justify-center p-10 text-gray-500 dark:text-gray-400">
        Loading goods receipt note...
      </div>
    );
  }

  if (isError || !grn) {
    return (
      <div className="p-10 text-red-600 dark:text-red-400">
        Goods receipt note not found.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/goods-receipt-note")}
        >
          Go back
        </button>
      </div>
    );
  }

  if (grn.status !== "Draft") {
    return (
      <div className="p-10 text-gray-500 dark:text-gray-400">
        Only Draft goods receipt notes can be edited.{" "}
        <button
          type="button"
          className="underline"
          onClick={() => navigate("/operations/goods-receipt-note")}
        >
          Go back
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle={`Edit ${grn.document.no}`} />
      <GoodsReceiptNoteEditForm initialState={fromGoodsReceiptNoteDto(grn)} id={grn.id} />
    </div>
  );
}
