import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import GoodsReceiptForm from "../../components/page-components/transactions/goods-receipt-note/GoodsReceiptForm";

export default function GoodsReceiptNoteFormPage() {
  return (
    <div className="w-full space-y-6">
      <PageBreadcrumb pageTitle="New Goods Receipt Note" />
      <GoodsReceiptForm />
    </div>
  );
}
