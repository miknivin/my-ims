import { useNavigate } from "react-router";
import { useGetSalesDebitNotesQuery } from "../../../app/api/salesDebitNoteApi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import AdjustmentNoteTable from "../../../components/tables/adjustments/AdjustmentNoteTable";
import Button from "../../../components/ui/button/Button";

export default function SalesDebitNoteListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetSalesDebitNotesQuery();

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Sales Debit Notes" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/adjustments/sales-debit-notes/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Sales Debit Notes" desc="">
          <AdjustmentNoteTable
            notes={data}
            isLoading={isLoading}
            isError={isError}
            documentLabel="SDN No"
            counterpartyLabel="Customer"
            emptyMessage="No sales debit notes yet."
          />
        </ComponentCard>
      </div>
    </div>
  );
}
