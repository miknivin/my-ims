import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import { useCreateGoodsReceiptNoteMutation } from "../../../../app/api/goodsReceiptNoteApi";
import TransactionHeaderGrid from "../shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
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
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Goods receipt number is required.");
      return;
    }

    if (!state.vendorInformation.vendorId) {
      setFormError("Please select a vendor.");
      return;
    }

    if (
      state.sourceRef.mode === "AgainstPurchaseOrder" &&
      !state.sourceRef.purchaseOrderId
    ) {
      setFormError("Please choose a purchase order reference.");
      return;
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
      return;
    }

    setIsSaving(true);

    try {
      await createGoodsReceiptNote(toGoodsReceiptPayload(state)).unwrap();
      window.localStorage.removeItem(GOODS_RECEIPT_NOTE_DRAFT_STORAGE_KEY);
      reset();
      navigate("/operations/goods-receipt-note");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(error as FetchBaseQueryError | SerializedError),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
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
        primaryLabel="Save Goods Receipt"
        onReset={() => {
          reset();
          window.localStorage.removeItem(GOODS_RECEIPT_NOTE_DRAFT_STORAGE_KEY);
          setFormError("");
        }}
        onCancel={() => navigate("/operations/goods-receipt-note")}
      />
    </form>
  );
}

export default function GoodsReceiptForm() {
  return (
    <GoodsReceiptFormProvider>
      <GoodsReceiptFormBody />
    </GoodsReceiptFormProvider>
  );
}
