import { useNavigate } from "react-router";
import { useGetPurchaseCreditNotesQuery } from "../../../app/api/purchaseCreditNoteApi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import AdjustmentNoteTable from "../../../components/tables/adjustments/AdjustmentNoteTable";
import Button from "../../../components/ui/button/Button";

export default function PurchaseCreditNoteListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetPurchaseCreditNotesQuery();

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Purchase Credit Notes" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/adjustments/purchase-credit-notes/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Purchase Credit Notes" desc="">
          <AdjustmentNoteTable
            notes={data}
            isLoading={isLoading}
            isError={isError}
            documentLabel="PCN No"
            counterpartyLabel="Vendor"
            emptyMessage="No purchase credit notes yet."
          />
        </ComponentCard>
      </div>
    </div>
  );
}
