import { useNavigate } from "react-router";
import { useGetSalesCreditNotesQuery } from "../../../app/api/salesCreditNoteApi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import AdjustmentNoteTable from "../../../components/tables/adjustments/AdjustmentNoteTable";
import Button from "../../../components/ui/button/Button";

export default function SalesCreditNoteListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetSalesCreditNotesQuery();

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Sales Credit Notes" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/adjustments/sales-credit-notes/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Sales Credit Notes" desc="">
          <AdjustmentNoteTable
            notes={data}
            isLoading={isLoading}
            isError={isError}
            documentLabel="SCN No"
            counterpartyLabel="Customer"
            emptyMessage="No sales credit notes yet."
          />
        </ComponentCard>
      </div>
    </div>
  );
}
