import { useState } from "react";
import { CheckCircle, Download, Loader2, XCircle } from "lucide-react";
import {
  SalesInvoiceListItem,
  useDownloadSalesInvoicePdfMutation,
  useUpdateSalesInvoiceStatusMutation,
} from "@/redux/api/salesInvoiceApi";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";

interface SalesInvoiceTableProps {
  salesInvoices: SalesInvoiceListItem[];
  isLoading: boolean;
  isError: boolean;
}

function formatDate(value: string, includeTime = false) {
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

export default function SalesInvoiceTable({
  salesInvoices,
  isLoading,
  isError,
}: SalesInvoiceTableProps) {
  const [downloadPdf] = useDownloadSalesInvoicePdfMutation();
  const [updateStatus] = useUpdateSalesInvoiceStatusMutation();
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [actionId, setActionId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    no: string;
    type: "submit" | "cancel";
  } | null>(null);

  const handleDownload = async (id: string, no: string) => {
    setDownloadingId(id);
    try {
      const url = await downloadPdf(id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `SI-${no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setActionId(confirm.id);
    try {
      await updateStatus({
        id: confirm.id,
        status: confirm.type === "submit" ? "Submitted" : "Cancelled",
      }).unwrap();
    } finally {
      setActionId(null);
      setConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading sales invoices...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading sales invoices.
      </div>
    );
  }

  return (
    <>
      <ConfirmAlert
        open={!!confirm}
        title={
          confirm?.type === "submit"
            ? `Submit SI ${confirm?.no}?`
            : `Cancel SI ${confirm?.no}?`
        }
        message={
          confirm?.type === "submit"
            ? "This will post inventory and journal effects for this sales invoice."
            : "This will reverse inventory and journal effects. This cannot be undone."
        }
        confirmLabel={confirm?.type === "submit" ? "Submit" : "Cancel Invoice"}
        isConfirming={!!actionId}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1080px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    SI No
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Customer
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Net Total
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Created
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Updated
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {salesInvoices.map((salesInvoice) => (
                  <TableRow key={salesInvoice.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {salesInvoice.no}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(salesInvoice.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {salesInvoice.customerName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {salesInvoice.netTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          salesInvoice.status === "Draft"
                            ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
                            : salesInvoice.status === "Submitted"
                              ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {salesInvoice.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(salesInvoice.createdAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(salesInvoice.updatedAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="Download PDF"
                          disabled={downloadingId === salesInvoice.id}
                          onClick={() => handleDownload(salesInvoice.id, salesInvoice.no)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          {downloadingId === salesInvoice.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
                        {salesInvoice.status === "Draft" ? (
                          <button
                            type="button"
                            title="Submit"
                            disabled={actionId === salesInvoice.id}
                            onClick={() =>
                              setConfirm({ id: salesInvoice.id, no: salesInvoice.no, type: "submit" })
                            }
                            className="rounded-lg border border-green-200 p-2 text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10"
                          >
                            {actionId === salesInvoice.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </button>
                        ) : null}
                        {salesInvoice.status === "Submitted" ? (
                          <button
                            type="button"
                            title="Cancel Invoice"
                            disabled={actionId === salesInvoice.id}
                            onClick={() =>
                              setConfirm({ id: salesInvoice.id, no: salesInvoice.no, type: "cancel" })
                            }
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            {actionId === salesInvoice.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <XCircle size={14} />
                            )}
                          </button>
                        ) : null}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {salesInvoices.length === 0 ? (
          <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
            No sales invoices yet. Use "Add +" to create the first one.
          </div>
        ) : null}
      </div>
    </>
  );
}
