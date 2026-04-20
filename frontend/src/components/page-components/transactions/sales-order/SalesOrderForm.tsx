import { FormEvent, useState } from "react";
import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import { useCreateSalesOrderMutation } from "../../../../app/api/salesOrderApi";
import TransactionHeaderGrid from "../shared/TransactionHeaderGrid";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
import LineItemsSection from "./LineItemsSection";
import { SalesOrderFormProvider, useSalesOrderForm } from "./SalesOrderFormContext";
import SummaryFooterSection from "./SummaryFooterSection";
import { toSalesOrderPayload } from "./types/types";
import CommercialDetailsSection from "./sections/CommercialDetailsSection";
import OrderDetailsSection from "./sections/OrderDetailsSection";
import PartyInformationSection from "./sections/PartyInformationSection";
import SalesDetailsSection from "./sections/SalesDetailsSection";

function getMutationErrorMessage(
  error: FetchBaseQueryError | SerializedError | undefined,
) {
  if (!error) {
    return "Unable to save the sales order.";
  }

  if ("status" in error) {
    const errorData = error.data as { message?: string } | undefined;
    return errorData?.message ?? "Unable to save the sales order.";
  }

  return error.message ?? "Unable to save the sales order.";
}

function SalesOrderFormBody() {
  const navigate = useNavigate();
  const { state, reset } = useSalesOrderForm();
  const [createSalesOrder] = useCreateSalesOrderMutation();
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.orderDetails.no.trim()) {
      setFormError("Sales order number is required.");
      return;
    }

    if (!state.partyInformation.customerId) {
      setFormError("Please select a customer.");
      return;
    }

    const hasValidLine = state.items.some(
      (line) => line.productId && Number.parseFloat(line.quantity) > 0,
    );

    if (!hasValidLine) {
      setFormError("Add at least one line item with a product and quantity.");
      return;
    }

    setIsSaving(true);

    try {
      await createSalesOrder(toSalesOrderPayload(state)).unwrap();
      reset();
      navigate("/operations/sales-order");
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
        primaryLabel="Save Sales Order"
        onReset={() => {
          reset();
          setFormError("");
        }}
        onCancel={() => navigate("/operations/sales-order")}
      />
    </form>
  );
}

export default function SalesOrderForm() {
  return (
    <SalesOrderFormProvider>
      <SalesOrderFormBody />
    </SalesOrderFormProvider>
  );
}
