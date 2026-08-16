import { inventoryReportsApi } from "@/redux/api/inventoryReportsApi";
import { financialStatementsApi } from "@/redux/api/financialStatementsApi";
import { salesRegisterReportApi } from "@/redux/api/salesRegisterReportApi";
import { purchaseRegisterReportApi } from "@/redux/api/purchaseRegisterReportApi";
import { receivablesPayablesApi } from "@/redux/api/receivablesPayablesApi";
import type { AppDispatch } from "@/redux/store";

const INVENTORY_TAGS = new Set(["StockSummary", "StockSummaryEnhanced", "StockStatement", "ItemWiseStock", "StockMovement", "InventoryValuation"]);
const FINANCIAL_TAGS = new Set(["TrialBalance", "ProfitAndLoss", "BalanceSheet", "CashFlow"]);
const SALES_TAGS = new Set(["SalesRegisterReport"]);
const PURCHASE_TAGS = new Set(["PurchaseRegisterReport"]);
const RECV_PAY_TAGS = new Set(["ReceivablesAgeing", "PayablesAgeing", "BillWiseReceivables", "BillWisePayables"]);

export function dispatchInvalidations(dispatch: AppDispatch, tags: string[]): void {
  const tagSet = new Set(tags);

  const inventoryHits = tags.filter((t) => INVENTORY_TAGS.has(t)) as Parameters<typeof inventoryReportsApi.util.invalidateTags>[0];
  if (inventoryHits.length > 0) dispatch(inventoryReportsApi.util.invalidateTags(inventoryHits));

  const financialHits = tags.filter((t) => FINANCIAL_TAGS.has(t)) as Parameters<typeof financialStatementsApi.util.invalidateTags>[0];
  if (financialHits.length > 0) dispatch(financialStatementsApi.util.invalidateTags(financialHits));

  if (tagSet.has("SalesRegisterReport")) dispatch(salesRegisterReportApi.util.invalidateTags(["SalesRegisterReport"]));
  if (tagSet.has("PurchaseRegisterReport")) dispatch(purchaseRegisterReportApi.util.invalidateTags(["PurchaseRegisterReport"]));

  const recvPayHits = tags.filter((t) => RECV_PAY_TAGS.has(t)) as Parameters<typeof receivablesPayablesApi.util.invalidateTags>[0];
  if (recvPayHits.length > 0) dispatch(receivablesPayablesApi.util.invalidateTags(recvPayHits));
}
