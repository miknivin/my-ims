import type {
  SalesCreditNoteNature,
  SalesCreditNotePayload,
  SalesCreditNotePaymentMode,
  SalesCreditNoteTaxApplication,
} from "../../../../../app/api/salesCreditNoteApi";
import type {
  SalesDebitNotePayload,
  SalesDebitNoteNature,
} from "../../../../../app/api/salesDebitNoteApi";

export type SalesAdjustmentNoteVariant = "credit" | "debit";

export type SalesAdjustmentNoteNature =
  | SalesCreditNoteNature
  | SalesDebitNoteNature;

export type SalesAdjustmentNotePaymentMode = SalesCreditNotePaymentMode;
export type SalesAdjustmentNoteTaxApplication = SalesCreditNoteTaxApplication;

export interface SalesAdjustmentNoteConfig {
  variant: SalesAdjustmentNoteVariant;
  title: string;
  primaryActionLabel: string;
  listPath: string;
  voucherType: string;
  storageKey: string;
  allowedNatures: SalesAdjustmentNoteNature[];
}

export const SALES_ADJUSTMENT_NOTE_CONFIG: Record<
  SalesAdjustmentNoteVariant,
  SalesAdjustmentNoteConfig
> = {
  credit: {
    variant: "credit",
    title: "Sales Credit Note",
    primaryActionLabel: "Save Sales Credit Note",
    listPath: "/operations/adjustments/sales-credit-notes",
    voucherType: "SCN",
    storageKey: "ims.sales-credit-note.draft",
    allowedNatures: [
      "Return",
      "RateDifference",
      "DiscountAdjustment",
      "DamageClaim",
      "Other",
    ],
  },
  debit: {
    variant: "debit",
    title: "Sales Debit Note",
    primaryActionLabel: "Save Sales Debit Note",
    listPath: "/operations/adjustments/sales-debit-notes",
    voucherType: "SDN",
    storageKey: "ims.sales-debit-note.draft",
    allowedNatures: [
      "RateDifference",
      "DiscountAdjustment",
      "DamageClaim",
      "Other",
    ],
  },
};

let salesAdjustmentLineCounter = 0;
let salesAdjustmentAdditionCounter = 0;

function createLineId() {
  salesAdjustmentLineCounter += 1;
  return `san-line-${salesAdjustmentLineCounter}`;
}

function createAdditionId() {
  salesAdjustmentAdditionCounter += 1;
  return `san-addition-${salesAdjustmentAdditionCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

export function parseSalesAdjustmentNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getSalesAdjustmentInventoryEffectLabel(
  variant: SalesAdjustmentNoteVariant,
  noteNature: SalesAdjustmentNoteNature,
) {
  if (noteNature !== "Return") {
    return "No inventory movement";
  }

  return variant === "credit" ? "Adjustment In" : "Not supported";
}

export interface SalesAdjustmentNoteSourceReferenceState {
  referenceId: string | null;
  referenceNo: string;
}

export interface SalesAdjustmentNoteDocumentState {
  voucherType: string;
  no: string;
  date: string;
  dueDate: string;
}

export interface SalesAdjustmentNoteCustomerInformationState {
  customerId: string | null;
  customerName: string;
  address: string;
}

export interface SalesAdjustmentNoteFinancialDetailsState {
  paymentMode: SalesAdjustmentNotePaymentMode;
  invoiceNo: string;
  lrNo: string;
  currencyId: string | null;
  currencyCode: string;
  currencySymbol: string;
  balance: string;
}

export interface SalesAdjustmentNoteGeneralState {
  notes: string;
  taxable: boolean;
  taxApplication: SalesAdjustmentNoteTaxApplication;
  interState: boolean;
}

export interface SalesAdjustmentNoteLineState {
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
  rate: string;
  grossAmount: number;
  discountPercent: string;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: string;
  taxAmount: number;
  lineTotal: number;
  warehouseId: string | null;
  warehouseName: string;
}

export interface SalesAdjustmentNoteAdditionState {
  rowId: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerName: string;
  description: string;
  amount: string;
}

export interface SalesAdjustmentNoteFooterState {
  notes: string;
  total: number;
  addition: number;
  deduction: number;
  paid: string;
  tax: number;
  netTotal: number;
  balance: number;
}

export interface SalesAdjustmentNoteFormState {
  noteNature: SalesAdjustmentNoteNature;
  sourceRef: SalesAdjustmentNoteSourceReferenceState;
  document: SalesAdjustmentNoteDocumentState;
  customerInformation: SalesAdjustmentNoteCustomerInformationState;
  financialDetails: SalesAdjustmentNoteFinancialDetailsState;
  general: SalesAdjustmentNoteGeneralState;
  items: SalesAdjustmentNoteLineState[];
  additions: SalesAdjustmentNoteAdditionState[];
  footer: SalesAdjustmentNoteFooterState;
}

export function createEmptySalesAdjustmentNoteLine(
  index: number,
  defaults?: Partial<SalesAdjustmentNoteLineState>,
): SalesAdjustmentNoteLineState {
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
    rate: "0",
    grossAmount: 0,
    discountPercent: "0",
    discountAmount: 0,
    taxableAmount: 0,
    taxPercent: "0",
    taxAmount: 0,
    lineTotal: 0,
    warehouseId: null,
    warehouseName: "",
    ...defaults,
  };
}

export function createEmptySalesAdjustmentNoteAddition(
  defaults?: Partial<SalesAdjustmentNoteAdditionState>,
): SalesAdjustmentNoteAdditionState {
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

export function createSalesAdjustmentNoteFormState(
  variant: SalesAdjustmentNoteVariant,
  seed?: Partial<SalesAdjustmentNoteFormState>,
): SalesAdjustmentNoteFormState {
  const config = SALES_ADJUSTMENT_NOTE_CONFIG[variant];
  const today = new Date().toISOString().slice(0, 10);
  const base: SalesAdjustmentNoteFormState = {
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
    items: [],
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

  const merged: SalesAdjustmentNoteFormState = {
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
    customerInformation: {
      ...base.customerInformation,
      ...seed?.customerInformation,
    },
    financialDetails: {
      ...base.financialDetails,
      ...seed?.financialDetails,
    },
    general: {
      ...base.general,
      ...seed?.general,
    },
    items:
      seed?.items && seed.items.length > 0
        ? seed.items.map((item, index) =>
            createEmptySalesAdjustmentNoteLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    additions:
      seed?.additions && seed.additions.length > 0
        ? seed.additions.map((addition) =>
            createEmptySalesAdjustmentNoteAddition({
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

  return recalculateSalesAdjustmentNoteState(merged);
}

export function recalculateSalesAdjustmentNoteLine(
  line: SalesAdjustmentNoteLineState,
  general: SalesAdjustmentNoteGeneralState,
) {
  const quantity = parseSalesAdjustmentNumber(line.quantity);
  const rate = parseSalesAdjustmentNumber(line.rate);
  const discountPercent = parseSalesAdjustmentNumber(line.discountPercent);
  const taxPercent = parseSalesAdjustmentNumber(line.taxPercent);
  const grossAmount = roundAmount(quantity * rate);
  const discountAmount = roundAmount((grossAmount * discountPercent) / 100);
  const netAmount = roundAmount(Math.max(0, grossAmount - discountAmount));
  const taxableAmount = Math.max(
    0,
    general.taxable
      ? general.taxApplication === "Before Discount"
        ? grossAmount
        : netAmount
      : netAmount,
  );
  const taxAmount = general.taxable
    ? roundAmount((taxableAmount * taxPercent) / 100)
    : 0;
  const lineTotal = roundAmount(taxableAmount + taxAmount);

  return {
    ...line,
    grossAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    lineTotal,
  };
}

export function recalculateSalesAdjustmentNoteState(
  state: SalesAdjustmentNoteFormState,
): SalesAdjustmentNoteFormState {
  const items = state.items.map((line, index) =>
    recalculateSalesAdjustmentNoteLine(
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
      .reduce(
        (sum, current) => sum + parseSalesAdjustmentNumber(current.amount),
        0,
      ),
  );
  const deduction = roundAmount(
    additions
      .filter((current) => current.type === "Deduction")
      .reduce(
        (sum, current) => sum + parseSalesAdjustmentNumber(current.amount),
        0,
      ),
  );
  const paid = parseSalesAdjustmentNumber(state.footer.paid);
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

export function loadSalesAdjustmentNoteDraft(
  variant: SalesAdjustmentNoteVariant,
) {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(
    SALES_ADJUSTMENT_NOTE_CONFIG[variant].storageKey,
  );
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<SalesAdjustmentNoteFormState>;
    return createSalesAdjustmentNoteFormState(variant, parsed);
  } catch {
    return null;
  }
}

function toSalesAdjustmentNotePayloadBase(state: SalesAdjustmentNoteFormState) {
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
      balance: parseSalesAdjustmentNumber(state.financialDetails.balance),
    },
    general: {
      notes: state.general.notes || null,
      taxable: state.general.taxable,
      taxApplication: state.general.taxApplication,
      interState: state.general.interState,
    },
    items: state.items
      .filter(
        (line) =>
          line.sourceLineId &&
          line.productId &&
          line.unitId &&
          parseSalesAdjustmentNumber(line.quantity) > 0,
      )
      .map((line) => ({
        sourceLineId: line.sourceLineId ?? "",
        sno: line.sno,
        productId: line.productId ?? "",
        productCodeSnapshot: line.productCodeSnapshot || null,
        productNameSnapshot: line.productNameSnapshot,
        hsnCode: line.hsnCode || null,
        unitId: line.unitId ?? "",
        quantity: parseSalesAdjustmentNumber(line.quantity),
        rate: parseSalesAdjustmentNumber(line.rate),
        discountPercent: parseSalesAdjustmentNumber(line.discountPercent),
        taxPercent: parseSalesAdjustmentNumber(line.taxPercent),
        warehouseId: line.warehouseId,
      })),
    additions: state.additions
      .filter(
        (addition) =>
          addition.ledgerId ||
          addition.description.trim() ||
          parseSalesAdjustmentNumber(addition.amount) !== 0,
      )
      .map((addition) => ({
        type: addition.type,
        ledgerId: addition.ledgerId,
        ledgerNameSnapshot: addition.ledgerName || null,
        description: addition.description || null,
        amount: parseSalesAdjustmentNumber(addition.amount),
      })),
    footer: {
      notes: state.footer.notes || null,
      paid: parseSalesAdjustmentNumber(state.footer.paid),
    },
  };
}

export function toSalesCreditNotePayload(
  state: SalesAdjustmentNoteFormState,
): SalesCreditNotePayload {
  return toSalesAdjustmentNotePayloadBase(state) as SalesCreditNotePayload;
}

export function toSalesDebitNotePayload(
  state: SalesAdjustmentNoteFormState,
): SalesDebitNotePayload {
  return toSalesAdjustmentNotePayloadBase(state) as SalesDebitNotePayload;
}
