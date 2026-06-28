import { Route } from "react-router";
import SalesRegisterPage from "@/features/reporting/sales-purchase/sales-register/SalesRegisterPage";
import PurchaseRegisterPage from "@/features/reporting/sales-purchase/purchase-register/PurchaseRegisterPage";
import TrialBalancePage from "@/features/reporting/financial-statements/trial-balance/TrialBalancePage";
import ProfitAndLossPage from "@/features/reporting/financial-statements/profit-and-loss/ProfitAndLossPage";
import BalanceSheetPage from "@/features/reporting/financial-statements/balance-sheet/BalanceSheetPage";
import CashFlowPage from "@/features/reporting/financial-statements/cash-flow/CashFlowPage";
import ReceivablesAgeingPage from "@/features/reporting/receivables-payables/receivables-ageing/ReceivablesAgeingPage";
import PayablesAgeingPage from "@/features/reporting/receivables-payables/payables-ageing/PayablesAgeingPage";
import BillWiseReceivablesPage from "@/features/reporting/receivables-payables/bill-wise-receivables/BillWiseReceivablesPage";
import BillWisePayablesPage from "@/features/reporting/receivables-payables/bill-wise-payables/BillWisePayablesPage";
import StockSummaryPage from "@/features/reporting/inventory/stock-summary/StockSummaryPage";
import ItemWiseStockPage from "@/features/reporting/inventory/item-wise-stock/ItemWiseStockPage";
import StockMovementPage from "@/features/reporting/inventory/stock-movement/StockMovementPage";
import InventoryValuationPage from "@/features/reporting/inventory/inventory-valuation/InventoryValuationPage";

export const reportsRoutes = (
  <Route path="/reports">
    <Route path="sales-purchase/sales-register" element={<SalesRegisterPage />} />
    <Route path="sales-purchase/purchase-register" element={<PurchaseRegisterPage />} />

    <Route path="financial-statements/trial-balance" element={<TrialBalancePage />} />
    <Route path="financial-statements/profit-and-loss" element={<ProfitAndLossPage />} />
    <Route path="financial-statements/balance-sheet" element={<BalanceSheetPage />} />
    <Route path="financial-statements/cash-flow" element={<CashFlowPage />} />

    <Route path="receivables-payables/receivables-ageing" element={<ReceivablesAgeingPage />} />
    <Route path="receivables-payables/payables-ageing" element={<PayablesAgeingPage />} />
    <Route path="receivables-payables/bill-wise-receivables" element={<BillWiseReceivablesPage />} />
    <Route path="receivables-payables/bill-wise-payables" element={<BillWisePayablesPage />} />

    <Route path="inventory/stock-summary" element={<StockSummaryPage />} />
    <Route path="inventory/item-wise-stock" element={<ItemWiseStockPage />} />
    <Route path="inventory/stock-movement" element={<StockMovementPage />} />
    <Route path="inventory/inventory-valuation" element={<InventoryValuationPage />} />
  </Route>
);
