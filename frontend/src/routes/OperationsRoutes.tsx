import { Route } from "react-router";
import OperationsPage from "@/features/operations/OperationsPage";
import DeliveryNoteFormPage from "@/features/operations/delivery-note/create/DeliveryNoteFormPage";
import DeliveryNoteListPage from "@/features/operations/delivery-note/DeliveryNoteListPage";
import DeliveryNoteViewPage from "@/features/operations/delivery-note/DeliveryNoteViewPage";
import GoodsReceiptNoteFormPage from "@/features/operations/goods-receipt-note/create/GoodsReceiptNoteFormPage";
import GoodsReceiptNoteListPage from "@/features/operations/goods-receipt-note/GoodsReceiptNoteListPage";
import GoodsReceiptNoteViewPage from "@/features/operations/goods-receipt-note/GoodsReceiptNoteViewPage";
import PurchaseInvoiceAiFormPage from "@/features/operations/purchase-invoice/create/ai/PurchaseInvoiceAiFormPage";
import PurchaseInvoiceFormPage from "@/features/operations/purchase-invoice/create/PurchaseInvoiceFormPage";
import PurchaseInvoiceListPage from "@/features/operations/purchase-invoice/PurchaseInvoiceListPage";
import PurchaseInvoiceViewPage from "@/features/operations/purchase-invoice/PurchaseInvoiceViewPage";
import PurchaseOrderFormPage from "@/features/operations/purchase-order/create/PurchaseOrderFormPage";
import PurchaseOrderListPage from "@/features/operations/purchase-order/PurchaseOrderListPage";
import PurchaseOrderEditPage from "@/features/operations/purchase-order/PurchaseOrderEditPage";
import PurchaseOrderViewPage from "@/features/operations/purchase-order/PurchaseOrderViewPage";
import SalesInvoiceFormPage from "@/features/operations/sales-invoice/create/SalesInvoiceFormPage";
import SalesInvoiceListPage from "@/features/operations/sales-invoice/SalesInvoiceListPage";
import SalesInvoiceViewPage from "@/features/operations/sales-invoice/SalesInvoiceViewPage";
import DeliveryNoteEditPage from "@/features/operations/delivery-note/DeliveryNoteEditPage";
import GoodsReceiptNoteEditPage from "@/features/operations/goods-receipt-note/GoodsReceiptNoteEditPage";
import SalesOrderFormPage from "@/features/operations/sales-order/create/SalesOrderFormPage";
import SalesOrderListPage from "@/features/operations/sales-order/SalesOrderListPage";
import SalesOrderEditPage from "@/features/operations/sales-order/SalesOrderEditPage";
import SalesOrderViewPage from "@/features/operations/sales-order/SalesOrderViewPage";
import PurchaseCreditNoteFormPage from "@/features/operations/purchase-credit-note/create/PurchaseCreditNoteFormPage";
import PurchaseCreditNoteListPage from "@/features/operations/purchase-credit-note/PurchaseCreditNoteListPage";
import PurchaseCreditNoteViewPage from "@/features/operations/purchase-credit-note/PurchaseCreditNoteViewPage";
import PurchaseDebitNoteFormPage from "@/features/operations/purchase-debit-note/create/PurchaseDebitNoteFormPage";
import PurchaseDebitNoteListPage from "@/features/operations/purchase-debit-note/PurchaseDebitNoteListPage";
import PurchaseDebitNoteViewPage from "@/features/operations/purchase-debit-note/PurchaseDebitNoteViewPage";
import SalesCreditNoteFormPage from "@/features/operations/sales-credit-note/create/SalesCreditNoteFormPage";
import SalesCreditNoteListPage from "@/features/operations/sales-credit-note/SalesCreditNoteListPage";
import SalesCreditNoteViewPage from "@/features/operations/sales-credit-note/SalesCreditNoteViewPage";
import SalesDebitNoteFormPage from "@/features/operations/sales-debit-note/create/SalesDebitNoteFormPage";
import SalesDebitNoteListPage from "@/features/operations/sales-debit-note/SalesDebitNoteListPage";
import SalesDebitNoteViewPage from "@/features/operations/sales-debit-note/SalesDebitNoteViewPage";
import BillWisePaymentFormPage from "@/features/operations/bill-wise-payment/create/BillWisePaymentFormPage";
import BillWisePaymentListPage from "@/features/operations/bill-wise-payment/BillWisePaymentListPage";
import BillWisePaymentViewPage from "@/features/operations/bill-wise-payment/BillWisePaymentViewPage";
import BillWiseReceiptFormPage from "@/features/operations/bill-wise-receipt/create/BillWiseReceiptFormPage";
import BillWiseReceiptListPage from "@/features/operations/bill-wise-receipt/BillWiseReceiptListPage";
import BillWiseReceiptViewPage from "@/features/operations/bill-wise-receipt/BillWiseReceiptViewPage";
import JournalVoucherListPage from "@/features/operations/accounting/journal-vouchers/JournalVoucherListPage";
import JournalVoucherViewPage from "@/features/operations/accounting/journal-vouchers/JournalVoucherViewPage";
import MastersPlaceholder from "@/features/masters/pages/Masters/MastersPlaceholder";

export const operationsRoutes = (
  <Route path="/operations">
    <Route index element={<OperationsPage />} />
    <Route path="purchase-order">
      <Route index element={<PurchaseOrderListPage />} />
      <Route path="new" element={<PurchaseOrderFormPage />} />
      <Route path=":id/edit" element={<PurchaseOrderEditPage />} />
      <Route path=":id" element={<PurchaseOrderViewPage />} />
    </Route>
    <Route path="sales-order">
      <Route index element={<SalesOrderListPage />} />
      <Route path="new" element={<SalesOrderFormPage />} />
      <Route path=":id/edit" element={<SalesOrderEditPage />} />
      <Route path=":id" element={<SalesOrderViewPage />} />
    </Route>
    <Route path="purchase-invoice">
      <Route index element={<PurchaseInvoiceListPage />} />
      <Route path="new" element={<PurchaseInvoiceFormPage />} />
      <Route path="new-ai" element={<PurchaseInvoiceAiFormPage />} />
      <Route path=":id" element={<PurchaseInvoiceViewPage />} />
    </Route>
    <Route path="sales-invoice">
      <Route index element={<SalesInvoiceListPage />} />
      <Route path="new" element={<SalesInvoiceFormPage />} />
      <Route path=":id" element={<SalesInvoiceViewPage />} />
    </Route>
    <Route path="goods-receipt-note">
      <Route index element={<GoodsReceiptNoteListPage />} />
      <Route path="new" element={<GoodsReceiptNoteFormPage />} />
      <Route path=":id/edit" element={<GoodsReceiptNoteEditPage />} />
      <Route path=":id" element={<GoodsReceiptNoteViewPage />} />
    </Route>
    <Route path="delivery-note">
      <Route index element={<DeliveryNoteListPage />} />
      <Route path="new" element={<DeliveryNoteFormPage />} />
      <Route path=":id/edit" element={<DeliveryNoteEditPage />} />
      <Route path=":id" element={<DeliveryNoteViewPage />} />
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
      <Route path=":id" element={<SalesCreditNoteViewPage />} />
    </Route>
    <Route path="adjustments/sales-debit-notes">
      <Route index element={<SalesDebitNoteListPage />} />
      <Route path="new" element={<SalesDebitNoteFormPage />} />
      <Route path=":id" element={<SalesDebitNoteViewPage />} />
    </Route>
    <Route path="adjustments/purchase-credit-notes">
      <Route index element={<PurchaseCreditNoteListPage />} />
      <Route path="new" element={<PurchaseCreditNoteFormPage />} />
      <Route path=":id" element={<PurchaseCreditNoteViewPage />} />
    </Route>
    <Route path="adjustments/purchase-debit-notes">
      <Route index element={<PurchaseDebitNoteListPage />} />
      <Route path="new" element={<PurchaseDebitNoteFormPage />} />
      <Route path=":id" element={<PurchaseDebitNoteViewPage />} />
    </Route>
    <Route path="customer-receipts">
      <Route index element={<BillWiseReceiptListPage />} />
      <Route path="new" element={<BillWiseReceiptFormPage />} />
      <Route path=":id" element={<BillWiseReceiptViewPage />} />
    </Route>
    <Route path="supplier-payments">
      <Route index element={<BillWisePaymentListPage />} />
      <Route path="new" element={<BillWisePaymentFormPage />} />
      <Route path=":id" element={<BillWisePaymentViewPage />} />
    </Route>
    <Route path="accounting/journal-vouchers">
      <Route index element={<JournalVoucherListPage />} />
      <Route path=":id" element={<JournalVoucherViewPage />} />
    </Route>
  </Route>
);
