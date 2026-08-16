import { Route } from "react-router";
import ReportsIndexPage from "@/features/reporting/pages/ReportsIndexPage";
import FinancialStatementsPage from "@/features/reporting/financial-statements/FinancialStatementsPage";
import ReceivablesPayablesPage from "@/features/reporting/receivables-payables/ReceivablesPayablesPage";
import InventoryReportsPage from "@/features/reporting/inventory/InventoryReportsPage";
import SalesPurchasePage from "@/features/reporting/sales-purchase/SalesPurchasePage";
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
import StockStatementPage from "@/features/reporting/inventory/stock-statement/StockStatementPage";

export const reportsRoutes = (
  <Route path="/reports">
    <Route index element={<ReportsIndexPage />} />

    <Route path="financial-statements">
      <Route index element={<FinancialStatementsPage />} />
      <Route path="trial-balance" element={<TrialBalancePage />} />
      <Route path="profit-and-loss" element={<ProfitAndLossPage />} />
      <Route path="balance-sheet" element={<BalanceSheetPage />} />
      <Route path="cash-flow" element={<CashFlowPage />} />
    </Route>

    <Route path="receivables-payables">
      <Route index element={<ReceivablesPayablesPage />} />
      <Route path="receivables-ageing" element={<ReceivablesAgeingPage />} />
      <Route path="payables-ageing" element={<PayablesAgeingPage />} />
      <Route path="bill-wise-receivables" element={<BillWiseReceivablesPage />} />
      <Route path="bill-wise-payables" element={<BillWisePayablesPage />} />
    </Route>

    <Route path="inventory">
      <Route index element={<InventoryReportsPage />} />
      <Route path="stock-summary" element={<StockSummaryPage />} />
      <Route path="stock-statement" element={<StockStatementPage />} />
      <Route path="item-wise-stock" element={<ItemWiseStockPage />} />
      <Route path="stock-movement" element={<StockMovementPage />} />
      <Route path="inventory-valuation" element={<InventoryValuationPage />} />
    </Route>

    <Route path="sales-purchase">
      <Route index element={<SalesPurchasePage />} />
      <Route path="sales-register" element={<SalesRegisterPage />} />
      <Route path="purchase-register" element={<PurchaseRegisterPage />} />
    </Route>
  </Route>
);
