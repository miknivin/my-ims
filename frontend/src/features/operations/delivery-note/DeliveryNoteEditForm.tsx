import { FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { SerializedError } from "@reduxjs/toolkit";
import {
  useUpdateDeliveryNoteMutation,
  useDownloadDeliveryNotePdfMutation,
} from "@/redux/api/deliveryNoteApi";
import { DeliveryNoteFormState, toDeliveryNotePayload } from "./create/types/types";
import { DeliveryNoteFormProvider, useDeliveryNoteForm } from "./create/DeliveryNoteFormContext";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import LineItemsSection from "./create/LineItemsSection";
import SummaryFooterSection from "./create/SummaryFooterSection";
import OrderDetailsSection from "./create/sections/OrderDetailsSection";
import CustomerInformationSection from "./create/sections/CustomerInformationSection";
import LogisticsSection from "./create/sections/LogisticsSection";

function getMutationErrorMessage(error: FetchBaseQueryError | SerializedError | undefined) {
  if (!error) return "Unable to save the delivery note.";
  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the delivery note.";
  }
  return error.message ?? "Unable to save the delivery note.";
}

function DeliveryNoteEditFormBody({ id }: { id: string }) {
  const navigate = useNavigate();
  const { state } = useDeliveryNoteForm();
  const [updateDeliveryNote] = useUpdateDeliveryNoteMutation();
  const [downloadPdf] = useDownloadDeliveryNotePdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  const validate = () => {
    setFormError("");
    if (!state.customerInformation.customerId) {
      setFormError("Please select a customer.");
      return false;
    }
    if (state.sourceRef.mode === "AgainstSalesOrder" && !state.sourceRef.salesOrderId) {
      setFormError("Please choose a sales order reference.");
      return false;
    }
    const hasValidLine = state.items.some(
      (line) => line.productId && line.unitId && line.warehouseId && Number.parseFloat(line.quantity) > 0,
    );
    if (!hasValidLine) {
      setFormError("Add at least one line item with a product, unit, warehouse, and quantity.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validate()) return;
    setIsSaving(true);
    try {
      await updateDeliveryNote({ id, ...toDeliveryNotePayload(state) }).unwrap();
      navigate("/operations/delivery-note");
    } catch (error) {
      setFormError(getMutationErrorMessage(error as FetchBaseQueryError | SerializedError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      const url = await downloadPdf(id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `DN-${state.document.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <TransactionHeaderGrid>
        <OrderDetailsSection />
        <CustomerInformationSection />
        <LogisticsSection />
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
        primaryLabel="Save Changes"
        onReset={() => setFormError("")}
        onCancel={() => navigate("/operations/delivery-note")}
        onDownload={handleDownload}
        isDownloading={isDownloading}
      />
    </form>
  );
}

export default function DeliveryNoteEditForm({
  initialState,
  id,
}: {
  initialState: DeliveryNoteFormState;
  id: string;
}) {
  return (
    <DeliveryNoteFormProvider initialState={initialState}>
      <DeliveryNoteEditFormBody id={id} />
    </DeliveryNoteFormProvider>
  );
}
