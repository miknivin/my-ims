import { useNavigate } from "react-router";
import { useGetGoodsReceiptNotesQuery } from "../../app/api/goodsReceiptNoteApi";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import GoodsReceiptNoteTable from "../../components/tables/GoodsReceiptNoteTable";
import Button from "../../components/ui/button/Button";

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
