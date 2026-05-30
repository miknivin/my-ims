import SharedAdditionsSection from "@/features/operations/shared/AdditionsSection";
import { usePurchaseAdjustmentNoteForm } from "./PurchaseAdjustmentNoteFormContext";

export default function AdditionsSection() {
  const { state, addAddition, updateAddition, removeAddition } =
    usePurchaseAdjustmentNoteForm();

  return (
    <SharedAdditionsSection
      additions={state.additions}
      onAdd={addAddition}
      onUpdate={updateAddition}
      onRemove={removeAddition}
      description="Capture freight, ledger-linked adjustments, and deductions here."
    />
  );
}
