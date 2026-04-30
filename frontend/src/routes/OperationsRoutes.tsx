import { Route } from "react-router";
import OperationsPage from "../pages/Operations/OperationsPage";
import GoodsReceiptNoteFormPage from "../pages/Transactions/GoodsReceiptNoteFormPage";
import GoodsReceiptNoteListPage from "../pages/Transactions/GoodsReceiptNoteListPage";
import PurchaseInvoiceAiFormPage from "../pages/Transactions/PurchaseInvoiceAiFormPage";
import PurchaseInvoiceFormPage from "../pages/Transactions/PurchaseInvoiceFormPage";
import PurchaseInvoiceListPage from "../pages/Transactions/PurchaseInvoiceListPage";
import PurchaseOrderFormPage from "../pages/Transactions/PurchaseOrderFormPage";
import PurchaseOrderListPage from "../pages/Transactions/PurchaseOrderListPage";
import SalesInvoiceFormPage from "../pages/Transactions/SalesInvoiceFormPage";
import SalesInvoiceListPage from "../pages/Transactions/SalesInvoiceListPage";
import SalesOrderFormPage from "../pages/Transactions/SalesOrderFormPage";
import SalesOrderListPage from "../pages/Transactions/SalesOrderListPage";
import PurchaseCreditNoteFormPage from "../pages/Transactions/Adjustments/PurchaseCreditNoteFormPage";
import PurchaseCreditNoteListPage from "../pages/Transactions/Adjustments/PurchaseCreditNoteListPage";
import PurchaseDebitNoteFormPage from "../pages/Transactions/Adjustments/PurchaseDebitNoteFormPage";
import PurchaseDebitNoteListPage from "../pages/Transactions/Adjustments/PurchaseDebitNoteListPage";
import SalesCreditNoteFormPage from "../pages/Transactions/Adjustments/SalesCreditNoteFormPage";
import SalesCreditNoteListPage from "../pages/Transactions/Adjustments/SalesCreditNoteListPage";
import SalesDebitNoteFormPage from "../pages/Transactions/Adjustments/SalesDebitNoteFormPage";
import SalesDebitNoteListPage from "../pages/Transactions/Adjustments/SalesDebitNoteListPage";
import BillWisePaymentFormPage from "../pages/Transactions/BillWise/BillWisePaymentFormPage";
import BillWisePaymentListPage from "../pages/Transactions/BillWise/BillWisePaymentListPage";
import BillWiseReceiptFormPage from "../pages/Transactions/BillWise/BillWiseReceiptFormPage";
import BillWiseReceiptListPage from "../pages/Transactions/BillWise/BillWiseReceiptListPage";
import MastersPlaceholder from "../pages/Masters/MastersPlaceholder";

export const operationsRoutes = (
  <Route path="/operations">
    <Route index element={<OperationsPage />} />
    <Route path="purchase-order">
      <Route index element={<PurchaseOrderListPage />} />
      <Route path="new" element={<PurchaseOrderFormPage />} />
    </Route>
    <Route path="sales-order">
      <Route index element={<SalesOrderListPage />} />
      <Route path="new" element={<SalesOrderFormPage />} />
    </Route>
    <Route path="purchase-invoice">
      <Route index element={<PurchaseInvoiceListPage />} />
      <Route path="new" element={<PurchaseInvoiceFormPage />} />
      <Route path="new-ai" element={<PurchaseInvoiceAiFormPage />} />
    </Route>
    <Route path="sales-invoice">
      <Route index element={<SalesInvoiceListPage />} />
      <Route path="new" element={<SalesInvoiceFormPage />} />
    </Route>
    <Route path="goods-receipt-note">
      <Route index element={<GoodsReceiptNoteListPage />} />
      <Route path="new" element={<GoodsReceiptNoteFormPage />} />
    </Route>
    <Route
      path="stock-adjustment"
      element={
        <MastersPlaceholder
          title="Stock Adjustment"
          description="Stock adjustment module shell is ready for later integration."
        />
      }
    />
    <Route
      path="stock-transfer"
      element={
        <MastersPlaceholder
          title="Stock Transfer"
          description="Stock transfer module shell is ready for later integration."
        />
      }
    />
    <Route path="adjustments/sales-credit-notes">
      <Route index element={<SalesCreditNoteListPage />} />
      <Route path="new" element={<SalesCreditNoteFormPage />} />
    </Route>
    <Route path="adjustments/sales-debit-notes">
      <Route index element={<SalesDebitNoteListPage />} />
      <Route path="new" element={<SalesDebitNoteFormPage />} />
    </Route>
    <Route path="adjustments/purchase-credit-notes">
      <Route index element={<PurchaseCreditNoteListPage />} />
      <Route path="new" element={<PurchaseCreditNoteFormPage />} />
    </Route>
    <Route path="adjustments/purchase-debit-notes">
      <Route index element={<PurchaseDebitNoteListPage />} />
      <Route path="new" element={<PurchaseDebitNoteFormPage />} />
    </Route>
    <Route path="customer-receipts">
      <Route index element={<BillWiseReceiptListPage />} />
      <Route path="new" element={<BillWiseReceiptFormPage />} />
    </Route>
    <Route path="supplier-payments">
      <Route index element={<BillWisePaymentListPage />} />
      <Route path="new" element={<BillWisePaymentFormPage />} />
    </Route>
  </Route>
);
