import type { SalesOrderPayload } from "../../../../../app/api/salesOrderApi";

let salesOrderLineCounter = 0;
let salesOrderAdditionCounter = 0;

function createLineId() {
  salesOrderLineCounter += 1;
  return `so-line-${salesOrderLineCounter}`;
}

function createAdditionId() {
  salesOrderAdditionCounter += 1;
  return `so-addition-${salesOrderAdditionCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface SalesOrderOrderDetailsState {
  voucherType: "SL" | "PH";
  no: string;
  date: string;
  deliveryDate: string;
}

export interface SalesOrderPartyInformationState {
  customerId: string | null;
  customerName: string;
  customerCode: string;
  address: string;
  attention: string;
}

export interface SalesOrderCommercialDetailsState {
  rateLevel: "WRATE" | "RRATE" | "MRATE";
  currencyId: string | null;
  currencyCode: string;
  currencySymbol: string;
  creditLimit: string;
  isInterState: boolean;
  taxApplication: "After Discount" | "Before Discount";
}

export interface SalesOrderSalesDetailsState {
  salesManId: string | null;
  salesMan: string;
}

export interface SalesOrderLineState {
  rowId: string;
  sno: number;
  productId: string | null;
  productName: string;
  hsnCode: string;
  unitId: string | null;
  unitName: string;
  quantity: string;
  foc: string;
  mrp: string;
  rate: string;
  grossAmount: number;
  discountPercent: string;
  discountAmount: number;
  taxableAmount: number;
  taxPercent: string;
  taxAmount: number;
  netAmount: number;
  warehouseId: string | null;
  warehouseName: string;
}

export interface SalesOrderAdditionState {
  rowId: string;
  type: "Addition" | "Deduction";
  ledgerId: string | null;
  ledgerName: string;
  description: string;
  amount: string;
}

export interface SalesOrderFooterState {
  vehicleNo: string;
  total: number;
  discount: number;
  freight: string;
  soAdvance: string;
  roundOff: string;
  netTotal: number;
  balance: number;
  remarks: string;
}

export interface SalesOrderFormState {
  orderDetails: SalesOrderOrderDetailsState;
  partyInformation: SalesOrderPartyInformationState;
  commercialDetails: SalesOrderCommercialDetailsState;
  salesDetails: SalesOrderSalesDetailsState;
  items: SalesOrderLineState[];
  additions: SalesOrderAdditionState[];
  footer: SalesOrderFooterState;
}

export function createEmptySalesOrderLine(
  index: number,
  defaults?: Partial<SalesOrderLineState>,
): SalesOrderLineState {
  return {
    rowId: createLineId(),
    sno: index,
    productId: null,
    productName: "",
    hsnCode: "",
    unitId: null,
    unitName: "",
    quantity: "1",
    foc: "0",
    mrp: "0",
    rate: "0",
    grossAmount: 0,
    discountPercent: "0",
    discountAmount: 0,
    taxableAmount: 0,
    taxPercent: "0",
    taxAmount: 0,
    netAmount: 0,
    warehouseId: null,
    warehouseName: "",
    ...defaults,
  };
}

export function createEmptySalesOrderAddition(
  defaults?: Partial<SalesOrderAdditionState>,
): SalesOrderAdditionState {
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

export function createSalesOrderFormState(
  seed?: Partial<SalesOrderFormState>,
): SalesOrderFormState {
  const today = new Date().toISOString().slice(0, 10);
  const base: SalesOrderFormState = {
    orderDetails: {
      voucherType: "SL",
      no: "",
      date: today,
      deliveryDate: today,
    },
    partyInformation: {
      customerId: null,
      customerName: "",
      customerCode: "",
      address: "",
      attention: "",
    },
    commercialDetails: {
      rateLevel: "RRATE",
      currencyId: null,
      currencyCode: "",
      currencySymbol: "",
      creditLimit: "0",
      isInterState: false,
      taxApplication: "After Discount",
    },
    salesDetails: {
      salesManId: null,
      salesMan: "",
    },
    items: [createEmptySalesOrderLine(1)],
    additions: [],
    footer: {
      vehicleNo: "",
      total: 0,
      discount: 0,
      freight: "0",
      soAdvance: "0",
      roundOff: "0",
      netTotal: 0,
      balance: 0,
      remarks: "",
    },
  };

  const merged: SalesOrderFormState = {
    orderDetails: { ...base.orderDetails, ...seed?.orderDetails },
    partyInformation: { ...base.partyInformation, ...seed?.partyInformation },
    commercialDetails: {
      ...base.commercialDetails,
      ...seed?.commercialDetails,
    },
    salesDetails: { ...base.salesDetails, ...seed?.salesDetails },
    items:
      seed?.items && seed.items.length > 0
        ? seed.items.map((item, index) =>
            createEmptySalesOrderLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    additions:
      seed?.additions && seed.additions.length > 0
        ? seed.additions.map((addition) =>
            createEmptySalesOrderAddition({
              ...addition,
              rowId: addition.rowId ?? createAdditionId(),
            }),
          )
        : base.additions,
    footer: { ...base.footer, ...seed?.footer },
  };

  return recalculateSalesOrderState(merged);
}

export function recalculateSalesOrderLine(
  line: SalesOrderLineState,
  taxApplication: SalesOrderCommercialDetailsState["taxApplication"],
) {
  const quantity = parseNumber(line.quantity);
  const rate = parseNumber(line.rate);
  const discountPercent = parseNumber(line.discountPercent);
  const taxPercent = parseNumber(line.taxPercent);
  const grossAmount = roundAmount(quantity * rate);
  const discountAmount = roundAmount((grossAmount * discountPercent) / 100);
  const taxableAmount =
    taxApplication === "Before Discount"
      ? grossAmount
      : Math.max(0, roundAmount(grossAmount - discountAmount));
  const taxAmount = roundAmount((taxableAmount * taxPercent) / 100);
  const netAmount = roundAmount(taxableAmount + taxAmount);

  return {
    ...line,
    grossAmount,
    discountAmount,
    taxableAmount,
    taxAmount,
    netAmount,
  };
}

export function recalculateSalesOrderState(
  state: SalesOrderFormState,
): SalesOrderFormState {
  const items = state.items.map((line, index) =>
    recalculateSalesOrderLine(
      {
        ...line,
        sno: index + 1,
      },
      state.commercialDetails.taxApplication,
    ),
  );

  const additions = state.additions.map((addition) => ({ ...addition }));
  const total = roundAmount(
    items.reduce((sum, item) => sum + item.grossAmount, 0),
  );
  const discount = roundAmount(
    items.reduce((sum, item) => sum + item.discountAmount, 0),
  );
  const freight = parseNumber(state.footer.freight);
  const soAdvance = parseNumber(state.footer.soAdvance);
  const roundOff = parseNumber(state.footer.roundOff);
  const additionsNet = roundAmount(
    additions.reduce((sum, addition) => {
      const amount = parseNumber(addition.amount);
      return sum + (addition.type === "Deduction" ? -amount : amount);
    }, 0),
  );
  const itemsNet = roundAmount(
    items.reduce((sum, item) => sum + item.netAmount, 0),
  );
  const netTotal = roundAmount(
    itemsNet + freight + additionsNet + roundOff - soAdvance,
  );
  const balance = netTotal;

  return {
    ...state,
    items,
    additions,
    footer: {
      ...state.footer,
      total,
      discount,
      netTotal,
      balance,
    },
  };
}

export function toSalesOrderPayload(
  state: SalesOrderFormState,
): SalesOrderPayload {
  return {
    orderDetails: {
      voucherType: state.orderDetails.voucherType,
      no: state.orderDetails.no,
      date: state.orderDetails.date,
      deliveryDate: state.orderDetails.deliveryDate || null,
    },
    partyInformation: {
      customerId: state.partyInformation.customerId ?? "",
      customerName: state.partyInformation.customerName,
      customerCode: state.partyInformation.customerCode || null,
      address: state.partyInformation.address || null,
      attention: state.partyInformation.attention || null,
    },
    commercialDetails: {
      rateLevel: state.commercialDetails.rateLevel,
      currencyId: state.commercialDetails.currencyId,
      currencyCode: state.commercialDetails.currencyCode || null,
      currencySymbol: state.commercialDetails.currencySymbol || null,
      creditLimit: parseNumber(state.commercialDetails.creditLimit),
      isInterState: state.commercialDetails.isInterState,
      taxApplication: state.commercialDetails.taxApplication,
    },
    salesDetails: {
      salesManId: state.salesDetails.salesManId,
      salesMan: state.salesDetails.salesMan || null,
    },
    items: state.items
      .filter((line) => line.productId && line.unitId)
      .map((line) => ({
        sno: line.sno,
        productId: line.productId ?? "",
        productNameSnapshot: line.productName,
        hsnCode: line.hsnCode || null,
        unitId: line.unitId ?? "",
        quantity: parseNumber(line.quantity),
        foc: parseNumber(line.foc),
        mrp: parseNumber(line.mrp),
        rate: parseNumber(line.rate),
        grossAmount: line.grossAmount,
        discountPercent: parseNumber(line.discountPercent),
        discountAmount: line.discountAmount,
        taxableAmount: line.taxableAmount,
        taxPercent: parseNumber(line.taxPercent),
        taxAmount: line.taxAmount,
        netAmount: line.netAmount,
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
        ledgerName: addition.ledgerName || null,
        description: addition.description || null,
        amount: parseNumber(addition.amount),
      })),
    footer: {
      vehicleNo: state.footer.vehicleNo || null,
      total: state.footer.total,
      discount: state.footer.discount,
      freight: parseNumber(state.footer.freight),
      soAdvance: parseNumber(state.footer.soAdvance),
      roundOff: parseNumber(state.footer.roundOff),
      netTotal: state.footer.netTotal,
      balance: state.footer.balance,
      remarks: state.footer.remarks || null,
    },
  };
}
