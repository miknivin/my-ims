import { useNavigate } from "react-router";
import { useGetGoodsReceiptNotesQuery } from "@/redux/api/goodsReceiptNoteApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ComponentCard from "@/shared/components/common/ComponentCard";
import GoodsReceiptNoteTable from "@/features/operations/goods-receipt-note/GoodsReceiptNoteTable";
import Button from "@/shared/components/ui/button/Button";

export default function GoodsReceiptNoteListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetGoodsReceiptNotesQuery();

  const goodsReceipts = data;

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Goods Receipt Note" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/goods-receipt-note/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Goods Receipt Notes" desc="">
          <GoodsReceiptNoteTable
            goodsReceipts={goodsReceipts}
            isLoading={isLoading}
            isError={isError}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
