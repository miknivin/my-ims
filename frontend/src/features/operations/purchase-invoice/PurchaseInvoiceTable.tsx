import { useState } from "react";
import { useNavigate } from "react-router";
import { CheckCircle, Download, Eye, Loader2, XCircle } from "lucide-react";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import {
  PurchaseInvoiceListItem,
  useDownloadPurchaseInvoicePdfMutation,
  useUpdatePurchaseInvoiceStatusMutation,
} from "@/redux/api/purchaseInvoiceApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";

interface PurchaseInvoiceTableProps {
  purchaseInvoices: PurchaseInvoiceListItem[];
  isLoading: boolean;
  isError: boolean;
}

export default function PurchaseInvoiceTable({
  purchaseInvoices,
  isLoading,
  isError,
}: PurchaseInvoiceTableProps) {
  const fmtDate = useFmtDate();
  const navigate = useNavigate();
  const [updateStatus] = useUpdatePurchaseInvoiceStatusMutation();
  const [downloadPdf] = useDownloadPurchaseInvoicePdfMutation();
  const [actionId, setActionId] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
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
      a.download = `PI-${no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setActionId(confirm.id);
    setConfirm(null);
    try {
      await updateStatus({
        id: confirm.id,
        status: confirm.type === "submit" ? "Submitted" : "Cancelled",
      });
    } finally {
      setActionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading purchase invoices...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading purchase invoices.
      </div>
    );
  }

  return (
    <>
      <ConfirmAlert
        open={confirm !== null}
        title={
          confirm?.type === "submit"
            ? "Create purchase invoice?"
            : "Cancel purchase invoice?"
        }
        message={
          confirm?.type === "submit"
            ? `This will submit ${confirm?.no} and post the related inventory and journal effects.`
            : `This will cancel ${confirm?.no} and reverse the posted journal entries.`
        }
        confirmLabel={confirm?.type === "submit" ? "Create" : "Cancel Invoice"}
        isConfirming={actionId === confirm?.id}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[980px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    PI No
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Date
                  </TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">
                    Vendor
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
                    Action
                  </TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {purchaseInvoices.map((pi) => (
                  <TableRow key={pi.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {pi.no}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(pi.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {pi.vendorName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {pi.netTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                          pi.status === "Draft" || pi.status === "Pending"
                            ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
                            : pi.status === "Submitted" || pi.status === "Completed"
                              ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                              : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                        }`}
                      >
                        {pi.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(pi.createdAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(pi.updatedAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          title="View"
                          onClick={() => navigate(`/operations/purchase-invoice/${pi.id}`)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownload(pi.id, pi.no)}
                          disabled={downloadingId === pi.id}
                          aria-label="Download PDF"
                          title="Download PDF"
                          className="rounded-lg border border-gray-200 p-2 text-gray-600 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-300 dark:hover:bg-white/[0.05]"
                        >
                          {downloadingId === pi.id ? (
                            <Loader2 size={14} className="animate-spin" />
                          ) : (
                            <Download size={14} />
                          )}
                        </button>
                        {pi.status === "Draft" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({ id: pi.id, no: pi.no, type: "submit" })
                            }
                            disabled={actionId === pi.id}
                            aria-label="Submit"
                            title="Submit"
                            className="rounded-lg border border-green-200 p-2 text-green-600 transition hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-green-500/30 dark:text-green-400 dark:hover:bg-green-500/10"
                          >
                            {actionId === pi.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <CheckCircle size={14} />
                            )}
                          </button>
                        ) : null}
                        {pi.status === "Submitted" ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirm({ id: pi.id, no: pi.no, type: "cancel" })
                            }
                            disabled={actionId === pi.id}
                            aria-label="Cancel"
                            title="Cancel Invoice"
                            className="rounded-lg border border-red-200 p-2 text-red-600 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-red-500/30 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            {actionId === pi.id ? (
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

        {purchaseInvoices.length === 0 ? (
          <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
            No purchase invoices yet. Use "Add +" to create the first one.
          </div>
        ) : null}
      </div>
    </>
  );
}
