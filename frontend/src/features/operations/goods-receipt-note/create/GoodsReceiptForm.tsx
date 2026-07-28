import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import {
  useCreateGoodsReceiptNoteMutation,
  usePreviewGoodsReceiptNotePdfMutation,
} from "@/redux/api/goodsReceiptNoteApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import TransactionHeaderGrid from "@/features/operations/shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "@/features/operations/shared/TransactionStickyActionBar";
import {
  GoodsReceiptFormProvider,
  useGoodsReceiptForm,
} from "./GoodsReceiptFormContext";
import LineItemsSection from "./LineItemsSection";
import SummaryFooterSection from "./SummaryFooterSection";
import {
  GOODS_RECEIPT_NOTE_DRAFT_STORAGE_KEY,
  toGoodsReceiptPayload,
} from "./types/types";
import LogisticsSection from "./sections/LogisticsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import VendorInformationSection from "./sections/VendorInformationSection";
import GoodsReceiptNotePdfPreviewModal from "../GoodsReceiptNotePdfPreviewModal";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) {
    return "Unable to save the goods receipt note.";
  }

  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the goods receipt note.";
  }

  return error.message ?? "Unable to save the goods receipt note.";
}

function GoodsReceiptFormBody() {
  const navigate = useNavigate();
  const { state, reset } = useGoodsReceiptForm();
  const [createGoodsReceiptNote] = useCreateGoodsReceiptNoteMutation();
  const [previewPdf] = usePreviewGoodsReceiptNotePdfMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [showSubmitAlert, setShowSubmitAlert] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const validate = () => {
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Goods receipt number is required.");
      return false;
    }

    if (!state.vendorInformation.vendorId) {
      setFormError("Please select a vendor.");
      return false;
    }

    if (
      state.sourceRef.mode === "AgainstPurchaseOrder" &&
      !state.sourceRef.purchaseOrderId
    ) {
      setFormError("Please choose a purchase order reference.");
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
    window.localStorage.removeItem(GOODS_RECEIPT_NOTE_DRAFT_STORAGE_KEY);
    reset();
    navigate("/operations/goods-receipt-note");
  };

  const saveGrn = async (status: "Draft" | "Submitted") => {
    setIsSaving(true);
    try {
      await createGoodsReceiptNote({
        ...toGoodsReceiptPayload(state),
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
      void saveGrn("Draft");
    }
  };

  const handlePreview = async () => {
    setFormError("");
    if (!validate()) return;

    setIsPreviewing(true);
    try {
      const url = await previewPdf(toGoodsReceiptPayload(state)).unwrap();
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
      <GoodsReceiptNotePdfPreviewModal url={previewUrl} onClose={closePreview} />
      <ConfirmAlert
        open={showSubmitAlert}
        title="Submit goods receipt note?"
        message="This will save the GRN as Submitted and post the related inventory and journal effects."
        confirmLabel="Submit"
        isConfirming={isSaving}
        onConfirm={() => {
          setShowSubmitAlert(false);
          void saveGrn("Submitted");
        }}
        onCancel={() => setShowSubmitAlert(false)}
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <TransactionHeaderGrid>
          <OrderDetailsSection />
          <VendorInformationSection />
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
            window.localStorage.removeItem(GOODS_RECEIPT_NOTE_DRAFT_STORAGE_KEY);
            setFormError("");
          }}
          onCancel={() => navigate("/operations/goods-receipt-note")}
          onPreview={handlePreview}
          isPreviewing={isPreviewing}
        />
      </form>
    </>
  );
}

export default function GoodsReceiptForm() {
  return (
    <GoodsReceiptFormProvider>
      <GoodsReceiptFormBody />
    </GoodsReceiptFormProvider>
  );
}
