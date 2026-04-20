import { FormEvent, useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import {
  BillWiseReceiptOutstandingInvoice,
  BillWiseReceiptPayload,
  useCreateBillWiseReceiptMutation,
  useGetBillWiseReceiptOutstandingInvoicesQuery,
} from "../../../../app/api/billWiseReceiptApi";
import { useLazySearchLookupQuery } from "../../../../app/api/lookupApi";
import { useGetLedgersQuery } from "../../../../app/api/ledgerApi";
import { useLazyGetCustomerByIdQuery } from "../../../../app/api/customerApi";
import TransactionStickyActionBar from "../shared/TransactionStickyActionBar";
import BillWiseAllocationTable from "../bill-wise/shared/BillWiseAllocationTable";
import BillWiseFormHeader from "../bill-wise/shared/BillWiseFormHeader";
import {
  BillWiseAllocationRow,
  BillWiseOutstandingInvoiceOption,
  calculateBillWiseTotals,
  getMutationErrorMessage,
  getTodayDate,
  mergeOutstandingRows,
  normalizeOptionalText,
  parseAmount,
} from "../bill-wise/shared/types";

interface BillWiseReceiptFormState {
  document: {
    voucherType: string;
    no: string;
    date: string;
  };
  customerInformation: {
    customerId: string | null;
    customerName: string;
    address: string;
  };
  accountInformation: {
    ledgerId: string | null;
    ledgerName: string;
  };
  receiptDetails: {
    referenceNo: string;
    instrumentNo: string;
    instrumentDate: string;
    notes: string;
    advance: string;
  };
  allocations: BillWiseAllocationRow[];
}

function createInitialState(): BillWiseReceiptFormState {
  return {
    document: {
      voucherType: "BWR",
      no: "",
      date: getTodayDate(),
    },
    customerInformation: {
      customerId: null,
      customerName: "",
      address: "",
    },
    accountInformation: {
      ledgerId: null,
      ledgerName: "",
    },
    receiptDetails: {
      referenceNo: "",
      instrumentNo: "",
      instrumentDate: "",
      notes: "",
      advance: "",
    },
    allocations: [],
  };
}

function formatCustomerAddress(customer: {
  billingAddress: {
    street: string | null;
    city: string | null;
    state: string | null;
    pincode: string | null;
    country: string | null;
  };
}) {
  return [
    customer.billingAddress.street,
    customer.billingAddress.city,
    customer.billingAddress.state,
    customer.billingAddress.pincode,
    customer.billingAddress.country,
  ]
    .filter(Boolean)
    .join(", ");
}

function toOutstandingOptions(
  invoices: BillWiseReceiptOutstandingInvoice[],
): BillWiseOutstandingInvoiceOption[] {
  return invoices.map((invoice) => ({
    sourceId: invoice.salesInvoiceId,
    sourceNo: invoice.no,
    sourceDate: invoice.date,
    sourceDueDate: invoice.dueDate,
    sourceReferenceNo: invoice.referenceNo,
    description: invoice.description,
    originalAmount: invoice.originalAmount,
    outstandingBalance: invoice.outstandingBalance,
  }));
}

function toPayload(state: BillWiseReceiptFormState): BillWiseReceiptPayload {
  return {
    document: {
      no: state.document.no,
      date: state.document.date,
    },
    customerInformation: {
      customerId: state.customerInformation.customerId ?? "",
      customerNameSnapshot: state.customerInformation.customerName,
      address: state.customerInformation.address,
    },
    accountInformation: {
      ledgerId: state.accountInformation.ledgerId ?? "",
      ledgerNameSnapshot: normalizeOptionalText(state.accountInformation.ledgerName),
    },
    receiptDetails: {
      referenceNo: normalizeOptionalText(state.receiptDetails.referenceNo),
      instrumentNo: normalizeOptionalText(state.receiptDetails.instrumentNo),
      instrumentDate:
        normalizeOptionalText(state.receiptDetails.instrumentDate) ?? null,
      notes: normalizeOptionalText(state.receiptDetails.notes),
      advance: parseAmount(state.receiptDetails.advance),
    },
    allocations: state.allocations
      .map((row, index) => ({
        sno: index + 1,
        salesInvoiceId: row.sourceId,
        paidAmount: parseAmount(row.paidAmount),
        discountAmount: parseAmount(row.discountAmount),
      }))
      .filter(
        (row) => row.paidAmount > 0 || row.discountAmount > 0,
      ),
    status: "Submitted",
  };
}

export default function BillWiseReceiptForm() {
  const navigate = useNavigate();
  const [state, setState] = useState<BillWiseReceiptFormState>(
    createInitialState,
  );
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchLookup] = useLazySearchLookupQuery();
  const [getCustomerById] = useLazyGetCustomerByIdQuery();
  const { data: ledgers = [] } = useGetLedgersQuery();
  const [createBillWiseReceipt] = useCreateBillWiseReceiptMutation();

  const eligibleLedgers = useMemo(
    () =>
      ledgers.filter(
        (ledger) =>
          ledger.status === "Active" &&
          ledger.allowManualPosting &&
          !ledger.isBillWise &&
          ledger.ledgerGroupNature.toLowerCase() === "asset",
      ),
    [ledgers],
  );

  const outstandingQueryArg = state.customerInformation.customerId ?? skipToken;
  const {
    data: outstandingInvoices = [],
    isFetching: isLoadingAllocations,
  } = useGetBillWiseReceiptOutstandingInvoicesQuery(outstandingQueryArg);

  useEffect(() => {
    if (!state.customerInformation.customerId) {
      setState((current) =>
        current.allocations.length === 0
          ? current
          : { ...current, allocations: [] },
      );
      return;
    }

    const mergedRows = mergeOutstandingRows(
      toOutstandingOptions(outstandingInvoices),
      state.allocations,
    );

    setState((current) => ({
      ...current,
      allocations: mergedRows,
    }));
  }, [outstandingInvoices, state.customerInformation.customerId]);

  const totals = useMemo(
    () => calculateBillWiseTotals(state.allocations, state.receiptDetails.advance),
    [state.allocations, state.receiptDetails.advance],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Bill wise receipt number is required.");
      return;
    }

    if (!state.customerInformation.customerId) {
      setFormError("Please select a customer.");
      return;
    }

    if (!state.accountInformation.ledgerId) {
      setFormError("Please select a receipt account.");
      return;
    }

    const hasAllocation = state.allocations.some(
      (row) =>
        parseAmount(row.paidAmount) > 0 || parseAmount(row.discountAmount) > 0,
    );

    if (!hasAllocation && parseAmount(state.receiptDetails.advance) <= 0) {
      setFormError("Add at least one allocation or enter an advance amount.");
      return;
    }

    setIsSaving(true);

    try {
      await createBillWiseReceipt(toPayload(state)).unwrap();
      setState(createInitialState());
      navigate("/operations/customer-receipts");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "Unable to save the bill wise receipt.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BillWiseFormHeader
        documentLabel="Receipt No"
        voucherType={state.document.voucherType}
        no={state.document.no}
        date={state.document.date}
        onNoChange={(value) =>
          setState((current) => ({
            ...current,
            document: { ...current.document, no: value },
          }))
        }
        onDateChange={(value) =>
          setState((current) => ({
            ...current,
            document: { ...current.document, date: value },
          }))
        }
        partyLabel="Customer"
        partyValue={state.customerInformation.customerName}
        partyAddress={state.customerInformation.address}
        onPartyInputChange={(value) =>
          setState((current) => ({
            ...current,
            customerInformation: {
              customerId: null,
              customerName: value,
              address: "",
            },
            allocations: [],
          }))
        }
        onPartySelect={async (item) => {
          if (!item) {
            setState((current) => ({
              ...current,
              customerInformation: {
                customerId: null,
                customerName: "",
                address: "",
              },
              allocations: [],
            }));
            return;
          }

          setState((current) => ({
            ...current,
            customerInformation: {
              ...current.customerInformation,
              customerId: item.id,
              customerName: item.label,
            },
          }));

          try {
            const customer = await getCustomerById(item.id).unwrap();
            setState((current) => ({
              ...current,
              customerInformation: {
                customerId: customer.id,
                customerName: customer.basicDetails.name,
                address: formatCustomerAddress(customer),
              },
            }));
          } catch {
            // Keep the selected customer label if detail hydration fails.
          }
        }}
        searchParty={(keyword) =>
          searchLookup({ source: "customers", keyword, limit: 10 }).unwrap()
        }
        onPartyAddressChange={(value) =>
          setState((current) => ({
            ...current,
            customerInformation: {
              ...current.customerInformation,
              address: value,
            },
          }))
        }
        accountValue={state.accountInformation.ledgerName}
        onAccountInputChange={(value) =>
          setState((current) => ({
            ...current,
            accountInformation: {
              ledgerId: null,
              ledgerName: value,
            },
          }))
        }
        onAccountSelect={(item) =>
          setState((current) => ({
            ...current,
            accountInformation: item
              ? {
                  ledgerId: item.id,
                  ledgerName: item.label,
                }
              : {
                  ledgerId: null,
                  ledgerName: "",
                },
          }))
        }
        searchAccount={async (keyword) => {
          const normalizedKeyword = keyword.trim().toLowerCase();

          return eligibleLedgers
            .filter((ledger) =>
              [ledger.name, ledger.code, ledger.alias]
                .filter(Boolean)
                .some((value) =>
                  value!.toLowerCase().includes(normalizedKeyword),
                ),
            )
            .slice(0, 10)
            .map((ledger) => ({
              id: ledger.id,
              label: ledger.name,
            }));
        }}
        referenceNo={state.receiptDetails.referenceNo}
        instrumentNo={state.receiptDetails.instrumentNo}
        instrumentDate={state.receiptDetails.instrumentDate}
        notes={state.receiptDetails.notes}
        advance={state.receiptDetails.advance}
        totalAllocated={totals.totalAllocated}
        totalDiscount={totals.totalDiscount}
        amount={totals.amount}
        onReferenceNoChange={(value) =>
          setState((current) => ({
            ...current,
            receiptDetails: {
              ...current.receiptDetails,
              referenceNo: value,
            },
          }))
        }
        onInstrumentNoChange={(value) =>
          setState((current) => ({
            ...current,
            receiptDetails: {
              ...current.receiptDetails,
              instrumentNo: value,
            },
          }))
        }
        onInstrumentDateChange={(value) =>
          setState((current) => ({
            ...current,
            receiptDetails: {
              ...current.receiptDetails,
              instrumentDate: value,
            },
          }))
        }
        onNotesChange={(value) =>
          setState((current) => ({
            ...current,
            receiptDetails: {
              ...current.receiptDetails,
              notes: value,
            },
          }))
        }
        onAdvanceChange={(value) =>
          setState((current) => ({
            ...current,
            receiptDetails: {
              ...current.receiptDetails,
              advance: value,
            },
          }))
        }
      />

      <BillWiseAllocationTable
        title="Allocation Table"
        documentLabel="Sales Invoice"
        rows={state.allocations}
        isLoading={isLoadingAllocations}
        emptyMessage={
          state.customerInformation.customerId
            ? "No outstanding sales invoices found for the selected customer."
            : "Select a customer to load outstanding sales invoices."
        }
        onPaidAmountChange={(sourceId, value) =>
          setState((current) => ({
            ...current,
            allocations: current.allocations.map((row) =>
              row.sourceId === sourceId ? { ...row, paidAmount: value } : row,
            ),
          }))
        }
        onDiscountAmountChange={(sourceId, value) =>
          setState((current) => ({
            ...current,
            allocations: current.allocations.map((row) =>
              row.sourceId === sourceId
                ? { ...row, discountAmount: value }
                : row,
            ),
          }))
        }
      />

      {formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {formError}
        </div>
      ) : null}

      <TransactionStickyActionBar
        isSaving={isSaving}
        primaryLabel="Save Bill Wise Receipt"
        onReset={() => {
          setState(createInitialState());
          setFormError("");
        }}
        onCancel={() => navigate("/operations/customer-receipts")}
      />
    </form>
  );
}
