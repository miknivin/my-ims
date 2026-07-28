import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import {
  useCreateDeliveryNoteMutation,
  usePreviewDeliveryNotePdfMutation,
} from "@/redux/api/deliveryNoteApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import {
  DeliveryNoteFormProvider,
  useDeliveryNoteForm,
} from "./DeliveryNoteFormContext";
import LineItemsSection from "./LineItemsSection";
import SummaryFooterSection from "./SummaryFooterSection";
import {
  DELIVERY_NOTE_DRAFT_STORAGE_KEY,
  toDeliveryNotePayload,
} from "./types/types";
import LogisticsSection from "./sections/LogisticsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import CustomerInformationSection from "./sections/CustomerInformationSection";
import DeliveryNotePdfPreviewModal from "../DeliveryNotePdfPreviewModal";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) return "Unable to save the delivery note.";

  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the delivery note.";
  }

  return error.message ?? "Unable to save the delivery note.";
}

function DeliveryNoteFormBody() {
  const navigate = useNavigate();
  const { state, reset } = useDeliveryNoteForm();
  const [createDeliveryNote] = useCreateDeliveryNoteMutation();
  const [previewPdf] = usePreviewDeliveryNotePdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showSubmitAlert, setShowSubmitAlert] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validate = () => {
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Delivery note number is required.");
      return false;
    }

    if (!state.customerInformation.customerId) {
      setFormError("Please select a customer.");
      return false;
    }

    if (
      state.sourceRef.mode === "AgainstSalesOrder" &&
      !state.sourceRef.salesOrderId
    ) {
      setFormError("Please choose a sales order reference.");
      return false;
    }

    const hasValidLine = state.items.some(
      (line) =>
        line.productId &&
        line.unitId &&
        line.warehouseId &&
        Number.parseFloat(line.quantity) > 0,
    );

    if (!hasValidLine) {
      setFormError(
        "Add at least one line item with a product, unit, warehouse, and quantity.",
      );
      return false;
    }

    return true;
  };

  const clearAndRedirect = () => {
    window.localStorage.removeItem(DELIVERY_NOTE_DRAFT_STORAGE_KEY);
    reset();
    navigate("/operations/delivery-note");
  };

  const saveDn = async (status: "Draft" | "Submitted") => {
    setIsSaving(true);
    try {
      await createDeliveryNote({
        ...toDeliveryNotePayload(state),
        status,
      }).unwrap();
      clearAndRedirect();
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
    if (validate()) {
      setShowSubmitAlert(true);
    }
  };

  const handleDraft = () => {
    if (validate()) {
      void saveDn("Draft");
    }
  };

  const handlePreview = async () => {
    setFormError("");
    if (!validate()) return;

    setIsPreviewing(true);
    try {
      const url = await previewPdf(toDeliveryNotePayload(state)).unwrap();
      setPreviewUrl(url);
    } catch {
      setFormError("Failed to generate PDF preview. Please try again.");
    } finally {
      setIsPreviewing(false);
    }
  };

  const closePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <>
      <DeliveryNotePdfPreviewModal url={previewUrl} onClose={closePreview} />
      <ConfirmAlert
        open={showSubmitAlert}
        title="Submit delivery note?"
        message="This will save the Delivery Note as Submitted. Stock effects (if any) will be handled by the associated Sales Invoice."
        confirmLabel="Submit"
        isConfirming={isSaving}
        onConfirm={() => {
          setShowSubmitAlert(false);
          void saveDn("Submitted");
        }}
        onCancel={() => setShowSubmitAlert(false)}
      />

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
          primaryLabel="Submit"
          draftLabel="Save as Draft"
          onDraft={handleDraft}
          onReset={() => {
            reset();
            window.localStorage.removeItem(DELIVERY_NOTE_DRAFT_STORAGE_KEY);
            setFormError("");
          }}
          onCancel={() => navigate("/operations/delivery-note")}
          onPreview={handlePreview}
          isPreviewing={isPreviewing}
        />
      </form>
    </>
  );
}

export default function DeliveryNoteForm() {
  return (
    <DeliveryNoteFormProvider>
      <DeliveryNoteFormBody />
    </DeliveryNoteFormProvider>
  );
}
