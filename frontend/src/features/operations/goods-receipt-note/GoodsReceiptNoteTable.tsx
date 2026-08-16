import { useState } from "react";
import { useNavigate } from "react-router";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { Download, Eye, Loader2, Pencil, CheckCircle, XCircle } from "lucide-react";
import {
  GoodsReceiptNoteListItem,
  useDownloadGoodsReceiptNotePdfMutation,
  useUpdateGoodsReceiptNoteStatusMutation,
} from "@/redux/api/goodsReceiptNoteApi";
import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import ConfirmAlert from "@/shared/components/ui/alert/ConfirmAlert";

interface GoodsReceiptNoteTableProps {
  goodsReceipts: GoodsReceiptNoteListItem[];
  isLoading: boolean;
  isError: boolean;
}

export default function GoodsReceiptNoteTable({
  goodsReceipts,
  isLoading,
  isError,
}: GoodsReceiptNoteTableProps) {
  const fmtDate = useFmtDate();
  const navigate = useNavigate();
  const [downloadPdf] = useDownloadGoodsReceiptNotePdfMutation();
  const [updateStatus] = useUpdateGoodsReceiptNoteStatusMutation();

  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<{
    id: string;
    no: string;
    type: "submit" | "cancel";
  } | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleDownload = async (grn: GoodsReceiptNoteListItem) => {
    setDownloadingId(grn.id);
    try {
      const url = await downloadPdf(grn.id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `GRN-${grn.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleConfirm = async () => {
    if (!confirm) return;
    setIsConfirming(true);
    try {
      await updateStatus({
        id: confirm.id,
        status: confirm.type === "submit" ? "Submitted" : "Cancelled",
      }).unwrap();
    } finally {
      setIsConfirming(false);
      setConfirm(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-6 text-gray-500 dark:text-gray-400">
        Loading goods receipt notes...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error loading goods receipt notes.
      </div>
    );
  }

  return (
    <>
      <ConfirmAlert
        open={!!confirm}
        title={
          confirm?.type === "submit"
            ? `Submit ${confirm?.no}?`
            : `Cancel ${confirm?.no}?`
        }
        message={
          confirm?.type === "submit"
            ? "This will post inventory receipts and journal entries for this GRN."
            : "This will reverse all inventory and journal effects posted by this GRN."
        }
        confirmLabel={confirm?.type === "submit" ? "Submit" : "Cancel GRN"}
        isConfirming={isConfirming}
        onConfirm={handleConfirm}
        onCancel={() => setConfirm(null)}
      />

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="max-w-full overflow-x-auto">
          <div className="min-w-[1050px]">
            <Table>
              <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
                <TableRow>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">GRN No</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Date</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Vendor</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-end text-theme-xs font-medium text-gray-500 dark:text-gray-400">Net Total</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Status</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Created</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Updated</TableCell>
                  <TableCell isHeader className="px-5 py-3 text-start text-theme-xs font-medium text-gray-500 dark:text-gray-400">Actions</TableCell>
                </TableRow>
              </TableHeader>

              <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
                {goodsReceipts.map((grn) => (
                  <TableRow key={grn.id}>
                    <TableCell className="px-5 py-4 text-start text-theme-sm font-medium text-gray-800 dark:text-white/90">
                      {grn.no}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(grn.date)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {grn.vendorName}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-end text-theme-sm text-gray-500 dark:text-gray-400">
                      {grn.netTotal.toFixed(2)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm">
                      <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                        grn.status === "Draft"
                          ? "bg-warning-50 text-warning-700 dark:bg-warning-500/15 dark:text-warning-400"
                          : grn.status === "Submitted"
                            ? "bg-success-50 text-success-700 dark:bg-success-500/15 dark:text-success-400"
                            : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                      }`}>
                        {grn.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(grn.createdAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start text-theme-sm text-gray-500 dark:text-gray-400">
                      {fmtDate(grn.updatedAtUtc, true)}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-start">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          title="View"
                          onClick={() => navigate(`/operations/goods-receipt-note/${grn.id}`)}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-white/[0.08] dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          type="button"
                          title="Download PDF"
                          onClick={() => void handleDownload(grn)}
                          disabled={downloadingId === grn.id}
                          className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 disabled:opacity-50 dark:border-white/[0.08] dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                        >
                          {downloadingId === grn.id ? (
                            <Loader2 size={15} className="animate-spin" />
                          ) : (
                            <Download size={15} />
                          )}
                        </button>

                        {grn.status === "Draft" && (
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => navigate(`/operations/goods-receipt-note/${grn.id}/edit`)}
                            className="rounded-lg border border-gray-200 p-2 text-gray-500 hover:bg-gray-50 hover:text-gray-700 dark:border-white/[0.08] dark:text-gray-400 dark:hover:bg-white/[0.05] dark:hover:text-gray-200"
                          >
                            <Pencil size={15} />
                          </button>
                        )}

                        {grn.status === "Draft" && (
                          <button
                            type="button"
                            title="Submit"
                            onClick={() => setConfirm({ id: grn.id, no: grn.no, type: "submit" })}
                            className="rounded-lg border border-gray-200 p-2 text-green-600 hover:bg-green-50 hover:text-green-700 dark:border-white/[0.08] dark:text-green-400 dark:hover:bg-green-500/10 dark:hover:text-green-300"
                          >
                            <CheckCircle size={15} />
                          </button>
                        )}

                        {grn.status !== "Cancelled" && (
                          <button
                            type="button"
                            title="Cancel"
                            onClick={() => setConfirm({ id: grn.id, no: grn.no, type: "cancel" })}
                            className="rounded-lg border border-gray-200 p-2 text-red-500 hover:bg-red-50 hover:text-red-600 dark:border-white/[0.08] dark:text-red-400 dark:hover:bg-red-500/10 dark:hover:text-red-300"
                          >
                            <XCircle size={15} />
                          </button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>

        {goodsReceipts.length === 0 && (
          <div className="border-t border-gray-100 px-5 py-6 text-sm text-gray-500 dark:border-white/[0.05] dark:text-gray-400">
            No goods receipt notes yet. Use "Add +" to create the first one.
          </div>
        )}
      </div>
    </>
  );
}
