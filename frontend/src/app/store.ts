import { configureStore } from "@reduxjs/toolkit";
import { authApi } from "./api/authApi";
import { billWisePaymentApi } from "./api/billWisePaymentApi";
import { billWiseReceiptApi } from "./api/billWiseReceiptApi";
import { categoryApi } from "./api/categoryApi";
import { customerApi } from "./api/customerApi";
import { currencyApi } from "./api/currencyApi";
import { discountApi } from "./api/discountApi";
import { goodsReceiptNoteApi } from "./api/goodsReceiptNoteApi";
import { ledgerApi } from "./api/ledgerApi";
import { ledgerGroupApi } from "./api/ledgerGroupApi";
import { lookupApi } from "./api/lookupApi";
import { purchaseCreditNoteApi } from "./api/purchaseCreditNoteApi";
import { purchaseDebitNoteApi } from "./api/purchaseDebitNoteApi";
import { purchaseInvoiceApi } from "./api/purchaseInvoiceApi";
import { purchaseOrderApi } from "./api/purchaseOrderApi";
import { productApi } from "./api/productApi";
import { salesCreditNoteApi } from "./api/salesCreditNoteApi";
import { salesDebitNoteApi } from "./api/salesDebitNoteApi";
import { salesInvoiceApi } from "./api/salesInvoiceApi";
import { salesOrderApi } from "./api/salesOrderApi";
import { settingsApi } from "./api/settingsApi";
import { taxApi } from "./api/taxApi";
import { uomApi } from "./api/uomApi";
import { vendorApi } from "./api/vendorApi";
import { warehouseApi } from "./api/warehouseApi";

export const store = configureStore({
  reducer: {
    [authApi.reducerPath]: authApi.reducer,
    [billWisePaymentApi.reducerPath]: billWisePaymentApi.reducer,
    [billWiseReceiptApi.reducerPath]: billWiseReceiptApi.reducer,
    [categoryApi.reducerPath]: categoryApi.reducer,
    [customerApi.reducerPath]: customerApi.reducer,
    [currencyApi.reducerPath]: currencyApi.reducer,
    [discountApi.reducerPath]: discountApi.reducer,
    [goodsReceiptNoteApi.reducerPath]: goodsReceiptNoteApi.reducer,
    [ledgerApi.reducerPath]: ledgerApi.reducer,
    [ledgerGroupApi.reducerPath]: ledgerGroupApi.reducer,
    [lookupApi.reducerPath]: lookupApi.reducer,
    [purchaseCreditNoteApi.reducerPath]: purchaseCreditNoteApi.reducer,
    [purchaseDebitNoteApi.reducerPath]: purchaseDebitNoteApi.reducer,
    [purchaseInvoiceApi.reducerPath]: purchaseInvoiceApi.reducer,
    [purchaseOrderApi.reducerPath]: purchaseOrderApi.reducer,
    [productApi.reducerPath]: productApi.reducer,
    [salesCreditNoteApi.reducerPath]: salesCreditNoteApi.reducer,
    [salesDebitNoteApi.reducerPath]: salesDebitNoteApi.reducer,
    [salesInvoiceApi.reducerPath]: salesInvoiceApi.reducer,
    [salesOrderApi.reducerPath]: salesOrderApi.reducer,
    [settingsApi.reducerPath]: settingsApi.reducer,
    [taxApi.reducerPath]: taxApi.reducer,
    [uomApi.reducerPath]: uomApi.reducer,
    [vendorApi.reducerPath]: vendorApi.reducer,
    [warehouseApi.reducerPath]: warehouseApi.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(
      authApi.middleware,
      billWisePaymentApi.middleware,
      billWiseReceiptApi.middleware,
      categoryApi.middleware,
      customerApi.middleware,
      currencyApi.middleware,
      discountApi.middleware,
      goodsReceiptNoteApi.middleware,
      ledgerApi.middleware,
      ledgerGroupApi.middleware,
      lookupApi.middleware,
      purchaseCreditNoteApi.middleware,
      purchaseDebitNoteApi.middleware,
      purchaseInvoiceApi.middleware,
      purchaseOrderApi.middleware,
      productApi.middleware,
      salesCreditNoteApi.middleware,
      salesDebitNoteApi.middleware,
      salesInvoiceApi.middleware,
      salesOrderApi.middleware,
      settingsApi.middleware,
      taxApi.middleware,
      uomApi.middleware,
      vendorApi.middleware,
      warehouseApi.middleware
    ),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;


