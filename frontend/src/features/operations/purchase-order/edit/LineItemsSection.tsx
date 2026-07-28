import { useGetUomsQuery } from "@/redux/api/uomApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import EditTransactionLineItemsSection from "./TransactionLineItemsSection";
import { usePurchaseOrderEditForm } from "./PurchaseOrderEditFormContext";
import {
  createDefaultLineColumnWidths,
  DEFAULT_PURCHASE_ORDER_LINE_COLUMN_KEYS,
  PurchaseOrderLineColumnKey,
} from "../create/lineItemColumns";
import { usePurchaseOrderLineColumns } from "../create/hooks/usePurchaseOrderLineColumns";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine, editConfig } = usePurchaseOrderEditForm();
  const { data: uoms = [] } = useGetUomsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = usePurchaseOrderLineColumns();
  const readOnly = editConfig.status === "Submitted";

  return (
    <EditTransactionLineItemsSection<
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
      storageKey="purchase-order-edit-lines"
      readOnly={readOnly}
      columnPickerDescription="Essential columns are preselected. Add the extra tax, tracking, and reference columns only when this PO needs them."
    />
  );
}
