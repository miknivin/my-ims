import { useState } from "react";
import { useParams } from "react-router";
import { useGetGoodsReceiptNoteByIdQuery, useDownloadGoodsReceiptNotePdfMutation } from "@/redux/api/goodsReceiptNoteApi";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { ViewPageShell, ViewSection, ViewGrid, ViewField, StatusBadge, ViewTable, TH, TH_R, TD, TD_R, fmt } from "@/shared/components/view/TransactionView";
import Button from "@/shared/components/ui/button/Button";
import { Download, Loader2 } from "lucide-react";

export default function GoodsReceiptNoteViewPage() {
  const { id } = useParams<{ id: string }>();
  const fmtDate = useFmtDate();
  const { data, isLoading, isError } = useGetGoodsReceiptNoteByIdQuery(id ?? "", { skip: !id });
  const [downloadPdf] = useDownloadGoodsReceiptNotePdfMutation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const url = await downloadPdf(data.id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `GRN-${data.document.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ViewPageShell
      title="Goods Receipt Note"
      backPath="/operations/goods-receipt-note"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data}
      actions={
        data && (
          <Button type="button" variant="outline" onClick={handleDownload} disabled={downloading}>
            {downloading ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
            <span>PDF</span>
          </Button>
        )
      }
    >
      {data && (
        <>
          <ViewSection title="Document">
            <ViewGrid>
              <ViewField label="GRN No" value={data.document.no} strong />
              <ViewField label="Date" value={fmtDate(data.document.date)} />
              <ViewField label="Delivery Date" value={data.document.deliveryDate ? fmtDate(data.document.deliveryDate) : undefined} />
              <ViewField label="Mode" value={data.sourceRef.mode} />
              {data.sourceRef.purchaseOrderNo && <ViewField label="PO No" value={data.sourceRef.purchaseOrderNo} />}
              {data.sourceRef.directLpoNo && <ViewField label="Direct LPO No" value={data.sourceRef.directLpoNo} />}
              {data.sourceRef.directVendorInvoiceNo && <ViewField label="Vendor Invoice No" value={data.sourceRef.directVendorInvoiceNo} />}
            </ViewGrid>
            <div className="mt-3"><StatusBadge status={data.status} /></div>
          </ViewSection>

          <ViewSection title="Vendor">
            <ViewGrid>
              <ViewField label="Vendor" value={data.vendorInformation.vendorNameSnapshot} strong />
              <ViewField label="Address" value={data.vendorInformation.address} />
              <ViewField label="Attention" value={data.vendorInformation.attention} />
              <ViewField label="Phone" value={data.vendorInformation.phone} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Logistics">
            <ViewGrid>
              <ViewField label="LR Service" value={data.logistics.lrService} />
              <ViewField label="LR No" value={data.logistics.lrNo} />
              <ViewField label="LR Date" value={data.logistics.lrDate ? fmtDate(data.logistics.lrDate) : undefined} />
              <ViewField label="E-Way Bill No" value={data.logistics.eWayBillNo} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="General">
            <ViewGrid>
              <ViewField label="Taxable Mode" value={data.general.taxableMode} />
              <ViewField label="Own Products Only" value={data.general.ownProductsOnly ? "Yes" : "No"} />
            </ViewGrid>
            {data.general.notes && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Notes</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{data.general.notes}</p>
              </div>
            )}
          </ViewSection>

          <ViewSection title="Line Items" className="col-span-full">
            <ViewTable>
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className={TH}>#</th>
                  <th className={TH}>Item</th>
                  <th className={TH}>HSN</th>
                  <th className={TH}>Unit</th>
                  <th className={TH}>Warehouse</th>
                  <th className={TH_R}>Qty</th>
                  <th className={TH_R}>FOC</th>
                  <th className={TH_R}>Rate</th>
                  <th className={TH_R}>Gross</th>
                  <th className={TH_R}>Disc%</th>
                  <th className={TH_R}>Total</th>
                  <th className={TH}>Mfg Date</th>
                  <th className={TH}>Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className={TD}>{item.serialNo}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 min-w-[160px]">{item.productNameSnapshot}</td>
                    <td className={TD}>{item.hsnCode ?? "—"}</td>
                    <td className={TD}>{item.unitName}</td>
                    <td className={TD}>{item.warehouseName ?? "—"}</td>
                    <td className={TD_R}>{item.quantity}</td>
                    <td className={TD_R}>{item.focQuantity}</td>
                    <td className={TD_R}>{fmt(item.rate)}</td>
                    <td className={TD_R}>{fmt(item.grossAmount)}</td>
                    <td className={TD_R}>{item.discountPercent}%</td>
                    <td className={`${TD_R} font-semibold`}>{fmt(item.total)}</td>
                    <td className={TD}>{item.manufacturingDateUtc ? fmtDate(item.manufacturingDateUtc) : "—"}</td>
                    <td className={TD}>{item.expiryDateUtc ? fmtDate(item.expiryDateUtc) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </ViewTable>
          </ViewSection>

          <ViewSection title="Summary" className="col-span-full">
            <div className="flex justify-end">
              <dl className="w-full max-w-xs space-y-1.5">
                <SummaryRow label="Total Qty" value={String(data.footer.totalQty)} />
                <SummaryRow label="Total Amount" value={fmt(data.footer.totalAmount)} />
                <SummaryRow label="Addition" value={fmt(data.footer.addition)} />
                <SummaryRow label="Discount" value={fmt(data.footer.discountFooter)} />
                <SummaryRow label="Round Off" value={fmt(data.footer.roundOff)} />
                <SummaryRow label="Net Total" value={fmt(data.footer.netTotal)} bold />
              </dl>
            </div>
          </ViewSection>

          <ViewSection title="Timestamps" className="col-span-full">
            <ViewGrid>
              <ViewField label="Created" value={fmtDate(data.createdAtUtc, true)} />
              <ViewField label="Last Updated" value={fmtDate(data.updatedAtUtc, true)} />
            </ViewGrid>
          </ViewSection>
        </>
      )}
    </ViewPageShell>
  );
}

function SummaryRow({ label, value, bold = false }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className={`flex justify-between text-sm ${bold ? "border-t border-gray-200 pt-1.5 font-semibold text-gray-900 dark:border-gray-700 dark:text-white" : "text-gray-600 dark:text-gray-400"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
