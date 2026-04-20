import { useGetWarehousesQuery } from "../../../../app/api/warehouseApi";
import TransactionLineItemsSection from "../shared/TransactionLineItemsSection";
import { useSalesOrderForm } from "./SalesOrderFormContext";
import {
  createDefaultSalesOrderLineColumnWidths,
  DEFAULT_SALES_ORDER_LINE_COLUMN_KEYS,
  SalesOrderLineColumnKey,
} from "./lineItemColumns";
import { useSalesOrderLineColumns } from "./hooks/useSalesOrderLineColumns";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine } = useSalesOrderForm();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = useSalesOrderLineColumns(
    state.commercialDetails.rateLevel,
  );

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        warehouses: typeof warehouses;
        onChange: typeof updateLine;
      },
      SalesOrderLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_SALES_ORDER_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultSalesOrderLineColumnWidths}
      getRowId={(line) => line.rowId}
      getCellContext={(line) => ({
        line,
        warehouses,
        onChange: updateLine,
      })}
      onAddLine={addLine}
      onRemoveLine={(line) => removeLine(line.rowId)}
      columnPickerDescription="Core pricing and fulfillment columns are preselected. Add the extra inventory and tax columns only when this sales order needs them."
    />
  );
}
