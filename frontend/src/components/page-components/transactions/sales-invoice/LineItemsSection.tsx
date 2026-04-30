import TransactionLineItemsSection from "../shared/TransactionLineItemsSection";
import { useSalesInvoiceLineColumns } from "./hooks/useSalesInvoiceLineColumns";
import {
  createDefaultSalesInvoiceLineColumnWidths,
  DEFAULT_SALES_INVOICE_LINE_COLUMN_KEYS,
  SalesInvoiceLineColumnKey,
} from "./lineItemColumns";
import { useSalesInvoiceForm } from "./SalesInvoiceFormContext";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine } = useSalesInvoiceForm();
  const lineColumns = useSalesInvoiceLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        onChange: typeof updateLine;
      },
      SalesInvoiceLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_SALES_INVOICE_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultSalesInvoiceLineColumnWidths}
      getRowId={(line) => line.rowId}
      getCellContext={(line) => ({
        line,
        onChange: updateLine,
      })}
      onAddLine={addLine}
      onRemoveLine={(line) => removeLine(line.rowId)}
      columnPickerDescription="Choose the product, tax, warehouse, and profitability columns this sales invoice needs without changing the shared transaction line-item behavior."
    />
  );
}
