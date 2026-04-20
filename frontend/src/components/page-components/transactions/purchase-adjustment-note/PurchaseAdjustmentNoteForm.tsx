import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import { useCreatePurchaseCreditNoteMutation } from "../../../../app/api/purchaseCreditNoteApi";
import { useCreatePurchaseDebitNoteMutation } from "../../../../app/api/purchaseDebitNoteApi";
import TransactionHeaderGrid from "../shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
import LineItemsSection from "./LineItemsSection";
import {
  PurchaseAdjustmentNoteFormProvider,
  usePurchaseAdjustmentNoteForm,
} from "./PurchaseAdjustmentNoteFormContext";
import SummaryFooterSection from "./SummaryFooterSection";
import {
  parsePurchaseAdjustmentNumber,
  PurchaseAdjustmentNoteVariant,
  PURCHASE_ADJUSTMENT_NOTE_CONFIG,
  toPurchaseCreditNotePayload,
  toPurchaseDebitNotePayload,
} from "./types/types";
import FinancialDetailsSection from "./sections/FinancialDetailsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import ProcurementSection from "./sections/ProcurementSection";
import VendorInformationSection from "./sections/VendorInformationSection";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
  title: string,
) {
  if (!error) {
    return `Unable to save the ${title.toLowerCase()}.`;
  }

  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? `Unable to save the ${title.toLowerCase()}.`;
  }

  return error.message ?? `Unable to save the ${title.toLowerCase()}.`;
}

function PurchaseAdjustmentNoteFormBody() {
  const navigate = useNavigate();
  const { config, state, reset } = usePurchaseAdjustmentNoteForm();
  const [createPurchaseCreditNote] = useCreatePurchaseCreditNoteMutation();
  const [createPurchaseDebitNote] = useCreatePurchaseDebitNoteMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError(`${config.title} number is required.`);
      return;
    }

    if (!state.sourceRef.referenceId) {
      setFormError("Please select a source purchase invoice.");
      return;
    }

    if (!state.vendorInformation.vendorId) {
      setFormError("Vendor details must come from the selected purchase invoice.");
      return;
    }

    const activeLines = state.items.filter(
      (line) =>
        line.sourceLineId &&
        line.productId &&
        line.unitId &&
        parsePurchaseAdjustmentNumber(line.quantity) +
          parsePurchaseAdjustmentNumber(line.foc) >
          0,
    );

    if (activeLines.length === 0) {
      setFormError(
        "Keep at least one source line with a positive quantity or FOC amount.",
      );
      return;
    }

    if (
      state.noteNature === "Return" &&
      activeLines.some((line) => !line.warehouseId)
    ) {
      setFormError("Warehouse is required on every return line.");
      return;
    }

    setIsSaving(true);

    try {
      if (config.variant === "credit") {
        await createPurchaseCreditNote(
          toPurchaseCreditNotePayload(state),
        ).unwrap();
      } else {
        await createPurchaseDebitNote(toPurchaseDebitNotePayload(state)).unwrap();
      }

      window.localStorage.removeItem(config.storageKey);
      reset();
      navigate(config.listPath);
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error as FetchBaseQueryError | SerializedError,
          config.title,
        ),
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
        <FinancialDetailsSection />
        <ProcurementSection />
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
        primaryLabel={config.primaryActionLabel}
        onReset={() => {
          reset();
          window.localStorage.removeItem(config.storageKey);
          setFormError("");
        }}
        onCancel={() => navigate(config.listPath)}
      />
    </form>
  );
}

export default function PurchaseAdjustmentNoteForm({
  variant,
}: {
  variant: PurchaseAdjustmentNoteVariant;
}) {
  const config = PURCHASE_ADJUSTMENT_NOTE_CONFIG[variant];

  return (
    <PurchaseAdjustmentNoteFormProvider variant={config.variant}>
      <PurchaseAdjustmentNoteFormBody />
    </PurchaseAdjustmentNoteFormProvider>
  );
}
