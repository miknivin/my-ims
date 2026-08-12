import type { DeliveryNote, DeliveryNoteMode, DeliveryNotePayload } from "@/redux/api/deliveryNoteApi";
import type { SalesOrder } from "@/redux/api/salesOrderApi";

export const DELIVERY_NOTE_DRAFT_STORAGE_KEY = "ims.delivery-note.draft";

let deliveryNoteLineCounter = 0;

function createLineId() {
  deliveryNoteLineCounter += 1;
  return `dn-line-${deliveryNoteLineCounter}`;
}

function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

function parseNumber(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export interface DeliveryNoteSourceReferenceState {
  mode: DeliveryNoteMode;
  salesOrderId: string | null;
  salesOrderNo: string;
  directRefNo: string;
}

export interface DeliveryNoteDocumentState {
  voucherType: string;
  no: string;
  date: string;
  expectedDeliveryDate: string;
}

export interface DeliveryNoteCustomerInformationState {
  customerId: string | null;
  customerLabel: string;
  address: string;
  shippingAddress: string;
  attention: string;
  phone: string;
}

export interface DeliveryNoteLogisticsState {
  transportMode: string;
  lrNo: string;
  lrDate: string;
  vehicleNo: string;
  eWayBillNo: string;
  transporterName: string;
}

export interface DeliveryNoteGeneralState {
  notes: string;
}

export interface DeliveryNoteLineState {
  rowId: string;
  serialNo: number;
  productId: string | null;
  productNameSnapshot: string;
  hsnCode: string;
  unitId: string | null;
  unitName: string;
  warehouseId: string | null;
  warehouseName: string;
  rate: string;
  quantity: string;
  discountPercent: string;
  grossAmount: number;
  discountAmount: number;
  taxableAmount: number;
  total: number;
  remark: string;
  salesOrderLineId: string | null;
}

export interface DeliveryNoteFooterState {
  totalQty: number;
  totalAmount: number;
  netTotal: number;
}

export interface DeliveryNoteFormState {
  sourceRef: DeliveryNoteSourceReferenceState;
  document: DeliveryNoteDocumentState;
  customerInformation: DeliveryNoteCustomerInformationState;
  logistics: DeliveryNoteLogisticsState;
  general: DeliveryNoteGeneralState;
  items: DeliveryNoteLineState[];
  footer: DeliveryNoteFooterState;
}

export function createEmptyDeliveryNoteLine(
  index: number,
  defaults?: Partial<DeliveryNoteLineState>,
): DeliveryNoteLineState {
  return {
    rowId: createLineId(),
    serialNo: index,
    productId: null,
    productNameSnapshot: "",
    hsnCode: "",
    unitId: null,
    unitName: "",
    warehouseId: null,
    warehouseName: "",
    rate: "0",
    quantity: "1",
    discountPercent: "0",
    grossAmount: 0,
    discountAmount: 0,
    taxableAmount: 0,
    total: 0,
    remark: "",
    salesOrderLineId: null,
    ...defaults,
  };
}

export function createDeliveryNoteFormState(
  seed?: Partial<DeliveryNoteFormState>,
): DeliveryNoteFormState {
  const today = new Date().toISOString().slice(0, 10);

  const base: DeliveryNoteFormState = {
    sourceRef: {
      mode: "Direct",
      salesOrderId: null,
      salesOrderNo: "",
      directRefNo: "",
    },
    document: {
      voucherType: "DN",
      no: "",
      date: today,
      expectedDeliveryDate: today,
    },
    customerInformation: {
      customerId: null,
      customerLabel: "",
      address: "",
      shippingAddress: "",
      attention: "",
      phone: "",
    },
    logistics: {
      transportMode: "",
      lrNo: "",
      lrDate: today,
      vehicleNo: "",
      eWayBillNo: "",
      transporterName: "",
    },
    general: {
      notes: "",
    },
    items: [createEmptyDeliveryNoteLine(1)],
    footer: {
      totalQty: 0,
      totalAmount: 0,
      netTotal: 0,
    },
  };

  const merged: DeliveryNoteFormState = {
    sourceRef: { ...base.sourceRef, ...seed?.sourceRef },
    document: { ...base.document, ...seed?.document },
    customerInformation: { ...base.customerInformation, ...seed?.customerInformation },
    logistics: { ...base.logistics, ...seed?.logistics },
    general: { ...base.general, ...seed?.general },
    items:
      seed?.items && seed.items.length > 0
        ? seed.items.map((item, index) =>
            createEmptyDeliveryNoteLine(index + 1, {
              ...item,
              rowId: item.rowId ?? createLineId(),
            }),
          )
        : base.items,
    footer: { ...base.footer, ...seed?.footer },
  };

  return recalculateDeliveryNoteState(merged);
}

export function recalculateDeliveryNoteLine(line: DeliveryNoteLineState): DeliveryNoteLineState {
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

export function recalculateDeliveryNoteState(
  state: DeliveryNoteFormState,
): DeliveryNoteFormState {
  const items = state.items.map((line, index) =>
    recalculateDeliveryNoteLine({ ...line, serialNo: index + 1 }),
  );

  const totalQty = roundAmount(
    items.reduce((sum, item) => sum + parseNumber(item.quantity), 0),
  );
  const totalAmount = roundAmount(items.reduce((sum, item) => sum + item.total, 0));

  return {
    ...state,
    items,
    footer: {
      totalQty,
      totalAmount,
      netTotal: totalAmount,
    },
  };
}

export function loadDeliveryNoteDraft(): DeliveryNoteFormState | null {
  if (typeof window === "undefined") return null;

  const raw = window.localStorage.getItem(DELIVERY_NOTE_DRAFT_STORAGE_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as Partial<DeliveryNoteFormState>;
    return createDeliveryNoteFormState(parsed);
  } catch {
    return null;
  }
}

export function hydrateFromSalesOrder(
  current: DeliveryNoteFormState,
  salesOrder: SalesOrder,
): DeliveryNoteFormState {
  const lines =
    salesOrder.items.length > 0
      ? salesOrder.items.map((item, index) =>
          createEmptyDeliveryNoteLine(index + 1, {
            productId: item.productId,
            productNameSnapshot: item.productNameSnapshot,
            hsnCode: item.hsnCode ?? "",
            unitId: item.unitId,
            unitName: item.unitName,
            rate: `${item.rate}`,
            quantity: `${item.quantity}`,
            discountPercent: `${item.discountPercent}`,
            warehouseId: item.warehouseId,
            warehouseName: item.warehouseName ?? "",
            salesOrderLineId: item.id,
          }),
        )
      : current.items;

  return recalculateDeliveryNoteState({
    ...current,
    sourceRef: {
      mode: "AgainstSalesOrder",
      salesOrderId: salesOrder.id,
      salesOrderNo: salesOrder.orderDetails.no,
      directRefNo: "",
    },
    customerInformation: {
      customerId: salesOrder.partyInformation.customerId,
      customerLabel: salesOrder.partyInformation.customerNameSnapshot,
      address: salesOrder.partyInformation.address ?? "",
      shippingAddress: "",
      attention: salesOrder.partyInformation.attention ?? "",
      phone: "",
    },
    items: lines,
  });
}

export function fromDeliveryNoteDto(dto: DeliveryNote): DeliveryNoteFormState {
  return createDeliveryNoteFormState({
    sourceRef: {
      mode: dto.sourceRef.mode,
      salesOrderId: dto.sourceRef.salesOrderId,
      salesOrderNo: dto.sourceRef.salesOrderNo ?? "",
      directRefNo: dto.sourceRef.directRefNo ?? "",
    },
    document: {
      voucherType: dto.document.voucherType,
      no: dto.document.no,
      date: dto.document.date,
      expectedDeliveryDate: dto.document.expectedDeliveryDate ?? "",
    },
    customerInformation: {
      customerId: dto.customerInformation.customerId,
      customerLabel: dto.customerInformation.customerNameSnapshot,
      address: dto.customerInformation.address,
      shippingAddress: dto.customerInformation.shippingAddress ?? "",
      attention: dto.customerInformation.attention ?? "",
      phone: dto.customerInformation.phone ?? "",
    },
    logistics: {
      transportMode: dto.logistics.transportMode ?? "",
      lrNo: dto.logistics.lrNo ?? "",
      lrDate: dto.logistics.lrDate ?? "",
      vehicleNo: dto.logistics.vehicleNo ?? "",
      eWayBillNo: dto.logistics.eWayBillNo ?? "",
      transporterName: dto.logistics.transporterName ?? "",
    },
    general: { notes: dto.general.notes ?? "" },
    items: dto.items.map((item) =>
      createEmptyDeliveryNoteLine(item.serialNo, {
        productId: item.productId,
        productNameSnapshot: item.productNameSnapshot,
        hsnCode: item.hsnCode ?? "",
        unitId: item.unitId,
        unitName: item.unitName,
        warehouseId: item.warehouseId,
        warehouseName: item.warehouseName ?? "",
        rate: `${item.rate}`,
        quantity: `${item.quantity}`,
        discountPercent: item.grossAmount > 0
          ? `${Math.round((item.discountAmount / item.grossAmount) * 10000) / 100}`
          : "0",
        remark: item.remark ?? "",
        salesOrderLineId: item.salesOrderLineId,
      }),
    ),
  });
}

export function toDeliveryNotePayload(
  state: DeliveryNoteFormState,
): DeliveryNotePayload {
  return {
    sourceRef: {
      mode: state.sourceRef.mode,
      salesOrderId: state.sourceRef.salesOrderId,
      salesOrderNo: state.sourceRef.salesOrderNo || null,
      directRefNo: state.sourceRef.directRefNo || null,
    },
    document: {
      voucherType: state.document.voucherType,
      no: state.document.no,
      date: state.document.date,
      expectedDeliveryDate: state.document.expectedDeliveryDate || null,
    },
    customerInformation: {
      customerId: state.customerInformation.customerId ?? "",
      customerNameSnapshot: state.customerInformation.customerLabel,
      address: state.customerInformation.address,
      shippingAddress: state.customerInformation.shippingAddress || null,
      attention: state.customerInformation.attention || null,
      phone: state.customerInformation.phone || null,
    },
    logistics: {
      transportMode: state.logistics.transportMode || null,
      lrNo: state.logistics.lrNo || null,
      lrDate: state.logistics.lrDate || null,
      vehicleNo: state.logistics.vehicleNo || null,
      eWayBillNo: state.logistics.eWayBillNo || null,
      transporterName: state.logistics.transporterName || null,
    },
    general: {
      notes: state.general.notes || null,
    },
    items: state.items
      .filter((line) => line.productId && line.unitId && line.warehouseId)
      .map((line) => ({
        serialNo: line.serialNo,
        productId: line.productId ?? "",
        productNameSnapshot: line.productNameSnapshot || null,
        hsnCode: line.hsnCode || null,
        unitId: line.unitId ?? "",
        warehouseId: line.warehouseId,
        rate: parseNumber(line.rate),
        quantity: parseNumber(line.quantity),
        discountPercent: parseNumber(line.discountPercent),
        remark: line.remark || null,
        salesOrderLineId: line.salesOrderLineId,
      })),
    footer: {},
  };
}

