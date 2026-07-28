import { useState } from "react";
import {
  DeliveryNoteListItem,
  useUpdateDeliveryNoteStatusMutation,
  useDownloadDeliveryNotePdfMutation,
} from "@/redux/api/deliveryNoteApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";

interface DeliveryNoteTableProps {
  deliveryNotes: DeliveryNoteListItem[];
  isLoading: boolean;
  isError: boolean;
}

function formatDate(value: string, includeTime = false) {
  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) return "-";

  return parsed.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...(includeTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

function statusBadgeClass(status: string) {
  if (status === "Draft")
    return "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400";
  if (status === "Submitted")
    return "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400";
  return "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300";
}

export default function DeliveryNoteTable({
  deliveryNotes,
  isLoading,
  isError,
}: DeliveryNoteTableProps) {
  const [updateStatus] = useUpdateDeliveryNoteStatusMutation();
  const [downloadPdf] = useDownloadDeliveryNotePdfMutation();
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    no: string;
    status: "Submitted" | "Cancelled";
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const handleDownload = async (dn: DeliveryNoteListItem) => {
    setDownloadingId(dn.id);
    try {
      const url = await downloadPdf(dn.id).unwrap();
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `DN-${dn.no}.pdf`;
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setActionError("Failed to download PDF.");
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirmedAction = async () => {
    if (!confirmAction) return;
    try {
      await updateStatus({
        id: confirmAction.id,
        status: confirmAction.status,
      }).unwrap();
    } catch {
      setActionError(
        `Failed to ${confirmAction.status === "Submitted" ? "submit" : "cancel"} delivery note.`,
      );
    } finally {
      setConfirmAction(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading delivery notes...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading delivery notes.
      </div>
    );
  }

  return (
    <>
      {confirmAction ? (
        <ConfirmAlert
          open
          title={
            confirmAction.status === "Submitted"
              ? "Submit delivery note?"
              : "Cancel delivery note?"
          }
          message={
            confirmAction.status === "Submitted"
              ? `Submit ${confirmAction.no}? This cannot be reversed to Draft.`
              : `Cancel ${confirmAction.no}? This action cannot be undone.`
          }
          confirmLabel={confirmAction.status === "Submitted" ? "Submit" : "Cancel DN"}
          isConfirming={false}
          onConfirm={() => void handleConfirmedAction()}
          onCancel={() => setConfirmAction(null)}
        />
      ) : null}

      {actionError ? (
        <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
          {actionError}
          <button
            type="button"
            className="ml-2 underline"
            onClick={() => setActionError(null)}
          >
            Dismiss
          </button>
        </div>
      ) : null}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1080px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">DN No</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Customer</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Net Total</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Created</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {deliveryNotes.map((dn) => (
                  <TableRow key={dn.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {dn.no}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dn.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {dn.customerName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {dn.netTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(dn.status)}`}
                      >
                        {dn.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {formatDate(dn.createdAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-1">
                        {/* Download PDF */}
                        <button
                          type="button"
                          title="Download PDF"
                          disabled={downloadingId === dn.id}
                          onClick={() => void handleDownload(dn)}
                          className="rounded-md p-1.5 text-gray-500 transition hover:bg-gray-100 disabled:opacity-50 dark:text-gray-400 dark:hover:bg-white/[0.06]"
                        >
                          {downloadingId === dn.id ? (
                            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                              <polyline points="14 2 14 8 20 8" />
                              <line x1="12" y1="11" x2="12" y2="17" />
                              <polyline points="9 14 12 17 15 14" />
                            </svg>
                          )}
                        </button>

                        {/* Submit */}
                        {dn.status === "Draft" ? (
                          <button
                            type="button"
                            title="Submit"
                            onClick={() => setConfirmAction({ id: dn.id, no: dn.no, status: "Submitted" })}
                            className="rounded-md p-1.5 text-green-600 transition hover:bg-green-50 dark:text-green-400 dark:hover:bg-green-500/10"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <polyline points="20 6 9 17 4 12" />
                            </svg>
                          </button>
                        ) : null}

                        {/* Cancel */}
                        {dn.status !== "Cancelled" ? (
                          <button
                            type="button"
                            title="Cancel"
                            onClick={() => setConfirmAction({ id: dn.id, no: dn.no, status: "Cancelled" })}
                            className="rounded-md p-1.5 text-red-500 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-500/10"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
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

        {deliveryNotes.length === 0 ? (
          <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
            No delivery notes yet. Use "Add +" to create the first one.
          </div>
        ) : null}
      </div>
    </>
  );
}
