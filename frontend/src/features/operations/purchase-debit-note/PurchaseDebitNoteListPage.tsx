import { useNavigate } from "react-router";
import { useGetPurchaseDebitNotesQuery } from "@/redux/api/purchaseDebitNoteApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ComponentCard from "@/shared/components/common/ComponentCard";
import AdjustmentNoteTable from "@/features/operations/shared/AdjustmentNoteTable";
import Button from "@/shared/components/ui/button/Button";

export default function PurchaseDebitNoteListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetPurchaseDebitNotesQuery();

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Purchase Debit Notes" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/adjustments/purchase-debit-notes/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Purchase Debit Notes" desc="">
          <AdjustmentNoteTable
            notes={data}
            isLoading={isLoading}
            isError={isError}
            documentLabel="PDN No"
            counterpartyLabel="Vendor"
            emptyMessage="No purchase debit notes yet."
          />
        </ComponentCard>
      </div>
    </div>
  );
}
