import type {
  PurchaseCreditNoteNature,
  PurchaseCreditNotePayload,
  PurchaseCreditNotePaymentMode,
  PurchaseCreditNoteTaxApplication,
} from "../../../../../app/api/purchaseCreditNoteApi";
import type {
  PurchaseDebitNoteNature,
  PurchaseDebitNotePayload,
} from "../../../../../app/api/purchaseDebitNoteApi";

export type PurchaseAdjustmentNoteVariant = "credit" | "debit";

export type PurchaseAdjustmentNoteNature =
  | PurchaseCreditNoteNature
  | PurchaseDebitNoteNature;

export type PurchaseAdjustmentNotePaymentMode =
  PurchaseCreditNotePaymentMode;
export type PurchaseAdjustmentNoteTaxApplication =
  PurchaseCreditNoteTaxApplication;

export interface PurchaseAdjustmentNoteConfig {
  variant: PurchaseAdjustmentNoteVariant;
  title: string;
  primaryActionLabel: string;
  listPath: string;
  voucherType: string;
  storageKey: string;
  allowedNatures: PurchaseAdjustmentNoteNature[];
}

export const PURCHASE_ADJUSTMENT_NOTE_CONFIG: Record<
  PurchaseAdjustmentNoteVariant,
  PurchaseAdjustmentNoteConfig
> = {
  credit: {
    variant: "credit",
    title: "Purchase Credit Note",
    primaryActionLabel: "Save Purchase Credit Note",
    listPath: "/operations/adjustments/purchase-credit-notes",
    voucherType: "PCN",
    storageKey: "ims.purchase-credit-note.draft",
    allowedNatures: [
      "RateDifference",
      "DiscountAdjustment",
      "DamageClaim",
      "Other",
    ],
  },
  debit: {
    variant: "debit",
    title: "Purchase Debit Note",
    primaryActionLabel: "Save Purchase Debit Note",
    listPath: "/operations/adjustments/purchase-debit-notes",
    voucherType: "PDN",
    storageKey: "ims.purchase-debit-note.draft",
    allowedNatures: [
      "Return",
      "RateDifference",
      "DiscountAdjustment",
      "DamageClaim",
      "Other",
    ],
  },
};

let purchaseAdjustmentLineCounter = 0;
let purchaseAdjustmentAdditionCounter = 0;

function createLineId() {
  purchaseAdjustmentLineCounter += 1;
  return `pan-line-${purchaseAdjustmentLineCounter}`;
}

function createAdditionId() {
  purchaseAdjustmentAdditionCounter += 1;
  return `pan-addition-${purchaseAdjustmentAdditionCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

export function parsePurchaseAdjustmentNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getPurchaseAdjustmentInventoryEffectLabel(
  variant: PurchaseAdjustmentNoteVariant,
  noteNature: PurchaseAdjustmentNoteNature,
) {
  if (noteNature !== "Return") {
    return "No inventory movement";
  }

  return variant === "debit" ? "Adjustment Out" : "Not supported";
}

export interface PurchaseAdjustmentNoteSourceReferenceState {
  referenceId: string | null;
  referenceNo: string;
}

export interface PurchaseAdjustmentNoteDocumentState {
  voucherType: string;
  no: string;
  date: string;
  dueDate: string;
}

export interface PurchaseAdjustmentNoteVendorInformationState {
  vendorId: string | null;
  vendorLabel: string;
  address: string;
  attention: string;
  phone: string;
}

export interface PurchaseAdjustmentNoteFinancialDetailsState {
  paymentMode: PurchaseAdjustmentNotePaymentMode;
  supplierInvoiceNo: string;
  lrNo: string;
  currencyId: string | null;
  currencyCode: string;
  currencySymbol: string;
}

export interface PurchaseAdjustmentNoteProductInformationState {
  vendorProducts: string;
  ownProductsOnly: boolean;
}

export interface PurchaseAdjustmentNoteGeneralState {
  notes: string;
  searchBarcode: string;
  taxable: boolean;
  taxApplication: PurchaseAdjustmentNoteTaxApplication;
  interState: boolean;
  taxOnFoc: boolean;
}

export interface PurchaseAdjustmentNoteLineState {
  rowId: string;
  sourceLineId: string | null;
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

export interface PurchaseAdjustmentNoteAdditionState {
  rowId: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerName: string;
  description: string;
  amount: string;
}

export interface PurchaseAdjustmentNoteFooterState {
  notes: string;
  total: number;
  discount: number;
  addition: number;
  deduction: number;
  tax: number;
  netTotal: number;
}

export interface PurchaseAdjustmentNoteFormState {
  noteNature: PurchaseAdjustmentNoteNature;
  sourceRef: PurchaseAdjustmentNoteSourceReferenceState;
  document: PurchaseAdjustmentNoteDocumentState;
  vendorInformation: PurchaseAdjustmentNoteVendorInformationState;
  financialDetails: PurchaseAdjustmentNoteFinancialDetailsState;
  productInformation: PurchaseAdjustmentNoteProductInformationState;
  general: PurchaseAdjustmentNoteGeneralState;
  items: PurchaseAdjustmentNoteLineState[];
  additions: PurchaseAdjustmentNoteAdditionState[];
  footer: PurchaseAdjustmentNoteFooterState;
}

export function createEmptyPurchaseAdjustmentNoteLine(
  index: number,
  defaults?: Partial<PurchaseAdjustmentNoteLineState>,
): PurchaseAdjustmentNoteLineState {
  return {
    rowId: createLineId(),
    sourceLineId: null,
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

export function createEmptyPurchaseAdjustmentNoteAddition(
  defaults?: Partial<PurchaseAdjustmentNoteAdditionState>,
): PurchaseAdjustmentNoteAdditionState {
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

export function createPurchaseAdjustmentNoteFormState(
  variant: PurchaseAdjustmentNoteVariant,
  seed?: Partial<PurchaseAdjustmentNoteFormState>,
): PurchaseAdjustmentNoteFormState {
  const config = PURCHASE_ADJUSTMENT_NOTE_CONFIG[variant];
  const today = new Date().toISOString().slice(0, 10);
  const base: PurchaseAdjustmentNoteFormState = {
    noteNature: config.allowedNatures[0],
    sourceRef: {
      referenceId: null,
      referenceNo: "",
    },
    document: {
      voucherType: config.voucherType,
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
    items: [],
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

  const merged: PurchaseAdjustmentNoteFormState = {
    noteNature:
      seed?.noteNature && config.allowedNatures.includes(seed.noteNature)
        ? seed.noteNature
        : base.noteNature,
    sourceRef: {
      ...base.sourceRef,
      ...seed?.sourceRef,
    },
    document: {
      ...base.document,
      ...seed?.document,
      voucherType: seed?.document?.voucherType || base.document.voucherType,
    },
    vendorInformation: {
      ...base.vendorInformation,
      ...seed?.vendorInformation,
    },
    financialDetails: {
      ...base.financialDetails,
      ...seed?.financialDetails,
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
            createEmptyPurchaseAdjustmentNoteLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    additions:
      seed?.additions && seed.additions.length > 0
        ? seed.additions.map((addition) =>
            createEmptyPurchaseAdjustmentNoteAddition({
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

  return recalculatePurchaseAdjustmentNoteState(merged);
}

export function recalculatePurchaseAdjustmentNoteLine(
  line: PurchaseAdjustmentNoteLineState,
  general: PurchaseAdjustmentNoteGeneralState,
) {
  const quantity = parsePurchaseAdjustmentNumber(line.quantity);
  const foc = parsePurchaseAdjustmentNumber(line.foc);
  const totalQuantity = quantity + foc;
  const rate = parsePurchaseAdjustmentNumber(line.rate);
  const discountPercent = parsePurchaseAdjustmentNumber(line.discountPercent);
  const taxPercent = parsePurchaseAdjustmentNumber(line.taxPercent);
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
  const sellingRate = parsePurchaseAdjustmentNumber(line.sellingRate);
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

export function recalculatePurchaseAdjustmentNoteState(
  state: PurchaseAdjustmentNoteFormState,
): PurchaseAdjustmentNoteFormState {
  const items = state.items.map((line, index) =>
    recalculatePurchaseAdjustmentNoteLine(
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
      .reduce(
        (sum, current) => sum + parsePurchaseAdjustmentNumber(current.amount),
        0,
      ),
  );
  const deduction = roundAmount(
    additions
      .filter((current) => current.type === "Deduction")
      .reduce(
        (sum, current) => sum + parsePurchaseAdjustmentNumber(current.amount),
        0,
      ),
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

export function loadPurchaseAdjustmentNoteDraft(
  variant: PurchaseAdjustmentNoteVariant,
) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(
    PURCHASE_ADJUSTMENT_NOTE_CONFIG[variant].storageKey,
  );
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PurchaseAdjustmentNoteFormState>;
    return createPurchaseAdjustmentNoteFormState(variant, parsed);
  } catch {
    return null;
  }
}

function toPurchaseAdjustmentNotePayloadBase(
  state: PurchaseAdjustmentNoteFormState,
) {
  return {
    noteNature: state.noteNature,
    sourceRef: {
      referenceId: state.sourceRef.referenceId,
      referenceNo: state.sourceRef.referenceNo,
    },
    document: {
      voucherType: state.document.voucherType,
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
      .filter(
        (line) =>
          line.sourceLineId &&
          line.productId &&
          line.unitId &&
          parsePurchaseAdjustmentNumber(line.quantity) +
            parsePurchaseAdjustmentNumber(line.foc) >
            0,
      )
      .map((line) => ({
        sno: line.sno,
        sourceLineId: line.sourceLineId ?? "",
        productId: line.productId ?? "",
        productCodeSnapshot: line.productCodeSnapshot || null,
        productNameSnapshot: line.productNameSnapshot,
        hsnCode: line.hsnCode || null,
        unitId: line.unitId ?? "",
        quantity: parsePurchaseAdjustmentNumber(line.quantity),
        foc: parsePurchaseAdjustmentNumber(line.foc),
        rate: parsePurchaseAdjustmentNumber(line.rate),
        discountPercent: parsePurchaseAdjustmentNumber(line.discountPercent),
        taxPercent: parsePurchaseAdjustmentNumber(line.taxPercent),
        sellingRate: parsePurchaseAdjustmentNumber(line.sellingRate),
        wholesaleRate: parsePurchaseAdjustmentNumber(line.wholesaleRate),
        mrp: parsePurchaseAdjustmentNumber(line.mrp),
        warehouseId: line.warehouseId,
      })),
    additions: state.additions
      .filter(
        (addition) =>
          addition.ledgerId ||
          addition.description.trim() ||
          parsePurchaseAdjustmentNumber(addition.amount) !== 0,
      )
      .map((addition) => ({
        type: addition.type,
        ledgerId: addition.ledgerId,
        ledgerNameSnapshot: addition.ledgerName || null,
        description: addition.description || null,
        amount: parsePurchaseAdjustmentNumber(addition.amount),
      })),
    footer: {
      notes: state.footer.notes || null,
    },
  };
}

export function toPurchaseCreditNotePayload(
  state: PurchaseAdjustmentNoteFormState,
): PurchaseCreditNotePayload {
  return toPurchaseAdjustmentNotePayloadBase(state) as PurchaseCreditNotePayload;
}

export function toPurchaseDebitNotePayload(
  state: PurchaseAdjustmentNoteFormState,
): PurchaseDebitNotePayload {
  return toPurchaseAdjustmentNotePayloadBase(state) as PurchaseDebitNotePayload;
}
