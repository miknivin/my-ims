import SharedAdditionsSection from "@/features/operations/shared/AdditionsSection";
import { useSalesAdjustmentNoteForm } from "./SalesAdjustmentNoteFormContext";

export default function AdditionsSection() {
  const { state, addAddition, updateAddition, removeAddition } =
    useSalesAdjustmentNoteForm();

  return (
    <SharedAdditionsSection
      additions={state.additions}
      onAdd={addAddition}
      onUpdate={updateAddition}
      onRemove={removeAddition}
      description="Capture freight, adjustments, and deductions for this note here."
    />
  );
}
