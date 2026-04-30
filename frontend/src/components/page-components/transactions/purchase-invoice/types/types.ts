import type {
  PurchaseInvoicePayload,
  PurchaseInvoicePaymentMode,
  PurchaseInvoiceReferenceType,
  PurchaseInvoiceTaxApplication,
} from "../../../../../app/api/purchaseInvoiceApi";

export const PURCHASE_INVOICE_DRAFT_STORAGE_KEY = "ims.purchase-invoice.draft";

let purchaseInvoiceLineCounter = 0;
let purchaseInvoiceAdditionCounter = 0;

function createLineId() {
  purchaseInvoiceLineCounter += 1;
  return `pi-line-${purchaseInvoiceLineCounter}`;
}

function createAdditionId() {
  purchaseInvoiceAdditionCounter += 1;
  return `pi-addition-${purchaseInvoiceAdditionCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface PurchaseInvoiceSourceReferenceState {
  type: PurchaseInvoiceReferenceType;
  referenceId: string | null;
  no: string;
}

export interface PurchaseInvoiceDocumentState {
  no: string;
  date: string;
  dueDate: string;
}

export interface PurchaseInvoiceVendorInformationState {
  vendorId: string | null;
  vendorLabel: string;
  address: string;
  attention: string;
  phone: string;
}

export interface PurchaseInvoiceFinancialDetailsState {
  paymentMode: PurchaseInvoicePaymentMode;
  supplierInvoiceNo: string;
  lrNo: string;
  currencyId: string | null;
  currencyCode: string;
  currencySymbol: string;
}

export interface PurchaseInvoiceProductInformationState {
  vendorProducts: string;
  ownProductsOnly: boolean;
}

export interface PurchaseInvoiceGeneralState {
  notes: string;
  searchBarcode: string;
  taxable: boolean;
  taxApplication: PurchaseInvoiceTaxApplication;
  interState: boolean;
  taxOnFoc: boolean;
}

export interface PurchaseInvoiceLineState {
  rowId: string;
  sno: number;
  productId: string | null;
  productCodeSnapshot: string;
  productNameSnapshot: string;
  hsnCode: string;
  unitId: string | null;
  unitName: string;
  quantity: string;
  foc: string;
  rate: string;
  grossAmount: number;
  discountPercent: string;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: string;
  taxAmount: number;
  cost: number;
  profitPercent: number;
  profitAmount: number;
  sellingRate: string;
  wholesaleRate: string;
  mrp: string;
  lineTotal: number;
  warehouseId: string | null;
  warehouseName: string;
}

export interface PurchaseInvoiceAdditionState {
  rowId: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerName: string;
  description: string;
  amount: string;
}

export interface PurchaseInvoiceFooterState {
  notes: string;
  total: number;
  discount: number;
  addition: number;
  deduction: number;
  tax: number;
  netTotal: number;
}

export interface PurchaseInvoiceFormState {
  sourceRef: PurchaseInvoiceSourceReferenceState;
  document: PurchaseInvoiceDocumentState;
  vendorInformation: PurchaseInvoiceVendorInformationState;
  financialDetails: PurchaseInvoiceFinancialDetailsState;
  productInformation: PurchaseInvoiceProductInformationState;
  general: PurchaseInvoiceGeneralState;
  items: PurchaseInvoiceLineState[];
  additions: PurchaseInvoiceAdditionState[];
  footer: PurchaseInvoiceFooterState;
  status?:"Draft" | "Submitted" | "Cancelled"
}

type LegacyPurchaseInvoiceSeed = Partial<PurchaseInvoiceFormState> & {
  poRef?: Partial<PurchaseInvoiceSourceReferenceState>;
  ledger?: Partial<PurchaseInvoiceDocumentState>;
  financialDetails?: Partial<PurchaseInvoiceFinancialDetailsState> & {
    invoiceNo?: string;
  };
};

export function createEmptyPurchaseInvoiceLine(
  index: number,
  defaults?: Partial<PurchaseInvoiceLineState>,
): PurchaseInvoiceLineState {
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
    foc: "0",
    rate: "0",
    grossAmount: 0,
    discountPercent: "0",
    discountAmount: 0,
    taxableAmount: 0,
    taxPercent: "0",
    taxAmount: 0,
    cost: 0,
    profitPercent: 0,
    profitAmount: 0,
    sellingRate: "0",
    wholesaleRate: "0",
    mrp: "0",
    lineTotal: 0,
    warehouseId: null,
    warehouseName: "",
    ...defaults,
  };
}

export function createEmptyPurchaseInvoiceAddition(
  defaults?: Partial<PurchaseInvoiceAdditionState>,
): PurchaseInvoiceAdditionState {
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

export function createPurchaseInvoiceFormState(
  seed?: Partial<PurchaseInvoiceFormState>,
): PurchaseInvoiceFormState {
  const today = new Date().toISOString().slice(0, 10);
  const legacySeed = (seed ?? {}) as LegacyPurchaseInvoiceSeed;

  const base: PurchaseInvoiceFormState = {
    sourceRef: {
      type: "Direct",
      referenceId: null,
      no: "",
    },
    document: {
      no: "",
      date: today,
      dueDate: today,
    },
    vendorInformation: {
      vendorId: null,
      vendorLabel: "",
      address: "",
      attention: "",
      phone: "",
    },
    financialDetails: {
      paymentMode: "Credit",
      supplierInvoiceNo: "",
      lrNo: "",
      currencyId: null,
      currencyCode: "",
      currencySymbol: "",
    },
    productInformation: {
      vendorProducts: "Vendor Products",
      ownProductsOnly: false,
    },
    general: {
      notes: "",
      searchBarcode: "",
      taxable: true,
      taxApplication: "After Discount",
      interState: false,
      taxOnFoc: false,
    },
    items: [createEmptyPurchaseInvoiceLine(1)],
    additions: [],
    footer: {
      notes: "",
      total: 0,
      discount: 0,
      addition: 0,
      deduction: 0,
      tax: 0,
      netTotal: 0,
    },
  };

  const merged: PurchaseInvoiceFormState = {
    sourceRef: {
      ...base.sourceRef,
      ...legacySeed.poRef,
      ...seed?.sourceRef,
    },
    document: {
      ...base.document,
      ...legacySeed.ledger,
      ...seed?.document,
    },
    vendorInformation: {
      ...base.vendorInformation,
      ...seed?.vendorInformation,
    },
    financialDetails: {
      ...base.financialDetails,
      ...legacySeed.financialDetails,
      supplierInvoiceNo:
        seed?.financialDetails?.supplierInvoiceNo ??
        legacySeed.financialDetails?.invoiceNo ??
        base.financialDetails.supplierInvoiceNo,
    },
    productInformation: {
      ...base.productInformation,
      ...seed?.productInformation,
    },
    general: {
      ...base.general,
      ...seed?.general,
    },
    items:
      seed?.items && seed.items.length > 0
        ? seed.items.map((item, index) =>
            createEmptyPurchaseInvoiceLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    additions:
      seed?.additions && seed.additions.length > 0
        ? seed.additions.map((addition) =>
            createEmptyPurchaseInvoiceAddition({
              ...addition,
              rowId: addition.rowId ?? createAdditionId(),
            }),
          )
        : base.additions,
    footer: {
      ...base.footer,
      ...seed?.footer,
    },
  };

  return recalculatePurchaseInvoiceState(merged);
}

export function recalculatePurchaseInvoiceLine(
  line: PurchaseInvoiceLineState,
  general: PurchaseInvoiceGeneralState,
) {
  const quantity = parseNumber(line.quantity);
  const foc = parseNumber(line.foc);
  const totalQuantity = quantity + foc;
  const rate = parseNumber(line.rate);
  const discountPercent = parseNumber(line.discountPercent);
  const taxPercent = parseNumber(line.taxPercent);
  const grossAmount = roundAmount(totalQuantity * rate);
  const discountAmount = roundAmount((grossAmount * discountPercent) / 100);
  const taxBaseQuantity = general.taxOnFoc ? totalQuantity : quantity;
  const taxBaseGross = roundAmount(taxBaseQuantity * rate);
  const discountRatio = grossAmount > 0 ? discountAmount / grossAmount : 0;
  const discountedTaxBase =
    general.taxApplication === "After Discount"
      ? roundAmount(taxBaseGross * (1 - discountRatio))
      : taxBaseGross;
  const taxableAmount = Math.max(
    0,
    general.taxable
      ? discountedTaxBase
      : roundAmount(grossAmount - discountAmount),
  );
  const taxAmount = general.taxable
    ? roundAmount((taxableAmount * taxPercent) / 100)
    : 0;
  const lineTotal = roundAmount(taxableAmount + taxAmount);
  const cost = totalQuantity > 0 ? roundAmount(lineTotal / totalQuantity) : 0;
  const sellingRate = parseNumber(line.sellingRate);
  const profitPercent =
    cost > 0 ? roundAmount(((sellingRate - cost) / cost) * 100) : 0;
  const profitAmount = roundAmount((sellingRate - cost) * totalQuantity);

  return {
    ...line,
    grossAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    cost,
    profitPercent,
    profitAmount,
    lineTotal,
  };
}

export function recalculatePurchaseInvoiceState(
  state: PurchaseInvoiceFormState,
): PurchaseInvoiceFormState {
  const items = state.items.map((line, index) =>
    recalculatePurchaseInvoiceLine(
      {
        ...line,
        sno: index + 1,
      },
      state.general,
    ),
  );

  const additions = state.additions.map((addition) => ({ ...addition }));
  const total = roundAmount(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const discount = roundAmount(
    items.reduce((sum, item) => sum + item.discountAmount, 0),
  );
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
  const netTotal = roundAmount(total + addition - deduction);

  return {
    ...state,
    items,
    additions,
    footer: {
      ...state.footer,
      total,
      discount,
      addition,
      deduction,
      tax,
      netTotal,
    },
  };
}

export function loadPurchaseInvoiceDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PURCHASE_INVOICE_DRAFT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PurchaseInvoiceFormState>;
    return createPurchaseInvoiceFormState(parsed);
  } catch {
    return null;
  }
}

export function toPurchaseInvoicePayload(
  state: PurchaseInvoiceFormState,
): PurchaseInvoicePayload {
  return {
    sourceRef: {
      type: state.sourceRef.type,
      referenceId: state.sourceRef.referenceId,
      referenceNo: state.sourceRef.no,
    },
    document: {
      no: state.document.no,
      date: state.document.date,
      dueDate: state.document.dueDate,
    },
    vendorInformation: {
      vendorId: state.vendorInformation.vendorId ?? "",
      vendorNameSnapshot: state.vendorInformation.vendorLabel,
      address: state.vendorInformation.address,
      attention: state.vendorInformation.attention || null,
      phone: state.vendorInformation.phone || null,
    },
    financialDetails: {
      paymentMode: state.financialDetails.paymentMode,
      supplierInvoiceNo: state.financialDetails.supplierInvoiceNo || null,
      lrNo: state.financialDetails.lrNo || null,
      currencyId: state.financialDetails.currencyId,
      currencyCodeSnapshot: state.financialDetails.currencyCode || null,
      currencySymbolSnapshot: state.financialDetails.currencySymbol || null,
    },
    productInformation: {
      vendorProducts: state.productInformation.vendorProducts,
      ownProductsOnly: state.productInformation.ownProductsOnly,
    },
    general: {
      notes: state.general.notes || null,
      searchBarcode: state.general.searchBarcode || null,
      taxable: state.general.taxable,
      taxApplication: state.general.taxApplication,
      interState: state.general.interState,
      taxOnFoc: state.general.taxOnFoc,
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
        foc: parseNumber(line.foc),
        rate: parseNumber(line.rate),
        discountPercent: parseNumber(line.discountPercent),
        taxPercent: parseNumber(line.taxPercent),
        sellingRate: parseNumber(line.sellingRate),
        wholesaleRate: parseNumber(line.wholesaleRate),
        mrp: parseNumber(line.mrp),
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
    },
  };
}
