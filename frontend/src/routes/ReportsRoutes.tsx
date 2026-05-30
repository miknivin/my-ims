import { Route } from "react-router";
import ReportingPlaceholder from "@/features/reporting/pages/ReportingPlaceholder";
import SalesRegisterPage from "@/features/reporting/sales-purchase/sales-register/SalesRegisterPage";

const reportPlaceholders = [
  {
    path: "financial-statements/trial-balance",
    title: "Trial Balance",
  },
  {
    path: "financial-statements/profit-and-loss",
    title: "Profit and Loss",
  },
  {
    path: "financial-statements/balance-sheet",
    title: "Balance Sheet",
  },
  {
    path: "financial-statements/cash-flow",
    title: "Cash Flow",
  },
  {
    path: "receivables-payables/receivables-ageing",
    title: "Receivables Ageing",
  },
  {
    path: "receivables-payables/payables-ageing",
    title: "Payables Ageing",
  },
  {
    path: "receivables-payables/bill-wise-receivables",
    title: "Bill-wise Receivables",
  },
  {
    path: "receivables-payables/bill-wise-payables",
    title: "Bill-wise Payables",
  },
  {
    path: "inventory/stock-summary",
    title: "Stock Summary",
  },
  {
    path: "inventory/item-wise-stock",
    title: "Item-wise Stock",
  },
  {
    path: "inventory/stock-movement",
    title: "Stock Movement",
  },
  {
    path: "inventory/inventory-valuation",
    title: "Inventory Valuation",
  },
  {
    path: "sales-purchase/purchase-register",
    title: "Purchase Register",
  },
];

export const reportsRoutes = (
  <Route path="/reports">
    <Route
      path="sales-purchase/sales-register"
      element={<SalesRegisterPage />}
    />
    {reportPlaceholders.map((report) => (
      <Route
        key={report.path}
        path={report.path}
        element={
          <ReportingPlaceholder title={report.title} />
        }
      />
    ))}
  </Route>
);
