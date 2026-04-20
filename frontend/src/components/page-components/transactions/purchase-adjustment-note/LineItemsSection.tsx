import { useGetWarehousesQuery } from "../../../../app/api/warehouseApi";
import TransactionLineItemsSection from "../shared/TransactionLineItemsSection";
import { usePurchaseAdjustmentNoteLineColumns } from "./hooks/usePurchaseAdjustmentNoteLineColumns";
import {
  createDefaultPurchaseAdjustmentLineColumnWidths,
  DEFAULT_PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMN_KEYS,
  PurchaseAdjustmentNoteLineColumnKey,
} from "./lineItemColumns";
import { usePurchaseAdjustmentNoteForm } from "./PurchaseAdjustmentNoteFormContext";

export default function LineItemsSection() {
  const { state, updateLine, removeLine } = usePurchaseAdjustmentNoteForm();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = usePurchaseAdjustmentNoteLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        warehouses: typeof warehouses;
        onChange: typeof updateLine;
      },
      PurchaseAdjustmentNoteLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_PURCHASE_ADJUSTMENT_NOTE_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultPurchaseAdjustmentLineColumnWidths}
      getRowId={(line) => line.rowId}
      getCellContext={(line) => ({
        line,
        warehouses,
        onChange: updateLine,
      })}
      onAddLine={() => undefined}
      onRemoveLine={(line) => removeLine(line.rowId)}
      showAddButton={false}
      sectionTitle="Line Items"
      columnPickerDescription="Choose the costing, tax, pricing, and warehouse columns this purchase adjustment note needs while keeping source-linked line rows intact."
    />
  );
}
