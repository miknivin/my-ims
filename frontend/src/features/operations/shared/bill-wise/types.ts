import { SerializedError } from "@reduxjs/toolkit";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";

export interface BillWiseAllocationRow {
  sourceId: string;
  sourceNo: string;
  sourceDate: string;
  sourceDueDate: string | null;
  sourceReferenceNo: string | null;
  description: string | null;
  originalAmount: number;
  outstandingBalance: number;
  paidAmount: string;
  discountAmount: string;
}

export interface BillWiseOutstandingInvoiceOption {
  sourceId: string;
  sourceNo: string;
  sourceDate: string;
  sourceDueDate: string;
  sourceReferenceNo: string;
  description: string | null;
  originalAmount: number;
  outstandingBalance: number;
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function normalizeOptionalText(value: string) {
  const normalized = value.trim();
  return normalized ? normalized : null;
}

export function parseAmount(value: string) {
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function roundAmount(value: number) {
  return Math.round(value * 100) / 100;
}

export function calculateBillWiseTotals(
  allocations: BillWiseAllocationRow[],
  advance: string,
) {
  const totalAllocated = roundAmount(
    allocations.reduce((sum, row) => sum + parseAmount(row.paidAmount), 0),
  );
  const totalDiscount = roundAmount(
    allocations.reduce((sum, row) => sum + parseAmount(row.discountAmount), 0),
  );
  const amount = roundAmount(totalAllocated + parseAmount(advance));

  return {
    totalAllocated,
    totalDiscount,
    amount,
  };
}

export function getOutstandingAfter(row: BillWiseAllocationRow) {
  return roundAmount(
    Math.max(
      0,
      row.outstandingBalance -
        parseAmount(row.paidAmount) -
        parseAmount(row.discountAmount),
    ),
  );
}

export function mergeOutstandingRows(
  outstandingInvoices: BillWiseOutstandingInvoiceOption[],
  previousRows: BillWiseAllocationRow[],
) {
  const previousById = new Map(
    previousRows.map((row) => [
      row.sourceId,
      {
        paidAmount: row.paidAmount,
        discountAmount: row.discountAmount,
      },
    ]),
  );

  return outstandingInvoices.map((item) => {
    const previous = previousById.get(item.sourceId);

    return {
      sourceId: item.sourceId,
      sourceNo: item.sourceNo,
      sourceDate: item.sourceDate,
      sourceDueDate: item.sourceDueDate,
      sourceReferenceNo: item.sourceReferenceNo || null,
      description: item.description,
      originalAmount: item.originalAmount,
      outstandingBalance: item.outstandingBalance,
      paidAmount: previous?.paidAmount ?? "",
      discountAmount: previous?.discountAmount ?? "",
    };
  });
}

export function formatDate(value: string, includeTime = false) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return "-";
  }

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime
      ? {
          hour: "2-digit",
          minute: "2-digit",
        }
      : {}),
  });
}

export function getStatusClass(status: string) {
  if (status === "Draft" || status === "Pending") {
    return "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400";
  }

  if (status === "Submitted" || status === "Completed") {
    return "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400";
  }

  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export function getMutationErrorMessage(
  error: unknown,
  fallbackMessage: string,
) {
  if (!error) {
    return fallbackMessage;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "status" in error
  ) {
    const errorData = (error as FetchBaseQueryError).data as
      | { message?: string }
      | undefined;
    return errorData?.message ?? fallbackMessage;
  }

  if (
    typeof error === "object" &&
    error !== null &&
    "message" in error &&
    typeof (error as SerializedError).message === "string"
  ) {
    return (error as SerializedError).message ?? fallbackMessage;
  }

  return fallbackMessage;
}
