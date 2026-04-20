import type { GoodsReceiptMode, GoodsReceiptNotePayload, TaxableMode } from "../../../../../app/api/goodsReceiptNoteApi";

export const GOODS_RECEIPT_NOTE_DRAFT_STORAGE_KEY =
  "ims.goods-receipt-note.draft";

let goodsReceiptLineCounter = 0;

function createLineId() {
  goodsReceiptLineCounter += 1;
  return `grn-line-${goodsReceiptLineCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface GoodsReceiptSourceReferenceState {
  mode: GoodsReceiptMode;
  purchaseOrderId: string | null;
  purchaseOrderNo: string;
  directLpoNo: string;
  directVendorInvoiceNo: string;
}

export interface GoodsReceiptDocumentState {
  voucherType: string;
  no: string;
  date: string;
  deliveryDate: string;
}

export interface GoodsReceiptVendorInformationState {
  vendorId: string | null;
  vendorLabel: string;
  address: string;
  attention: string;
  phone: string;
}

export interface GoodsReceiptLogisticsState {
  lrService: string;
  lrNo: string;
  lrDate: string;
}

export interface GoodsReceiptGeneralState {
  ownProductsOnly: boolean;
  taxableMode: TaxableMode;
  notes: string;
}

export interface GoodsReceiptLineState {
  rowId: string;
  serialNo: number;
  productId: string | null;
  productNameSnapshot: string;
  hsnCode: string;
  code: string;
  ubc: string;
  unitId: string | null;
  unitName: string;
  warehouseId: string | null;
  warehouseName: string;
  fRate: string;
  rate: string;
  quantity: string;
  focQuantity: string;
  grossAmount: number;
  discountPercent: string;
  discountAmount: number;
  taxableAmount: number;
  total: number;
  manufacturingDateUtc: string;
  expiryDateUtc: string;
  remark: string;
  sellingRate: string;
  purchaseOrderLineId: string | null;
}

export interface GoodsReceiptFooterState {
  addition: string;
  discountFooter: string;
  roundOff: string;
  netTotal: number;
  totalQty: number;
  totalFoc: number;
  totalAmount: number;
}

export interface GoodsReceiptFormState {
  sourceRef: GoodsReceiptSourceReferenceState;
  document: GoodsReceiptDocumentState;
  vendorInformation: GoodsReceiptVendorInformationState;
  logistics: GoodsReceiptLogisticsState;
  general: GoodsReceiptGeneralState;
  items: GoodsReceiptLineState[];
  footer: GoodsReceiptFooterState;
}

export function createEmptyGoodsReceiptLine(
  index: number,
  defaults?: Partial<GoodsReceiptLineState>,
): GoodsReceiptLineState {
  return {
    rowId: createLineId(),
    serialNo: index,
    productId: null,
    productNameSnapshot: "",
    hsnCode: "",
    code: "",
    ubc: "",
    unitId: null,
    unitName: "",
    warehouseId: null,
    warehouseName: "",
    fRate: "0",
    rate: "0",
    quantity: "1",
    focQuantity: "0",
    grossAmount: 0,
    discountPercent: "0",
    discountAmount: 0,
    taxableAmount: 0,
    total: 0,
    manufacturingDateUtc: "",
    expiryDateUtc: "",
    remark: "",
    sellingRate: "0",
    purchaseOrderLineId: null,
    ...defaults,
  };
}

export function createGoodsReceiptFormState(
  seed?: Partial<GoodsReceiptFormState>,
): GoodsReceiptFormState {
  const today = new Date().toISOString().slice(0, 10);

  const base: GoodsReceiptFormState = {
    sourceRef: {
      mode: "Direct",
      purchaseOrderId: null,
      purchaseOrderNo: "",
      directLpoNo: "",
      directVendorInvoiceNo: "",
    },
    document: {
      voucherType: "GRN",
      no: "",
      date: today,
      deliveryDate: today,
    },
    vendorInformation: {
      vendorId: null,
      vendorLabel: "",
      address: "",
      attention: "",
      phone: "",
    },
    logistics: {
      lrService: "",
      lrNo: "",
      lrDate: today,
    },
    general: {
      ownProductsOnly: false,
      taxableMode: "Taxable",
      notes: "",
    },
    items: [createEmptyGoodsReceiptLine(1)],
    footer: {
      addition: "0",
      discountFooter: "0",
      roundOff: "0",
      netTotal: 0,
      totalQty: 0,
      totalFoc: 0,
      totalAmount: 0,
    },
  };

  const merged: GoodsReceiptFormState = {
    sourceRef: {
      ...base.sourceRef,
      ...seed?.sourceRef,
    },
    document: {
      ...base.document,
      ...seed?.document,
    },
    vendorInformation: {
      ...base.vendorInformation,
      ...seed?.vendorInformation,
    },
    logistics: {
      ...base.logistics,
      ...seed?.logistics,
    },
    general: {
      ...base.general,
      ...seed?.general,
    },
    items:
      seed?.items && seed.items.length > 0
        ? seed.items.map((item, index) =>
            createEmptyGoodsReceiptLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    footer: {
      ...base.footer,
      ...seed?.footer,
    },
  };

  return recalculateGoodsReceiptState(merged);
}

export function recalculateGoodsReceiptLine(line: GoodsReceiptLineState) {
  const quantity = parseNumber(line.quantity);
  const rate = parseNumber(line.rate);
  const discountPercent = parseNumber(line.discountPercent);
  const grossAmount = roundAmount(quantity * rate);
  const discountAmount = roundAmount((grossAmount * discountPercent) / 100);
  const total = roundAmount(grossAmount - discountAmount);

  return {
    ...line,
    grossAmount,
    discountAmount,
    taxableAmount: total,
    total,
  };
}

export function recalculateGoodsReceiptState(
  state: GoodsReceiptFormState,
): GoodsReceiptFormState {
  const items = state.items.map((line, index) =>
    recalculateGoodsReceiptLine({
      ...line,
      serialNo: index + 1,
    }),
  );

  const totalQty = roundAmount(
    items.reduce((sum, item) => sum + parseNumber(item.quantity), 0),
  );
  const totalFoc = roundAmount(
    items.reduce((sum, item) => sum + parseNumber(item.focQuantity), 0),
  );
  const totalAmount = roundAmount(
    items.reduce((sum, item) => sum + item.total, 0),
  );
  const addition = parseNumber(state.footer.addition);
  const discountFooter = parseNumber(state.footer.discountFooter);
  const roundOff = parseNumber(state.footer.roundOff);
  const netTotal = roundAmount(
    totalAmount + addition - discountFooter + roundOff,
  );

  return {
    ...state,
    items,
    footer: {
      ...state.footer,
      totalQty,
      totalFoc,
      totalAmount,
      netTotal,
    },
  };
}

export function loadGoodsReceiptDraft() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(GOODS_RECEIPT_NOTE_DRAFT_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as Partial<GoodsReceiptFormState>;
    return createGoodsReceiptFormState(parsed);
  } catch {
    return null;
  }
}

export function toGoodsReceiptPayload(
  state: GoodsReceiptFormState,
): GoodsReceiptNotePayload {
  return {
    sourceRef: {
      mode: state.sourceRef.mode,
      purchaseOrderId: state.sourceRef.purchaseOrderId,
      purchaseOrderNo: state.sourceRef.purchaseOrderNo || null,
      directLpoNo: state.sourceRef.directLpoNo || null,
      directVendorInvoiceNo: state.sourceRef.directVendorInvoiceNo || null,
    },
    document: {
      voucherType: state.document.voucherType,
      no: state.document.no,
      date: state.document.date,
      deliveryDate: state.document.deliveryDate || null,
    },
    vendorInformation: {
      vendorId: state.vendorInformation.vendorId ?? "",
      vendorNameSnapshot: state.vendorInformation.vendorLabel,
      address: state.vendorInformation.address,
      attention: state.vendorInformation.attention || null,
      phone: state.vendorInformation.phone || null,
    },
    logistics: {
      lrService: state.logistics.lrService || null,
      lrNo: state.logistics.lrNo || null,
      lrDate: state.logistics.lrDate || null,
    },
    general: {
      ownProductsOnly: state.general.ownProductsOnly,
      taxableMode: state.general.taxableMode,
      notes: state.general.notes || null,
    },
    items: state.items
      .filter((line) => line.productId && line.unitId && line.warehouseId)
      .map((line) => ({
        serialNo: line.serialNo,
        productId: line.productId ?? "",
        productNameSnapshot: line.productNameSnapshot || null,
        hsnCode: line.hsnCode || null,
        code: line.code || null,
        ubc: line.ubc || null,
        unitId: line.unitId ?? "",
        warehouseId: line.warehouseId,
        fRate: parseNumber(line.fRate),
        rate: parseNumber(line.rate),
        quantity: parseNumber(line.quantity),
        focQuantity: parseNumber(line.focQuantity),
        discountPercent: parseNumber(line.discountPercent),
        manufacturingDateUtc: line.manufacturingDateUtc || null,
        expiryDateUtc: line.expiryDateUtc || null,
        remark: line.remark || null,
        sellingRate: parseNumber(line.sellingRate),
        purchaseOrderLineId: line.purchaseOrderLineId,
      })),
    footer: {
      addition: parseNumber(state.footer.addition),
      discountFooter: parseNumber(state.footer.discountFooter),
      roundOff: parseNumber(state.footer.roundOff),
    },
  };
}
