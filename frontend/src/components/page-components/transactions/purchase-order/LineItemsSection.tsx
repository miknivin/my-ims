import { useGetUomsQuery } from "../../../../app/api/uomApi";
import { useGetWarehousesQuery } from "../../../../app/api/warehouseApi";
import TransactionLineItemsSection from "../shared/TransactionLineItemsSection";
import { usePurchaseOrderForm } from "./PurchaseOrderFormContext";
import {
  createDefaultLineColumnWidths,
  DEFAULT_PURCHASE_ORDER_LINE_COLUMN_KEYS,
  PurchaseOrderLineColumnKey,
} from "./lineItemColumns";
import { usePurchaseOrderLineColumns } from "./hooks/usePurchaseOrderLineColumns";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine } = usePurchaseOrderForm();
  const { data: uoms = [] } = useGetUomsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = usePurchaseOrderLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        taxable: boolean;
        uoms: typeof uoms;
        warehouses: typeof warehouses;
        onChange: typeof updateLine;
      },
      PurchaseOrderLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_PURCHASE_ORDER_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultLineColumnWidths}
      getRowId={(line) => line.rowId}
      getCellContext={(line) => ({
        line,
        taxable: state.footer.taxable,
        uoms,
        warehouses,
        onChange: updateLine,
      })}
      onAddLine={addLine}
      onRemoveLine={(line) => removeLine(line.rowId)}
      columnPickerDescription="Essential columns are preselected. Add the extra tax, tracking, and reference columns only when this PO needs them."
    />
  );
}
