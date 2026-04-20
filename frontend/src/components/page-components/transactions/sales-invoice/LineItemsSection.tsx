import { useGetWarehousesQuery } from "../../../../app/api/warehouseApi";
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
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = useSalesInvoiceLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        warehouses: typeof warehouses;
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
        warehouses,
        onChange: updateLine,
      })}
      onAddLine={addLine}
      onRemoveLine={(line) => removeLine(line.rowId)}
      columnPickerDescription="Choose the product, tax, warehouse, and profitability columns this sales invoice needs without changing the shared transaction line-item behavior."
    />
  );
}
