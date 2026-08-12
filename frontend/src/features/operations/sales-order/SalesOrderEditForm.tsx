import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import {
  useDownloadSalesOrderPdfMutation,
  useUpdateSalesOrderMutation,
} from "@/redux/api/salesOrderApi";
import {
  SalesOrderFormState,
  toSalesOrderPayload,
} from "./create/types/types";
import { SalesOrderFormProvider, useSalesOrderForm } from "./create/SalesOrderFormContext";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import LineItemsSection from "./create/LineItemsSection";
import SummaryFooterSection from "./create/SummaryFooterSection";
import OrderDetailsSection from "./create/sections/OrderDetailsSection";
import PartyInformationSection from "./create/sections/PartyInformationSection";
import CommercialDetailsSection from "./create/sections/CommercialDetailsSection";
import SalesDetailsSection from "./create/sections/SalesDetailsSection";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) return "Unable to save the sales order.";
  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the sales order.";
  }
  return error.message ?? "Unable to save the sales order.";
}

function SalesOrderEditFormBody({
  id,
  status,
}: {
  id: string;
  status: string;
}) {
  const navigate = useNavigate();
  const { state } = useSalesOrderForm();
  const [updateSalesOrder] = useUpdateSalesOrderMutation();
  const [downloadPdf] = useDownloadSalesOrderPdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const isConfirmed = status === "Confirmed";

  const validate = () => {
    setFormError("");
    if (!state.partyInformation.customerId) {
      setFormError("Please select a customer.");
      return false;
    }
    const hasValidLine = state.items.some(
      (line) => line.productId && Number.parseFloat(line.quantity) > 0,
    );
    if (!hasValidLine) {
      setFormError("Add at least one line item with a product and quantity.");
      return false;
    }
    return true;
  };

  const save = async (saveStatus?: string) => {
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateSalesOrder({
        id,
        ...toSalesOrderPayload(state, saveStatus),
      }).unwrap();
      navigate("/operations/sales-order");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void save(isConfirmed ? undefined : "Confirmed");
  };

  const handleSaveDraft = () => {
    void save("Draft");
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await downloadPdf(id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `SO-${state.orderDetails.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  const primaryLabel = isConfirmed ? "Save Changes" : "Save & Confirm";
  const draftLabel = isConfirmed ? undefined : "Save as Draft";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TransactionHeaderGrid>
        <OrderDetailsSection />
        <PartyInformationSection />
        <CommercialDetailsSection />
        <SalesDetailsSection />
      </TransactionHeaderGrid>

      <LineItemsSection />
      <SummaryFooterSection />

      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {formError}
        </div>
      ) : null}

      <TransactionStickyActionBar
        isSaving={isSaving}
        primaryLabel={primaryLabel}
        draftLabel={draftLabel}
        onDraft={draftLabel ? handleSaveDraft : undefined}
        onReset={() => setFormError("")}
        onCancel={() => navigate("/operations/sales-order")}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </form>
  );
}

export default function SalesOrderEditForm({
  initialState,
  id,
  status,
}: {
  initialState: SalesOrderFormState;
  id: string;
  status: string;
}) {
  return (
    <SalesOrderFormProvider initialState={initialState}>
      <SalesOrderEditFormBody id={id} status={status} />
    </SalesOrderFormProvider>
  );
}
