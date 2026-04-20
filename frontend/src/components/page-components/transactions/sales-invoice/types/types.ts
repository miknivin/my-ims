import type {
  SalesInvoicePayload,
  SalesInvoicePaymentMode,
  SalesInvoiceReferenceType,
  SalesInvoiceTaxApplication,
} from "../../../../../app/api/salesInvoiceApi";

export const SALES_INVOICE_DRAFT_STORAGE_KEY = "ims.sales-invoice.draft";

let salesInvoiceLineCounter = 0;
let salesInvoiceAdditionCounter = 0;

function createLineId() {
  salesInvoiceLineCounter += 1;
  return `si-line-${salesInvoiceLineCounter}`;
}

function createAdditionId() {
  salesInvoiceAdditionCounter += 1;
  return `si-addition-${salesInvoiceAdditionCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface SalesInvoiceSourceReferenceState {
  type: SalesInvoiceReferenceType;
  referenceId: string | null;
  no: string;
}

export interface SalesInvoiceDocumentState {
  voucherType: string;
  no: string;
  date: string;
  dueDate: string;
}

export interface SalesInvoiceCustomerInformationState {
  customerId: string | null;
  customerName: string;
  address: string;
}

export interface SalesInvoiceFinancialDetailsState {
  paymentMode: SalesInvoicePaymentMode;
  invoiceNo: string;
  lrNo: string;
  currencyId: string | null;
  currencyCode: string;
  currencySymbol: string;
  balance: string;
}

export interface SalesInvoiceGeneralState {
  notes: string;
  taxable: boolean;
  taxApplication: SalesInvoiceTaxApplication;
  interState: boolean;
}

export interface SalesInvoiceLineState {
  rowId: string;
  sno: number;
  productId: string | null;
  productCodeSnapshot: string;
  productNameSnapshot: string;
  hsnCode: string;
  unitId: string | null;
  unitName: string;
  quantity: string;
  rate: string;
  grossAmount: number;
  discountPercent: string;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: string;
  taxAmount: number;
  costRate: number;
  cogsAmount: number;
  grossProfitAmount: number;
  lineTotal: number;
  warehouseId: string | null;
  warehouseName: string;
}

export interface SalesInvoiceAdditionState {
  rowId: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerName: string;
  description: string;
  amount: string;
}

export interface SalesInvoiceFooterState {
  notes: string;
  total: number;
  addition: number;
  deduction: number;
  paid: string;
  tax: number;
  netTotal: number;
  balance: number;
}

export interface SalesInvoiceFormState {
  sourceRef: SalesInvoiceSourceReferenceState;
  document: SalesInvoiceDocumentState;
  customerInformation: SalesInvoiceCustomerInformationState;
  financialDetails: SalesInvoiceFinancialDetailsState;
  general: SalesInvoiceGeneralState;
  items: SalesInvoiceLineState[];
  additions: SalesInvoiceAdditionState[];
  footer: SalesInvoiceFooterState;
}

export function createEmptySalesInvoiceLine(
  index: number,
  defaults?: Partial<SalesInvoiceLineState>,
): SalesInvoiceLineState {
  return {
    rowId: createLineId(),
    sno: index,
    productId: null,
    productCodeSnapshot: "",
    productNameSnapshot: "",
    hsnCode: "",
    unitId: null,
    unitName: "",
    quantity: "1",
    rate: "0",
    grossAmount: 0,
    discountPercent: "0",
    discountAmount: 0,
    taxableAmount: 0,
    taxPercent: "0",
    taxAmount: 0,
    costRate: 0,
    cogsAmount: 0,
    grossProfitAmount: 0,
    lineTotal: 0,
    warehouseId: null,
    warehouseName: "",
    ...defaults,
  };
}

export function createEmptySalesInvoiceAddition(
  defaults?: Partial<SalesInvoiceAdditionState>,
): SalesInvoiceAdditionState {
  return {
    rowId: createAdditionId(),
    type: "Addition",
    ledgerId: null,
    ledgerName: "",
    description: "",
    amount: "0",
    ...defaults,
  };
}

export function createSalesInvoiceFormState(
  seed?: Partial<SalesInvoiceFormState>,
): SalesInvoiceFormState {
  const today = new Date().toISOString().slice(0, 10);
  const base: SalesInvoiceFormState = {
    sourceRef: {
      type: "Direct",
      referenceId: null,
      no: "",
    },
    document: {
      voucherType: "SI",
      no: "",
      date: today,
      dueDate: today,
    },
    customerInformation: {
      customerId: null,
      customerName: "",
      address: "",
    },
    financialDetails: {
      paymentMode: "Cash",
      invoiceNo: "",
      lrNo: "",
      currencyId: null,
      currencyCode: "",
      currencySymbol: "",
      balance: "0",
    },
    general: {
      notes: "",
      taxable: true,
      taxApplication: "After Discount",
      interState: false,
    },
    items: [createEmptySalesInvoiceLine(1)],
    additions: [],
    footer: {
      notes: "",
      total: 0,
      addition: 0,
      deduction: 0,
      paid: "0",
      tax: 0,
      netTotal: 0,
      balance: 0,
    },
  };

  const merged: SalesInvoiceFormState = {
    sourceRef: { ...base.sourceRef, ...seed?.sourceRef },
    document: { ...base.document, ...seed?.document },
    customerInformation: {
      ...base.customerInformation,
      ...seed?.customerInformation,
    },
    financialDetails: {
      ...base.financialDetails,
      ...seed?.financialDetails,
    },
    general: { ...base.general, ...seed?.general },
    items:
      seed?.items && seed.items.length > 0
        ? seed.items.map((item, index) =>
            createEmptySalesInvoiceLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    additions:
      seed?.additions && seed.additions.length > 0
        ? seed.additions.map((addition) =>
            createEmptySalesInvoiceAddition({
              ...addition,
              rowId: addition.rowId ?? createAdditionId(),
            }),
          )
        : base.additions,
    footer: { ...base.footer, ...seed?.footer },
  };

  return recalculateSalesInvoiceState(merged);
}

export function recalculateSalesInvoiceLine(
  line: SalesInvoiceLineState,
  general: SalesInvoiceGeneralState,
) {
  const quantity = parseNumber(line.quantity);
  const rate = parseNumber(line.rate);
  const discountPercent = parseNumber(line.discountPercent);
  const taxPercent = parseNumber(line.taxPercent);
  const grossAmount = roundAmount(quantity * rate);
  const discountAmount = roundAmount((grossAmount * discountPercent) / 100);
  const netSalesAmount = roundAmount(Math.max(0, grossAmount - discountAmount));
  const taxableAmount = Math.max(
    0,
    general.taxable
      ? general.taxApplication === "Before Discount"
        ? grossAmount
        : netSalesAmount
      : netSalesAmount,
  );
  const taxAmount = general.taxable
    ? roundAmount((taxableAmount * taxPercent) / 100)
    : 0;
  const cogsAmount = roundAmount(line.costRate * quantity);
  const lineTotal = roundAmount(taxableAmount + taxAmount);
  const grossProfitAmount = roundAmount(netSalesAmount - cogsAmount);

  return {
    ...line,
    grossAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    cogsAmount,
    lineTotal,
    grossProfitAmount,
  };
}

export function recalculateSalesInvoiceState(
  state: SalesInvoiceFormState,
): SalesInvoiceFormState {
  const items = state.items.map((line, index) =>
    recalculateSalesInvoiceLine(
      {
        ...line,
        sno: index + 1,
      },
      state.general,
    ),
  );

  const additions = state.additions.map((addition) => ({ ...addition }));
  const total = roundAmount(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const tax = roundAmount(items.reduce((sum, item) => sum + item.taxAmount, 0));
  const addition = roundAmount(
    additions
      .filter((current) => current.type === "Addition")
      .reduce((sum, current) => sum + parseNumber(current.amount), 0),
  );
  const deduction = roundAmount(
    additions
      .filter((current) => current.type === "Deduction")
      .reduce((sum, current) => sum + parseNumber(current.amount), 0),
  );
  const paid = parseNumber(state.footer.paid);
  const netTotal = roundAmount(total + addition - deduction);
  const balance = roundAmount(netTotal - paid);

  return {
    ...state,
    items,
    additions,
    financialDetails: {
      ...state.financialDetails,
      balance: balance.toFixed(2),
    },
    footer: {
      ...state.footer,
      total,
      addition,
      deduction,
      tax,
      netTotal,
      balance,
    },
  };
}

export function loadSalesInvoiceDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SALES_INVOICE_DRAFT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SalesInvoiceFormState>;
    return createSalesInvoiceFormState(parsed);
  } catch {
    return null;
  }
}

export function toSalesInvoicePayload(
  state: SalesInvoiceFormState,
): SalesInvoicePayload {
  return {
    sourceRef: {
      type: state.sourceRef.type,
      referenceId: state.sourceRef.referenceId,
      referenceNo: state.sourceRef.no,
    },
    document: {
      voucherType: state.document.voucherType,
      no: state.document.no,
      date: state.document.date,
      dueDate: state.document.dueDate,
    },
    customerInformation: {
      customerId: state.customerInformation.customerId ?? "",
      customerNameSnapshot: state.customerInformation.customerName,
      address: state.customerInformation.address,
    },
    financialDetails: {
      paymentMode: state.financialDetails.paymentMode,
      invoiceNo: state.financialDetails.invoiceNo || null,
      lrNo: state.financialDetails.lrNo || null,
      currencyId: state.financialDetails.currencyId,
      currencyCodeSnapshot: state.financialDetails.currencyCode || null,
      currencySymbolSnapshot: state.financialDetails.currencySymbol || null,
      balance: parseNumber(state.financialDetails.balance),
    },
    general: {
      notes: state.general.notes || null,
      taxable: state.general.taxable,
      taxApplication: state.general.taxApplication,
      interState: state.general.interState,
    },
    items: state.items
      .filter((line) => line.productId && line.unitId)
      .map((line) => ({
        sno: line.sno,
        productId: line.productId ?? "",
        productCodeSnapshot: line.productCodeSnapshot || null,
        productNameSnapshot: line.productNameSnapshot,
        hsnCode: line.hsnCode || null,
        unitId: line.unitId ?? "",
        quantity: parseNumber(line.quantity),
        rate: parseNumber(line.rate),
        discountPercent: parseNumber(line.discountPercent),
        taxPercent: parseNumber(line.taxPercent),
        warehouseId: line.warehouseId,
      })),
    additions: state.additions
      .filter(
        (addition) =>
          addition.ledgerId ||
          addition.description.trim() ||
          parseNumber(addition.amount) !== 0,
      )
      .map((addition) => ({
        type: addition.type,
        ledgerId: addition.ledgerId,
        ledgerNameSnapshot: addition.ledgerName || null,
        description: addition.description || null,
        amount: parseNumber(addition.amount),
      })),
    footer: {
      notes: state.footer.notes || null,
      paid: parseNumber(state.footer.paid),
    },
  };
}
