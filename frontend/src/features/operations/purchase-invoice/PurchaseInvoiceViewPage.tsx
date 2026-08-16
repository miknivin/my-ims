import { useParams } from "react-router";
import { useGetPurchaseInvoiceByIdQuery, useDownloadPurchaseInvoicePdfMutation } from "@/redux/api/purchaseInvoiceApi";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { ViewPageShell, ViewSection, ViewGrid, ViewField, StatusBadge, ViewTable, TH, TH_R, TD, TD_R, fmt } from "@/shared/components/view/TransactionView";
import Button from "@/shared/components/ui/button/Button";
import { Download, Loader2 } from "lucide-react";
import { useState } from "react";

export default function PurchaseInvoiceViewPage() {
  const { id } = useParams<{ id: string }>();
  const fmtDate = useFmtDate();
  const { data, isLoading, isError } = useGetPurchaseInvoiceByIdQuery(id ?? "", { skip: !id });
  const [downloadPdf] = useDownloadPurchaseInvoicePdfMutation();
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const url = await downloadPdf(data.id).unwrap();
      const a = document.createElement("a");
      a.href = url;
      a.download = `PI-${data.document.no}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <ViewPageShell
      title="Purchase Invoice"
      backPath="/operations/purchase-invoice"
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
              <ViewField label="PI No" value={data.document.no} strong />
              <ViewField label="Date" value={fmtDate(data.document.date)} />
              <ViewField label="Due Date" value={fmtDate(data.document.dueDate)} />
            </ViewGrid>
            <div className="mt-3"><StatusBadge status={data.status} /></div>
          </ViewSection>

          <ViewSection title="Source Reference">
            <ViewGrid>
              <ViewField label="Type" value={data.sourceRef.type} />
              <ViewField label="Reference No" value={data.sourceRef.referenceNo} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Vendor">
            <ViewGrid>
              <ViewField label="Vendor" value={data.vendorInformation.vendorNameSnapshot} strong />
              <ViewField label="Address" value={data.vendorInformation.address} />
              <ViewField label="Attention" value={data.vendorInformation.attention} />
              <ViewField label="Phone" value={data.vendorInformation.phone} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Financial Details">
            <ViewGrid>
              <ViewField label="Payment Mode" value={data.financialDetails.paymentMode} />
              <ViewField label="Supplier Invoice No" value={data.financialDetails.supplierInvoiceNo} />
              <ViewField label="LR No" value={data.financialDetails.lrNo} />
              <ViewField label="Currency" value={data.financialDetails.currencyCodeSnapshot} />
              <ViewField label="Taxable" value={data.general.taxable ? "Yes" : "No"} />
              <ViewField label="Tax Application" value={data.general.taxApplication} />
              <ViewField label="Inter-State" value={data.general.interState ? "Yes" : "No"} />
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
                  <th className={TH_R}>Tax%</th>
                  <th className={TH_R}>Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {data.items.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02]">
                    <td className={TD}>{item.sno}</td>
                    <td className="px-3 py-2.5 text-sm text-gray-700 dark:text-gray-300 min-w-[160px]">{item.productNameSnapshot}</td>
                    <td className={TD}>{item.hsnCode ?? "—"}</td>
                    <td className={TD}>{item.unitName}</td>
                    <td className={TD}>{item.warehouseName ?? "—"}</td>
                    <td className={TD_R}>{item.quantity}</td>
                    <td className={TD_R}>{item.foc}</td>
                    <td className={TD_R}>{fmt(item.rate)}</td>
                    <td className={TD_R}>{fmt(item.grossAmount)}</td>
                    <td className={TD_R}>{item.discountPercent}%</td>
                    <td className={TD_R}>{item.taxPercent}%</td>
                    <td className={`${TD_R} font-semibold`}>{fmt(item.lineTotal)}</td>
                  </tr>
                ))}
              </tbody>
            </ViewTable>
          </ViewSection>

          {data.additions.length > 0 && (
            <ViewSection title="Additions / Deductions" className="col-span-full">
              <ViewTable>
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className={TH}>Type</th>
                    <th className={TH}>Ledger</th>
                    <th className={TH}>Description</th>
                    <th className={TH_R}>Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                  {data.additions.map((a) => (
                    <tr key={a.id}>
                      <td className={TD}>{a.type}</td>
                      <td className={TD}>{a.ledgerNameSnapshot}</td>
                      <td className={TD}>{a.description ?? "—"}</td>
                      <td className={TD_R}>{fmt(a.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </ViewTable>
            </ViewSection>
          )}

          <ViewSection title="Summary" className="col-span-full">
            <div className="flex justify-end">
              <dl className="w-full max-w-xs space-y-1.5">
                <SummaryRow label="Total" value={fmt(data.footer.total)} />
                <SummaryRow label="Discount" value={fmt(data.footer.discount)} />
                <SummaryRow label="Addition" value={fmt(data.footer.addition)} />
                <SummaryRow label="Deduction" value={fmt(data.footer.deduction)} />
                <SummaryRow label="Net Total" value={fmt(data.footer.netTotal)} bold />
              </dl>
            </div>
            {data.footer.notes && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Footer Notes</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{data.footer.notes}</p>
              </div>
            )}
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
