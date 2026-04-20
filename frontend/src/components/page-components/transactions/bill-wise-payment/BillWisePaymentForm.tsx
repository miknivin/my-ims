import { FormEvent, useEffect, useMemo, useState } from "react";
import { skipToken } from "@reduxjs/toolkit/query";
import { useNavigate } from "react-router";
import {
  BillWisePaymentOutstandingInvoice,
  BillWisePaymentPayload,
  useCreateBillWisePaymentMutation,
  useGetBillWisePaymentOutstandingInvoicesQuery,
} from "../../../../app/api/billWisePaymentApi";
import { useLazySearchLookupQuery } from "../../../../app/api/lookupApi";
import { useGetLedgersQuery } from "../../../../app/api/ledgerApi";
import { useLazyGetVendorByIdQuery } from "../../../../app/api/vendorApi";
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

interface BillWisePaymentFormState {
  document: {
    voucherType: string;
    no: string;
    date: string;
  };
  vendorInformation: {
    vendorId: string | null;
    vendorName: string;
    address: string;
    attention: string;
    phone: string;
  };
  accountInformation: {
    ledgerId: string | null;
    ledgerName: string;
  };
  paymentDetails: {
    referenceNo: string;
    instrumentNo: string;
    instrumentDate: string;
    notes: string;
    advance: string;
  };
  allocations: BillWiseAllocationRow[];
}

function createInitialState(): BillWisePaymentFormState {
  return {
    document: {
      voucherType: "BWP",
      no: "",
      date: getTodayDate(),
    },
    vendorInformation: {
      vendorId: null,
      vendorName: "",
      address: "",
      attention: "",
      phone: "",
    },
    accountInformation: {
      ledgerId: null,
      ledgerName: "",
    },
    paymentDetails: {
      referenceNo: "",
      instrumentNo: "",
      instrumentDate: "",
      notes: "",
      advance: "",
    },
    allocations: [],
  };
}

function toOutstandingOptions(
  invoices: BillWisePaymentOutstandingInvoice[],
): BillWiseOutstandingInvoiceOption[] {
  return invoices.map((invoice) => ({
    sourceId: invoice.purchaseInvoiceId,
    sourceNo: invoice.no,
    sourceDate: invoice.date,
    sourceDueDate: invoice.dueDate,
    sourceReferenceNo: invoice.referenceNo,
    description: invoice.description,
    originalAmount: invoice.originalAmount,
    outstandingBalance: invoice.outstandingBalance,
  }));
}

function toPayload(state: BillWisePaymentFormState): BillWisePaymentPayload {
  return {
    document: {
      no: state.document.no,
      date: state.document.date,
    },
    vendorInformation: {
      vendorId: state.vendorInformation.vendorId ?? "",
      vendorNameSnapshot: state.vendorInformation.vendorName,
      address: state.vendorInformation.address,
      attention: normalizeOptionalText(state.vendorInformation.attention),
      phone: normalizeOptionalText(state.vendorInformation.phone),
    },
    accountInformation: {
      ledgerId: state.accountInformation.ledgerId ?? "",
      ledgerNameSnapshot: normalizeOptionalText(state.accountInformation.ledgerName),
    },
    paymentDetails: {
      referenceNo: normalizeOptionalText(state.paymentDetails.referenceNo),
      instrumentNo: normalizeOptionalText(state.paymentDetails.instrumentNo),
      instrumentDate:
        normalizeOptionalText(state.paymentDetails.instrumentDate) ?? null,
      notes: normalizeOptionalText(state.paymentDetails.notes),
      advance: parseAmount(state.paymentDetails.advance),
    },
    allocations: state.allocations
      .map((row, index) => ({
        sno: index + 1,
        purchaseInvoiceId: row.sourceId,
        paidAmount: parseAmount(row.paidAmount),
        discountAmount: parseAmount(row.discountAmount),
      }))
      .filter(
        (row) => row.paidAmount > 0 || row.discountAmount > 0,
      ),
    status: "Submitted",
  };
}

export default function BillWisePaymentForm() {
  const navigate = useNavigate();
  const [state, setState] = useState<BillWisePaymentFormState>(
    createInitialState,
  );
  const [formError, setFormError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [searchLookup] = useLazySearchLookupQuery();
  const [getVendorById] = useLazyGetVendorByIdQuery();
  const { data: ledgers = [] } = useGetLedgersQuery();
  const [createBillWisePayment] = useCreateBillWisePaymentMutation();

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

  const outstandingQueryArg = state.vendorInformation.vendorId ?? skipToken;
  const {
    data: outstandingInvoices = [],
    isFetching: isLoadingAllocations,
  } = useGetBillWisePaymentOutstandingInvoicesQuery(outstandingQueryArg);

  useEffect(() => {
    if (!state.vendorInformation.vendorId) {
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
  }, [outstandingInvoices, state.vendorInformation.vendorId]);

  const totals = useMemo(
    () => calculateBillWiseTotals(state.allocations, state.paymentDetails.advance),
    [state.allocations, state.paymentDetails.advance],
  );

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormError("");

    if (!state.document.no.trim()) {
      setFormError("Bill wise payment number is required.");
      return;
    }

    if (!state.vendorInformation.vendorId) {
      setFormError("Please select a vendor.");
      return;
    }

    if (!state.accountInformation.ledgerId) {
      setFormError("Please select a payment account.");
      return;
    }

    const hasAllocation = state.allocations.some(
      (row) =>
        parseAmount(row.paidAmount) > 0 || parseAmount(row.discountAmount) > 0,
    );

    if (!hasAllocation && parseAmount(state.paymentDetails.advance) <= 0) {
      setFormError("Add at least one allocation or enter an advance amount.");
      return;
    }

    setIsSaving(true);

    try {
      await createBillWisePayment(toPayload(state)).unwrap();
      setState(createInitialState());
      navigate("/operations/supplier-payments");
    } catch (error) {
      setFormError(
        getMutationErrorMessage(
          error,
          "Unable to save the bill wise payment.",
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <BillWiseFormHeader
        documentLabel="Payment No"
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
        partyLabel="Vendor"
        partyValue={state.vendorInformation.vendorName}
        partyAddress={state.vendorInformation.address}
        partyAttention={state.vendorInformation.attention}
        partyPhone={state.vendorInformation.phone}
        onPartyInputChange={(value) =>
          setState((current) => ({
            ...current,
            vendorInformation: {
              vendorId: null,
              vendorName: value,
              address: "",
              attention: "",
              phone: "",
            },
            allocations: [],
          }))
        }
        onPartySelect={async (item) => {
          if (!item) {
            setState((current) => ({
              ...current,
              vendorInformation: {
                vendorId: null,
                vendorName: "",
                address: "",
                attention: "",
                phone: "",
              },
              allocations: [],
            }));
            return;
          }

          setState((current) => ({
            ...current,
            vendorInformation: {
              ...current.vendorInformation,
              vendorId: item.id,
              vendorName: item.label,
            },
          }));

          try {
            const vendor = await getVendorById(item.id).unwrap();
            setState((current) => ({
              ...current,
              vendorInformation: {
                vendorId: vendor.id,
                vendorName: vendor.basicInfo.name,
                address: vendor.addressAndContact.address ?? "",
                attention: vendor.addressAndContact.contactName ?? "",
                phone: vendor.addressAndContact.phone ?? "",
              },
            }));
          } catch {
            // Keep the selected vendor label if detail hydration fails.
          }
        }}
        searchParty={(keyword) =>
          searchLookup({ source: "vendors", keyword, limit: 10 }).unwrap()
        }
        onPartyAddressChange={(value) =>
          setState((current) => ({
            ...current,
            vendorInformation: {
              ...current.vendorInformation,
              address: value,
            },
          }))
        }
        onPartyAttentionChange={(value) =>
          setState((current) => ({
            ...current,
            vendorInformation: {
              ...current.vendorInformation,
              attention: value,
            },
          }))
        }
        onPartyPhoneChange={(value) =>
          setState((current) => ({
            ...current,
            vendorInformation: {
              ...current.vendorInformation,
              phone: value,
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
        referenceNo={state.paymentDetails.referenceNo}
        instrumentNo={state.paymentDetails.instrumentNo}
        instrumentDate={state.paymentDetails.instrumentDate}
        notes={state.paymentDetails.notes}
        advance={state.paymentDetails.advance}
        totalAllocated={totals.totalAllocated}
        totalDiscount={totals.totalDiscount}
        amount={totals.amount}
        onReferenceNoChange={(value) =>
          setState((current) => ({
            ...current,
            paymentDetails: {
              ...current.paymentDetails,
              referenceNo: value,
            },
          }))
        }
        onInstrumentNoChange={(value) =>
          setState((current) => ({
            ...current,
            paymentDetails: {
              ...current.paymentDetails,
              instrumentNo: value,
            },
          }))
        }
        onInstrumentDateChange={(value) =>
          setState((current) => ({
            ...current,
            paymentDetails: {
              ...current.paymentDetails,
              instrumentDate: value,
            },
          }))
        }
        onNotesChange={(value) =>
          setState((current) => ({
            ...current,
            paymentDetails: {
              ...current.paymentDetails,
              notes: value,
            },
          }))
        }
        onAdvanceChange={(value) =>
          setState((current) => ({
            ...current,
            paymentDetails: {
              ...current.paymentDetails,
              advance: value,
            },
          }))
        }
      />

      <BillWiseAllocationTable
        title="Allocation Table"
        documentLabel="Purchase Invoice"
        rows={state.allocations}
        isLoading={isLoadingAllocations}
        emptyMessage={
          state.vendorInformation.vendorId
            ? "No outstanding purchase invoices found for the selected vendor."
            : "Select a vendor to load outstanding purchase invoices."
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
        primaryLabel="Save Bill Wise Payment"
        onReset={() => {
          setState(createInitialState());
          setFormError("");
        }}
        onCancel={() => navigate("/operations/supplier-payments")}
      />
    </form>
  );
}
