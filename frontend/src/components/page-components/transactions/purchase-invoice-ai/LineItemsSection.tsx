import TransactionLineItemsSection from "../shared/TransactionLineItemsSection";
import { usePurchaseInvoiceForm } from "./PurchaseInvoiceFormContext";
import {
  createDefaultLineColumnWidths,
  DEFAULT_PURCHASE_INVOICE_LINE_COLUMN_KEYS,
  PurchaseInvoiceLineColumnKey,
} from "../purchase-invoice/lineItemColumns";
import { usePurchaseInvoiceLineColumns } from "../purchase-invoice/hooks/usePurchaseInvoiceLineColumns";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine } = usePurchaseInvoiceForm();
  const lineColumns = usePurchaseInvoiceLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
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
        onChange: updateLine,
      })}
      onAddLine={addLine}
      onRemoveLine={(line) => removeLine(line.rowId)}
      columnPickerDescription="Choose the costing, pricing, tax, and warehouse columns this purchase invoice needs without changing the shared transaction table behavior."
    />
  );
}
