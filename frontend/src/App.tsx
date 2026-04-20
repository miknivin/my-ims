import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import { ProtectedRoute, PublicOnlyRoute } from "./components/auth/AuthRoutes";
import CategoryMaster from "./pages/Masters/CategoryMaster";
import CustomerFormPage from "./pages/Masters/CustomerFormPage";
import CustomerMaster from "./pages/Masters/CustomerMaster";
import CurrencyMaster from "./pages/Masters/CurrencyMaster";
import DiscountMaster from "./pages/Masters/DiscountMaster";
import LedgerGroupMaster from "./pages/Masters/LedgerGroupMaster";
import LedgerMaster from "./pages/Masters/LedgerMaster";
import Masters from "./pages/Masters/Masters";
import MastersPlaceholder from "./pages/Masters/MastersPlaceholder";
import ProductFormPage from "./pages/Masters/ProductFormPage";
import ProductMaster from "./pages/Masters/ProductMaster";
import TaxMaster from "./pages/Masters/TaxMaster";
import UomMaster from "./pages/Masters/UomMaster";
import VendorMaster from "./pages/Masters/VendorMaster";
import VendorFormPage from "./pages/Masters/VendorFormPage";
import WarehouseMaster from "./pages/Masters/WarehouseMaster";
import SettingsPage from "./pages/Settings/SettingsPage";
import PurchaseOrderFormPage from "./pages/Transactions/PurchaseOrderFormPage";
import PurchaseOrderListPage from "./pages/Transactions/PurchaseOrderListPage";
import PurchaseInvoiceFormPage from "./pages/Transactions/PurchaseInvoiceFormPage";
import PurchaseInvoiceListPage from "./pages/Transactions/PurchaseInvoiceListPage";
import SalesInvoiceFormPage from "./pages/Transactions/SalesInvoiceFormPage";
import SalesInvoiceListPage from "./pages/Transactions/SalesInvoiceListPage";
import SalesOrderFormPage from "./pages/Transactions/SalesOrderFormPage";
import SalesOrderListPage from "./pages/Transactions/SalesOrderListPage";
import GoodsReceiptNoteFormPage from "./pages/Transactions/GoodsReceiptNoteFormPage";
import GoodsReceiptNoteListPage from "./pages/Transactions/GoodsReceiptNoteListPage";
import PurchaseCreditNoteListPage from "./pages/Transactions/Adjustments/PurchaseCreditNoteListPage";
import PurchaseDebitNoteListPage from "./pages/Transactions/Adjustments/PurchaseDebitNoteListPage";
import PurchaseCreditNoteFormPage from "./pages/Transactions/Adjustments/PurchaseCreditNoteFormPage";
import PurchaseDebitNoteFormPage from "./pages/Transactions/Adjustments/PurchaseDebitNoteFormPage";
import SalesCreditNoteListPage from "./pages/Transactions/Adjustments/SalesCreditNoteListPage";
import SalesDebitNoteListPage from "./pages/Transactions/Adjustments/SalesDebitNoteListPage";
import SalesCreditNoteFormPage from "./pages/Transactions/Adjustments/SalesCreditNoteFormPage";
import SalesDebitNoteFormPage from "./pages/Transactions/Adjustments/SalesDebitNoteFormPage";
import BillWisePaymentFormPage from "./pages/Transactions/BillWise/BillWisePaymentFormPage";
import BillWisePaymentListPage from "./pages/Transactions/BillWise/BillWisePaymentListPage";
import BillWiseReceiptFormPage from "./pages/Transactions/BillWise/BillWiseReceiptFormPage";
import BillWiseReceiptListPage from "./pages/Transactions/BillWise/BillWiseReceiptListPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route index path="/" element={<Home />} />
              <Route path="/masters">
                <Route index element={<Masters />} />
                <Route path="ledger-groups" element={<LedgerGroupMaster />} />
                <Route path="ledger" element={<LedgerMaster />} />
                <Route path="product" element={<ProductMaster />} />
                <Route path="product/new" element={<ProductFormPage />} />
                <Route path="product/:productId/edit" element={<ProductFormPage />} />
                <Route path="uom" element={<UomMaster />} />
                <Route path="vendor" element={<VendorMaster />} />
                <Route path="vendor/new" element={<VendorFormPage />} />
                <Route path="vendor/:vendorId/edit" element={<VendorFormPage />} />
                <Route path="customers" element={<CustomerMaster />} />
                <Route path="customers/new" element={<CustomerFormPage />} />
                <Route path="customers/:customerId/edit" element={<CustomerFormPage />} />
                <Route path="currency" element={<CurrencyMaster />} />
                <Route path="warehouse" element={<WarehouseMaster />} />
                <Route path="category" element={<CategoryMaster />} />
                <Route path="tax" element={<TaxMaster />} />
                <Route path="price-discount" element={<DiscountMaster />} />
                <Route
                  path="users"
                  element={<MastersPlaceholder title="User / Role Master" description="User and role master page placeholder is ready for later integration." />}
                />
              </Route>

              <Route path="/operations">
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
                  element={<MastersPlaceholder title="Stock Adjustment" description="Stock adjustment module shell is ready for later integration." />}
                />
                <Route
                  path="stock-transfer"
                  element={<MastersPlaceholder title="Stock Transfer" description="Stock transfer module shell is ready for later integration." />}
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

              <Route path="/reports">
                <Route
                  path="bill-wise-report"
                  element={<MastersPlaceholder title="Bill-wise Report" description="Report placeholder is ready for later integration." />}
                />
                <Route
                  path="bill-wise-profit"
                  element={<MastersPlaceholder title="Bill-wise Profit" description="Report placeholder is ready for later integration." />}
                />
                <Route
                  path="item-wise-profit"
                  element={<MastersPlaceholder title="Item-wise Profit" description="Report placeholder is ready for later integration." />}
                />
                <Route
                  path="item-wise-movement"
                  element={<MastersPlaceholder title="Item-wise Movement" description="Report placeholder is ready for later integration." />}
                />
                <Route
                  path="ledger-wise"
                  element={<MastersPlaceholder title="Ledger-view" description="Ledger report placeholder is ready for later integration." />}
                />
              </Route>

              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile" element={<UserProfiles />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/avatars" element={<Avatars />} />
              <Route path="/badge" element={<Badges />} />
              <Route path="/buttons" element={<Buttons />} />
              <Route path="/images" element={<Images />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/line-chart" element={<LineChart />} />
              <Route path="/bar-chart" element={<BarChart />} />
            </Route>
          </Route>

          <Route element={<PublicOnlyRoute />}>
            <Route path="/signin" element={<SignIn />} />
            <Route path="/signup" element={<SignUp />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}


