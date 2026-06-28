import { useState } from "react";
import { Link } from "react-router";
import {
  CreateManualJournalVoucherPayload,
  useCreateManualJournalVoucherMutation,
  useGetJournalVouchersQuery,
} from "@/redux/api/journalVoucherApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import PaginationControls from "@/shared/components/filtering/PaginationControls";
import Button from "@/shared/components/ui/button/Button";
import { Modal } from "@/shared/components/ui/modal";
import ManualJournalVoucherForm from "./components/ManualJournalVoucherForm";

export default function JournalVoucherListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const { data, isLoading, isError } = useGetJournalVouchersQuery({
    page,
    limit,
    sortBy: "date_desc",
  });
  const [createManualJournalVoucher, { isLoading: isPosting }] =
    useCreateManualJournalVoucherMutation();

  const vouchers = data?.items ?? [];

  const handleSubmit = async (payload: CreateManualJournalVoucherPayload) => {
    setSubmitError(null);
    try {
      await createManualJournalVoucher(payload).unwrap();
      setIsOpen(false);
    } catch (error) {
      setSubmitError(getErrorMessage(error));
    }
  };

  const handleLimitChange = (nextLimit: number) => {
    setLimit(nextLimit);
    setPage(1);
  };

  return (
    <div className="w-full space-y-5">
      <PageBreadcrumb pageTitle="Journal Vouchers" />

      <div className="flex justify-end">
        <Button type="button" onClick={() => setIsOpen(true)}>
          New Manual Voucher
        </Button>
      </div>

      <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 dark:bg-white/[0.02]">
              <tr>
                {[
                  "Date",
                  "Voucher No",
                  "Source",
                  "Narration",
                  "Debit",
                  "Credit",
                  "Status",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase text-gray-500 dark:text-gray-400"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    Loading journal vouchers...
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-error-500"
                  >
                    Unable to load journal vouchers.
                  </td>
                </tr>
              ) : vouchers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                  >
                    No journal vouchers found.
                  </td>
                </tr>
              ) : (
                vouchers.map((voucher) => (
                  <tr key={voucher.id}>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {voucher.postingDate}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">
                      <Link
                        to={`/operations/accounting/journal-vouchers/${voucher.id}`}
                        className="text-brand-600 hover:underline dark:text-brand-400"
                      >
                        {voucher.voucherNo}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                        {voucher.source}
                      </span>
                    </td>
                    <td className="min-w-72 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {voucher.narration || "-"}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                      {formatAmount(voucher.totalDebit)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                      {formatAmount(voucher.totalCredit)}
                    </td>
                    <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {voucher.status}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
      <PaginationControls
        page={data?.page ?? page}
        limit={data?.limit ?? limit}
        total={data?.total ?? 0}
        totalPages={data?.totalPages ?? 0}
        onPageChange={setPage}
        onLimitChange={handleLimitChange}
      />

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        className="max-w-[1200px] p-4 lg:p-6"
      >
        <ManualJournalVoucherForm
          isPosting={isPosting}
          errorMessage={submitError}
          onCancel={() => setIsOpen(false)}
          onSubmit={handleSubmit}
        />
      </Modal>
    </div>
  );
}

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getErrorMessage(error: unknown) {
  if (
    typeof error === "object" &&
    error !== null &&
    "data" in error &&
    typeof error.data === "object" &&
    error.data !== null &&
    "message" in error.data &&
    typeof error.data.message === "string"
  ) {
    return error.data.message;
  }

  return "Unable to post journal voucher.";
}
