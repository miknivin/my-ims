export const PURCHASE_ORDER_DRAFT_STORAGE_KEY = "ims.purchase-order.draft";

let purchaseOrderLineCounter = 0;
let purchaseOrderAdditionCounter = 0;

function createLineId() {
  purchaseOrderLineCounter += 1;
  return `po-line-${purchaseOrderLineCounter}`;
}

function createAdditionId() {
  purchaseOrderAdditionCounter += 1;
  return `po-addition-${purchaseOrderAdditionCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface PurchaseOrderOrderDetailsState {
  voucherType: string;
  no: string;
  date: string;
  dueDate: string;
  deliveryDate: string;
}

export interface PurchaseOrderVendorInformationState {
  vendorId: string | null;
  vendorLabel: string;
  address: string;
  attention: string;
  phone: string;
}

export interface PurchaseOrderFinancialDetailsState {
  paymentMode: string;
  creditLimit: string;
  currencyId: string | null;
  currencyLabel: string;
  balance: string;
}

export interface PurchaseOrderDeliveryInformationState {
  warehouseId: string | null;
  warehouseName: string;
  address: string;
  attention: string;
  phone: string;
}

export interface PurchaseOrderProductInformationState {
  vendorProducts: string;
  ownProductsOnly: boolean;
  reference: string;
  mrNo: string;
}

export interface PurchaseOrderLineState {
  rowId: string;
  id: string;
  poId: string | null;
  itemId: string | null;
  itemNameSnapshot: string;
  hsnCode: string;
  quantity: string;
  unitId: string | null;
  unitName: string;
  rate: string;
  grossAmount: number;
  discountType: "percentage" | "fixed";
  discountValue: string;
  discountAmount: number;
  taxableAmount: number;
  cgstRate: string;
  cgstAmount: number;
  sgstRate: string;
  sgstAmount: number;
  igstRate: string;
  igstAmount: number;
  lineTotal: number;
  warehouseId: string | null;
  receivedQty: number;
  remark: string;
  frate: string;
  foc: string;
}

export interface PurchaseOrderAdditionState {
  rowId: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerName: string;
  description: string;
  amount: string;
}

export interface PurchaseOrderFooterState {
  notes: string;
  remarks: string;
  taxable: boolean;
  addition: number;
  advance: string;
  total: number;
  discount: number;
  tax: number;
  netTotal: number;
}

export interface PurchaseOrderFormState {
  orderDetails: PurchaseOrderOrderDetailsState;
  vendorInformation: PurchaseOrderVendorInformationState;
  financialDetails: PurchaseOrderFinancialDetailsState;
  deliveryInformation: PurchaseOrderDeliveryInformationState;
  productInformation: PurchaseOrderProductInformationState;
  items: PurchaseOrderLineState[];
  additions: PurchaseOrderAdditionState[];
  footer: PurchaseOrderFooterState;
}

export interface PurchaseOrderPayload {
  orderDetails: {
    voucherType: string;
    no: string;
    date: string;
    dueDate: string;
    deliveryDate: string;
  };
  vendorInformation: {
    vendorId: string;
    vendorLabel: string;
    address: string;
    attention: string | null;
    phone: string | null;
  };
  financialDetails: {
    paymentMode: string;
    creditLimit: number;
    currencyId: string | null;
    currencyLabel: string | null;
    balance: number;
  };
  deliveryInformation: {
    warehouseId: string | null;
    warehouseName: string | null;
    address: string;
    attention: string | null;
    phone: string | null;
  };
  productInformation: {
    vendorProducts: string;
    ownProductsOnly: boolean;
    reference: string | null;
    mrNo: string | null;
  };
  items: Array<{
    itemId: string;
    itemNameSnapshot: string;
    hsnCode: string | null;
    quantity: number;
    unitId: string;
    rate: number;
    discountType: "percentage" | "fixed";
    discountValue: number;
    cgstRate: number;
    sgstRate: number;
    igstRate: number;
    warehouseId: string | null;
    receivedQty: number;
  }>;
  additions: Array<{
    type: "Addition" | "Deduction";
    ledgerId: string | null;
    ledgerName: string | null;
    description: string | null;
    amount: number;
  }>;
  footer: {
    notes: string | null;
    remarks: string | null;
    taxable: boolean;
    addition: number;
    advance: number;
  };
}

export function createEmptyPurchaseOrderLine(
  _index: number,
  defaults?: Partial<PurchaseOrderLineState>,
): PurchaseOrderLineState {
  return {
    rowId: createLineId(),
    id: "",
    poId: null,
    itemId: null,
    itemNameSnapshot: "",
    hsnCode: "",
    quantity: "1",
    unitId: null,
    unitName: "",
    rate: "0",
    grossAmount: 0,
    discountType: "percentage",
    discountValue: "0",
    discountAmount: 0,
    taxableAmount: 0,
    cgstRate: "0",
    cgstAmount: 0,
    sgstRate: "0",
    sgstAmount: 0,
    igstRate: "0",
    igstAmount: 0,
    lineTotal: 0,
    warehouseId: null,
    receivedQty: 0,
    remark: "",
    frate: "0",
    foc: "0",
    ...defaults,
  };
}

export function createEmptyPurchaseOrderAddition(
  defaults?: Partial<PurchaseOrderAdditionState>,
): PurchaseOrderAdditionState {
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

export function createPurchaseOrderFormState(
  seed?: Partial<PurchaseOrderFormState>,
): PurchaseOrderFormState {
  const today = new Date().toISOString().slice(0, 10);
  const base: PurchaseOrderFormState = {
    orderDetails: {
      voucherType: "PO",
      no: "",
      date: today,
      dueDate: today,
      deliveryDate: today,
    },
    vendorInformation: {
      vendorId: null,
      vendorLabel: "",
      address: "",
      attention: "",
      phone: "",
    },
    financialDetails: {
      paymentMode: "Cash",
      creditLimit: "0",
      currencyId: null,
      currencyLabel: "",
      balance: "0",
    },
    deliveryInformation: {
      warehouseId: null,
      warehouseName: "",
      address: "",
      attention: "",
      phone: "",
    },
    productInformation: {
      vendorProducts: "Re-Order Level",
      ownProductsOnly: false,
      reference: "TELEPHONIC",
      mrNo: "",
    },
    items: [createEmptyPurchaseOrderLine(1)],
    additions: [],
    footer: {
      notes: "",
      remarks: "",
      taxable: true,
      addition: 0,
      advance: "0",
      total: 0,
      discount: 0,
      tax: 0,
      netTotal: 0,
    },
  };

  const merged: PurchaseOrderFormState = {
    orderDetails: { ...base.orderDetails, ...seed?.orderDetails },
    vendorInformation: { ...base.vendorInformation, ...seed?.vendorInformation },
    financialDetails: {
      ...base.financialDetails,
      ...seed?.financialDetails,
    },
    deliveryInformation: {
      ...base.deliveryInformation,
      ...seed?.deliveryInformation,
    },
    productInformation: { ...base.productInformation, ...seed?.productInformation },
    items:
      seed?.items && seed.items.length > 0
        ? seed.items.map((item, index) =>
            createEmptyPurchaseOrderLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    additions:
      seed?.additions && seed.additions.length > 0
        ? seed.additions.map((addition) =>
            createEmptyPurchaseOrderAddition({
              ...addition,
              rowId: addition.rowId ?? createAdditionId(),
            }),
          )
        : base.additions,
    footer: { ...base.footer, ...seed?.footer },
  };

  return recalculatePurchaseOrderState(merged);
}

export function recalculatePurchaseOrderLine(
  line: PurchaseOrderLineState,
  taxable: boolean,
) {
  const quantity = parseNumber(line.quantity);
  const rate = parseNumber(line.rate);
  const discountValue = parseNumber(line.discountValue);
  const grossAmount = roundAmount(quantity * rate);
  const discountAmount = roundAmount(
    line.discountType === "percentage"
      ? (grossAmount * discountValue) / 100
      : discountValue,
  );
  const taxableAmount = Math.max(0, roundAmount(grossAmount - discountAmount));
  const cgstAmount = taxable
    ? roundAmount((taxableAmount * parseNumber(line.cgstRate)) / 100)
    : 0;
  const sgstAmount = taxable
    ? roundAmount((taxableAmount * parseNumber(line.sgstRate)) / 100)
    : 0;
  const igstAmount = taxable
    ? roundAmount((taxableAmount * parseNumber(line.igstRate)) / 100)
    : 0;
  const lineTotal = roundAmount(
    taxableAmount + cgstAmount + sgstAmount + igstAmount,
  );

  return {
    ...line,
    grossAmount,
    discountAmount,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    lineTotal,
  };
}

export function recalculatePurchaseOrderState(
  state: PurchaseOrderFormState,
): PurchaseOrderFormState {
  const items = state.items.map((line, index) => ({
    ...recalculatePurchaseOrderLine(line, state.footer.taxable),
    id: line.id || String(index + 1),
  }));

  const additions = state.additions.map((addition) => ({ ...addition }));
  const total = roundAmount(items.reduce((sum, item) => sum + item.lineTotal, 0));
  const discount = roundAmount(
    items.reduce((sum, item) => sum + item.discountAmount, 0),
  );
  const tax = roundAmount(
    items.reduce(
      (sum, item) => sum + item.cgstAmount + item.sgstAmount + item.igstAmount,
      0,
    ),
  );
  const addition = roundAmount(
    additions.reduce((sum, current) => {
      const amount = parseNumber(current.amount);
      return sum + (current.type === "Deduction" ? -amount : amount);
    }, 0),
  );
  const advance = parseNumber(state.footer.advance);
  const netTotal = roundAmount(total + addition - advance);
  const creditLimit = parseNumber(state.financialDetails.creditLimit);
  const balance = roundAmount(creditLimit - netTotal);

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
      addition,
      total,
      discount,
      tax,
      netTotal,
    },
  };
}

export function loadPurchaseOrderDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(PURCHASE_ORDER_DRAFT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<PurchaseOrderFormState>;
    return createPurchaseOrderFormState(parsed);
  } catch {
    return null;
  }
}

export function toPurchaseOrderPayload(
  state: PurchaseOrderFormState,
): PurchaseOrderPayload {
  return {
    orderDetails: {
      voucherType: state.orderDetails.voucherType,
      no: state.orderDetails.no,
      date: state.orderDetails.date,
      dueDate: state.orderDetails.dueDate,
      deliveryDate: state.orderDetails.deliveryDate,
    },
    vendorInformation: {
      vendorId: state.vendorInformation.vendorId ?? "",
      vendorLabel: state.vendorInformation.vendorLabel,
      address: state.vendorInformation.address,
      attention: state.vendorInformation.attention || null,
      phone: state.vendorInformation.phone || null,
    },
    financialDetails: {
      paymentMode: state.financialDetails.paymentMode,
      creditLimit: parseNumber(state.financialDetails.creditLimit),
      currencyId: state.financialDetails.currencyId,
      currencyLabel: state.financialDetails.currencyLabel || null,
      balance: parseNumber(state.financialDetails.balance),
    },
    deliveryInformation: {
      warehouseId: state.deliveryInformation.warehouseId,
      warehouseName: state.deliveryInformation.warehouseName || null,
      address: state.deliveryInformation.address,
      attention: state.deliveryInformation.attention || null,
      phone: state.deliveryInformation.phone || null,
    },
    productInformation: {
      vendorProducts: state.productInformation.vendorProducts,
      ownProductsOnly: state.productInformation.ownProductsOnly,
      reference: state.productInformation.reference || null,
      mrNo: state.productInformation.mrNo || null,
    },
    items: state.items
      .filter((line) => line.itemId && line.unitId)
      .map((line) => ({
        itemId: line.itemId ?? "",
        itemNameSnapshot: line.itemNameSnapshot,
        hsnCode: line.hsnCode || null,
        quantity: parseNumber(line.quantity),
        unitId: line.unitId ?? "",
        rate: parseNumber(line.rate),
        discountType: line.discountType,
        discountValue: parseNumber(line.discountValue),
        cgstRate: parseNumber(line.cgstRate),
        sgstRate: parseNumber(line.sgstRate),
        igstRate: parseNumber(line.igstRate),
        warehouseId: line.warehouseId,
        receivedQty: line.receivedQty,
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
        ledgerName: addition.ledgerName || null,
        description: addition.description || null,
        amount: parseNumber(addition.amount),
      })),
    footer: {
      notes: state.footer.notes || null,
      remarks: state.footer.remarks || null,
      taxable: state.footer.taxable,
      addition: state.footer.addition,
      advance: parseNumber(state.footer.advance),
    },
  };
}
