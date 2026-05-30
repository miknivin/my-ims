import { useGetUomsQuery } from "@/redux/api/uomApi";
import { useGetWarehousesQuery } from "@/redux/api/warehouseApi";
import TransactionLineItemsSection from "@/features/operations/shared/TransactionLineItemsSection";
import { useGoodsReceiptForm } from "./GoodsReceiptFormContext";
import {
  createDefaultGoodsReceiptLineColumnWidths,
  DEFAULT_GOODS_RECEIPT_LINE_COLUMN_KEYS,
  GoodsReceiptLineColumnKey,
} from "./lineItemColumns";
import { useGoodsReceiptLineColumns } from "./hooks/useGoodsReceiptLineColumns";

export default function LineItemsSection() {
  const { state, addLine, updateLine, removeLine } = useGoodsReceiptForm();
  const { data: uoms = [] } = useGetUomsQuery();
  const { data: warehouses = [] } = useGetWarehousesQuery();
  const lineColumns = useGoodsReceiptLineColumns();

  return (
    <TransactionLineItemsSection<
      (typeof state.items)[number],
      {
        line: (typeof state.items)[number];
        uoms: typeof uoms;
        warehouses: typeof warehouses;
        onChange: typeof updateLine;
      },
      GoodsReceiptLineColumnKey
    >
      lines={state.items}
      columns={lineColumns}
      defaultSelectedColumns={DEFAULT_GOODS_RECEIPT_LINE_COLUMN_KEYS}
      createDefaultColumnWidths={createDefaultGoodsReceiptLineColumnWidths}
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
      columnPickerDescription="Choose the GRN line columns you want to work with while keeping the shared transaction table behavior consistent."
    />
  );
}
