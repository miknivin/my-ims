import { useNavigate } from "react-router";
import { useGetBillWisePaymentsQuery } from "../../../app/api/billWisePaymentApi";
import PageBreadcrumb from "../../../components/common/PageBreadCrumb";
import ComponentCard from "../../../components/common/ComponentCard";
import Button from "../../../components/ui/button/Button";
import BillWiseDocumentTable from "../../../components/page-components/transactions/bill-wise/shared/BillWiseDocumentTable";

export default function BillWisePaymentListPage() {
  const navigate = useNavigate();
  const { data = [], isLoading, isError } = useGetBillWisePaymentsQuery();

  return (
    <div className="w-full">
      <PageBreadcrumb pageTitle="Bill Wise Payment" />

      <div className="my-5 flex w-full flex-col items-start justify-end gap-2 lg:flex-row lg:items-center lg:gap-0">
        <Button
          type="button"
          size="sm"
          variant="primary"
          onClick={() => navigate("/operations/supplier-payments/new")}
        >
          Add +
        </Button>
      </div>

      <div className="space-y-6">
        <ComponentCard title="Bill Wise Payments" desc="">
          <BillWiseDocumentTable
            rows={data}
            isLoading={isLoading}
            isError={isError}
            documentLabel="BWP No"
            partyLabel="Vendor"
            emptyMessage="No bill wise payments yet."
            getPartyName={(row) => row.vendorName}
          />
        </ComponentCard>
      </div>
    </div>
  );
}
