import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import {
  useCreateSalesCreditNoteMutation,
} from "../../../../app/api/salesCreditNoteApi";
import {
  useCreateSalesDebitNoteMutation,
} from "../../../../app/api/salesDebitNoteApi";
import TransactionHeaderGrid from "../shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
import LineItemsSection from "./LineItemsSection";
import {
  SalesAdjustmentNoteFormProvider,
  useSalesAdjustmentNoteForm,
} from "./SalesAdjustmentNoteFormContext";
import SummaryFooterSection from "./SummaryFooterSection";
import {
  parseSalesAdjustmentNumber,
  SALES_ADJUSTMENT_NOTE_CONFIG,
  SalesAdjustmentNoteVariant,
  toSalesCreditNotePayload,
  toSalesDebitNotePayload,
} from "./types/types";
import CustomerInformationSection from "./sections/CustomerInformationSection";
import FinancialDetailsSection from "./sections/FinancialDetailsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";

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

function SalesAdjustmentNoteFormBody() {
  const navigate = useNavigate();
  const { config, state, reset } = useSalesAdjustmentNoteForm();
  const [createSalesCreditNote] = useCreateSalesCreditNoteMutation();
  const [createSalesDebitNote] = useCreateSalesDebitNoteMutation();
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
      setFormError("Please select a source sales invoice.");
      return;
    }

    if (!state.customerInformation.customerId) {
      setFormError("Customer details must come from the selected sales invoice.");
      return;
    }

    const activeLines = state.items.filter(
      (line) =>
        line.sourceLineId &&
        line.productId &&
        line.unitId &&
        parseSalesAdjustmentNumber(line.quantity) > 0,
    );

    if (activeLines.length === 0) {
      setFormError("Keep at least one source line with a positive quantity.");
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
        await createSalesCreditNote(toSalesCreditNotePayload(state)).unwrap();
      } else {
        await createSalesDebitNote(toSalesDebitNotePayload(state)).unwrap();
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
        <CustomerInformationSection />
        <FinancialDetailsSection />
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

export default function SalesAdjustmentNoteForm({
  variant,
}: {
  variant: SalesAdjustmentNoteVariant;
}) {
  const config = SALES_ADJUSTMENT_NOTE_CONFIG[variant];

  return (
    <SalesAdjustmentNoteFormProvider variant={config.variant}>
      <SalesAdjustmentNoteFormBody />
    </SalesAdjustmentNoteFormProvider>
  );
}
