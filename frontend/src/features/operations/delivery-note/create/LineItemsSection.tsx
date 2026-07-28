import { useGetUomsQuery } from "@/redux/api/uomApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import TransactionLineItemsSection from "@/features/operations/shared/TransactionLineItemsSection";
import { useDeliveryNoteForm } from "./DeliveryNoteFormContext";
import {
  createDefaultDeliveryNoteLineColumnWidths,
  DEFAULT_DELIVERY_NOTE_LINE_COLUMN_KEYS,
  DeliveryNoteLineColumnKey,
} from "./lineItemColumns";
import { useDeliveryNoteLineColumns } from "./hooks/useDeliveryNoteLineColumns";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine } = useDeliveryNoteForm();
  const { data: uoms = [] } = useGetUomsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = useDeliveryNoteLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        uoms: typeof uoms;
        warehouses: typeof warehouses;
        onChange: typeof updateLine;
      },
      DeliveryNoteLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_DELIVERY_NOTE_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultDeliveryNoteLineColumnWidths}
      getRowId={(line) => line.rowId}
      getCellContext={(line) => ({
        line,
        uoms,
        warehouses,
        onChange: updateLine,
      })}
      onAddLine={addLine}
      onRemoveLine={(line) => removeLine(line.rowId)}
      sectionTitle="Line Items"
      storageKey="delivery-note-lines"
      columnPickerDescription="Choose the DN line columns you want to work with while keeping the shared transaction table behavior consistent."
    />
  );
}
