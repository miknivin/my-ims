import { useNavigate } from "react-router";
import { useGetBillWiseReceiptsQuery } from "@/redux/api/billWiseReceiptApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import ComponentCard from "@/shared/components/common/ComponentCard";
import Button from "@/shared/components/ui/button/Button";
import BillWiseDocumentTable from "@/features/operations/shared/bill-wise/BillWiseDocumentTable";

export default function BillWiseReceiptListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetBillWiseReceiptsQuery();

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Bill Wise Receipt" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/customer-receipts/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Bill Wise Receipts" desc="">
          <BillWiseDocumentTable
            rows={data}
            isLoading={isLoading}
            isError={isError}
            documentLabel="BWR No"
            partyLabel="Customer"
            emptyMessage="No bill wise receipts yet."
            getPartyName={(row) => row.customerName}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
