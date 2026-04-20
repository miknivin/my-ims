import { useGetWarehousesQuery } from "../../../../app/api/warehouseApi";
import TransactionLineItemsSection from "../shared/TransactionLineItemsSection";
import { useSalesAdjustmentNoteLineColumns } from "./hooks/useSalesAdjustmentNoteLineColumns";
import {
  createDefaultSalesAdjustmentNoteLineColumnWidths,
  DEFAULT_SALES_ADJUSTMENT_NOTE_LINE_COLUMN_KEYS,
  SalesAdjustmentNoteLineColumnKey,
} from "./lineItemColumns";
import { useSalesAdjustmentNoteForm } from "./SalesAdjustmentNoteFormContext";

export default function LineItemsSection() {
  const { state, updateLine, removeLine } = useSalesAdjustmentNoteForm();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = useSalesAdjustmentNoteLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        warehouses: typeof warehouses;
        onChange: typeof updateLine;
      },
      SalesAdjustmentNoteLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_SALES_ADJUSTMENT_NOTE_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultSalesAdjustmentNoteLineColumnWidths}
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
      columnPickerDescription="Choose the quantity, tax, warehouse, and value columns this sales adjustment note needs while keeping source-linked line rows intact."
    />
  );
}
