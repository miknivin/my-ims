import { useGetUomsQuery } from "../../../../app/api/uomApi";
import { useGetWarehousesQuery } from "../../../../app/api/warehouseApi";
import TransactionLineItemsSection from "../shared/TransactionLineItemsSection";
import { usePurchaseInvoiceForm } from "./PurchaseInvoiceFormContext";
import {
  createDefaultLineColumnWidths,
  DEFAULT_PURCHASE_INVOICE_LINE_COLUMN_KEYS,
  PurchaseInvoiceLineColumnKey,
} from "./lineItemColumns";
import { usePurchaseInvoiceLineColumns } from "./hooks/usePurchaseInvoiceLineColumns";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine } = usePurchaseInvoiceForm();
  const { data: uoms = [] } = useGetUomsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = usePurchaseInvoiceLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        uoms: typeof uoms;
        warehouses: typeof warehouses;
        onChange: typeof updateLine;
      },
      PurchaseInvoiceLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_PURCHASE_INVOICE_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultLineColumnWidths}
      getRowId={(line) => line.rowId}
      getCellContext={(line) => ({
        line,
        uoms,
        warehouses,
        onChange: updateLine,
      })}
      onAddLine={addLine}
      onRemoveLine={(line) => removeLine(line.rowId)}
      columnPickerDescription="Choose the costing, pricing, tax, and warehouse columns this purchase invoice needs without changing the shared transaction table behavior."
    />
  );
}
