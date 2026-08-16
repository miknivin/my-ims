import { useParams } from "react-router";
import { useGetSalesOrderByIdQuery } from "@/redux/api/salesOrderApi";
import { useFmtDate } from "@/shared/hooks/useFmtDate";
import { ViewPageShell, ViewSection, ViewGrid, ViewField, StatusBadge, ViewTable, TH, TH_R, TD, TD_R, fmt } from "@/shared/components/view/TransactionView";

export default function SalesOrderViewPage() {
  const { id } = useParams<{ id: string }>();
  const fmtDate = useFmtDate();
  const { data, isLoading, isError } = useGetSalesOrderByIdQuery(id ?? "", { skip: !id });

  return (
    <ViewPageShell
      title="Sales Order"
      backPath="/operations/sales-order"
      isLoading={isLoading}
      isError={isError}
      isEmpty={!data}
    >
      {data && (
        <>
          <ViewSection title="Order Details">
            <ViewGrid>
              <ViewField label="SO No" value={data.orderDetails.no} strong />
              <ViewField label="Date" value={fmtDate(data.orderDetails.date)} />
              <ViewField label="Delivery Date" value={data.orderDetails.deliveryDate ? fmtDate(data.orderDetails.deliveryDate) : undefined} />
              <ViewField label="Type" value={data.orderDetails.voucherType} />
            </ViewGrid>
            <div className="mt-3"><StatusBadge status={data.status} /></div>
          </ViewSection>

          <ViewSection title="Customer">
            <ViewGrid>
              <ViewField label="Customer" value={data.partyInformation.customerNameSnapshot} strong />
              <ViewField label="Code" value={data.partyInformation.customerCodeSnapshot} />
              <ViewField label="Address" value={data.partyInformation.address} />
              <ViewField label="Attention" value={data.partyInformation.attention} />
            </ViewGrid>
          </ViewSection>

          <ViewSection title="Commercial Details">
            <ViewGrid>
              <ViewField label="Rate Level" value={data.commercialDetails.rateLevel} />
              <ViewField label="Currency" value={data.commercialDetails.currencyCodeSnapshot} />
              <ViewField label="Credit Limit" value={data.commercialDetails.creditLimit != null ? fmt(data.commercialDetails.creditLimit) : undefined} />
              <ViewField label="Inter-State" value={data.commercialDetails.isInterState ? "Yes" : "No"} />
              <ViewField label="Tax Application" value={data.commercialDetails.taxApplication} />
              <ViewField label="Salesperson" value={data.salesDetails.salesManNameSnapshot} />
            </ViewGrid>
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
                    <td className={`${TD_R} font-semibold`}>{fmt(item.netAmount)}</td>
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
                <SummaryRow label="Freight" value={fmt(data.footer.freight)} />
                <SummaryRow label="Advance" value={fmt(data.footer.soAdvance)} />
                <SummaryRow label="Round Off" value={fmt(data.footer.roundOff)} />
                <SummaryRow label="Net Total" value={fmt(data.footer.netTotal)} bold />
                <SummaryRow label="Balance" value={fmt(data.footer.balance)} />
              </dl>
            </div>
            {data.footer.remarks && (
              <div className="mt-4 border-t border-gray-100 pt-4 dark:border-gray-800">
                <p className="text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Remarks</p>
                <p className="mt-1 text-sm text-gray-700 dark:text-gray-300">{data.footer.remarks}</p>
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
