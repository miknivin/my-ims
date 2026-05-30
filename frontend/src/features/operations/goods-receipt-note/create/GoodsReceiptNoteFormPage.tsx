import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import GoodsReceiptForm from "@/features/operations/goods-receipt-note/create/GoodsReceiptForm";

export default function GoodsReceiptNoteFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Goods Receipt Note" />
      <GoodsReceiptForm />
    </div>
  );
}
