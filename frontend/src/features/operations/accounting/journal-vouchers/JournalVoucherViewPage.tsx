import { useNavigate, useParams } from "react-router";
import { useGetJournalVoucherByIdQuery } from "@/redux/api/journalVoucherApi";
import PageBreadcrumb from "@/shared/components/common/PageBreadCrumb";
import Button from "@/shared/components/ui/button/Button";

export default function JournalVoucherViewPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data, isLoading, isError } = useGetJournalVoucherByIdQuery(id ?? "", {
    skip: !id,
  });

  return (
    <div className="w-full space-y-5">
      <PageBreadcrumb pageTitle="Journal Voucher" />

      <div className="flex justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => navigate("/operations/accounting/journal-vouchers")}
        >
          Back
        </Button>
      </div>

      {isLoading ? (
        <StateCard message="Loading journal voucher..." />
      ) : isError || !data ? (
        <StateCard message="Unable to load journal voucher." isError />
      ) : (
        <>
          <section className="rounded-lg border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03]">
            <div
              className="grid gap-4"
              style={{
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(min(100%, 220px), 1fr))",
              }}
            >
              <InfoItem label="Voucher No" value={data.voucherNo} strong />
              <InfoItem label="Posting Date" value={data.postingDate} />
              <InfoItem label="Source" value={data.source} />
              <InfoItem label="Status" value={data.status} />
            </div>
            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-gray-800">
              <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
                Narration
              </p>
              <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                {data.narration || "-"}
              </p>
            </div>
          </section>

          <section className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03]">
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50 dark:bg-white/[0.02]">
                  <tr>
                    {["Line", "Ledger", "Debit", "Credit"].map((header) => (
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
                  {data.entries.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        No journal lines found.
                      </td>
                    </tr>
                  ) : (
                    data.entries.map((entry) => (
                      <tr key={entry.id}>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          {entry.lineNo}
                        </td>
                        <td className="min-w-72 px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                          <span className="font-medium text-gray-900 dark:text-white">
                            {entry.ledgerName}
                          </span>
                          {entry.ledgerCode ? (
                            <span className="ml-2 text-xs text-gray-400">
                              {entry.ledgerCode}
                            </span>
                          ) : null}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                          {formatAmount(entry.debitAmount)}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right text-sm text-gray-700 dark:text-gray-300">
                          {formatAmount(entry.creditAmount)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
                <tfoot className="border-t border-gray-200 bg-gray-50 dark:border-gray-800 dark:bg-white/[0.03]">
                  <tr>
                    <td
                      colSpan={2}
                      className="px-4 py-3 text-sm font-semibold text-gray-900 dark:text-white"
                    >
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatAmount(data.totalDebit)}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">
                      {formatAmount(data.totalCredit)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>
        </>
      )}
    </div>
  );
}

function InfoItem({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase text-gray-500 dark:text-gray-400">
        {label}
      </p>
      <p
        className={`mt-1 text-sm ${
          strong
            ? "font-semibold text-gray-900 dark:text-white"
            : "text-gray-700 dark:text-gray-300"
        }`}
      >
        {value || "-"}
      </p>
    </div>
  );
}

function StateCard({
  message,
  isError = false,
}: {
  message: string;
  isError?: boolean;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white px-4 py-10 text-center dark:border-gray-800 dark:bg-white/[0.03]">
      <p className={`text-sm ${isError ? "text-error-500" : "text-gray-500 dark:text-gray-400"}`}>
        {message}
      </p>
    </div>
  );
}

function formatAmount(value: number) {
  return value.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
