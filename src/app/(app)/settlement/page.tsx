import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { getSettlements, getSettlementLines, getCustomers } from "@/lib/queries";
import { fmtAED, fmtNumber } from "@/lib/format";
import { Download, Printer } from "lucide-react";

export default async function Page({ searchParams }: { searchParams: Promise<{ customerId?: string }> }) {
  const { customerId } = await searchParams;
  const settlements = getSettlements();
  const customers = getCustomers();
  const active = customerId ? settlements.find((s) => s.customerId === customerId) : settlements[0];
  const lines = active ? getSettlementLines(active.id) : [];

  const subtotal = lines.reduce((s, l) => s + l.amount, 0);
  const lossCharges = lines.reduce((s, l) => s + l.missing * (l.pricePerCycle * 15), 0);
  const laundryCharges = subtotal * 0.03;
  const finalTotal = subtotal + lossCharges + laundryCharges;

  return (
    <div>
      <PageHeader
        title="Settlement"
        subtitle="Itemized customer / laundry settlement generated from actual RFID-tracked transactions."
        action={active && (
          <div className="flex gap-2">
            <a href={`/api/settlement/export?customerId=${active.customerId}&format=xlsx`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Download size={14} /> Excel
            </a>
            <a href={`/api/settlement/export?customerId=${active.customerId}&format=pdf`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50">
              <Download size={14} /> PDF
            </a>
            <a href={`/api/settlement/export?customerId=${active.customerId}&format=pdf`} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg bg-blue-600 text-white hover:bg-blue-700">
              <Printer size={14} /> Print
            </a>
          </div>
        )}
      />

      <div className="flex flex-wrap gap-2 mb-6">
        {customers.map((c) => (
          <a
            key={c.id}
            href={`/settlement?customerId=${c.id}`}
            className={`px-3 py-1.5 text-sm rounded-lg border ${active?.customerId === c.id ? "bg-blue-600 border-blue-600 text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}
          >
            {c.name}
          </a>
        ))}
      </div>

      {active ? (
        <Card>
          <CardHeader title={active.customerName} subtitle={`Settlement period: ${active.periodLabel}`} />
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3 font-medium">Item Type</th>
                  <th className="px-3 py-3 font-medium">Sent</th>
                  <th className="px-3 py-3 font-medium">Returned</th>
                  <th className="px-3 py-3 font-medium">Missing</th>
                  <th className="px-3 py-3 font-medium">Wash Cycles</th>
                  <th className="px-3 py-3 font-medium">Price / Cycle</th>
                  <th className="px-3 py-3 font-medium">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <td className="px-5 py-3 font-medium text-slate-800">{l.itemTypeName}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{fmtNumber(l.sent)}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{fmtNumber(l.returned)}</td>
                    <td className="px-3 py-3 tabular-nums text-red-600">{fmtNumber(l.missing)}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{fmtNumber(l.washCycles)}</td>
                    <td className="px-3 py-3 tabular-nums text-slate-600">{fmtAED(l.pricePerCycle)}</td>
                    <td className="px-3 py-3 tabular-nums font-medium text-slate-900">{fmtAED(l.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-4 border-t border-slate-200 ml-auto max-w-xs space-y-1.5 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">Subtotal</span><span className="font-medium">{fmtAED(subtotal)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Loss Charges</span><span className="font-medium text-red-600">{fmtAED(lossCharges)}</span></div>
            <div className="flex justify-between"><span className="text-slate-500">Laundry Charges</span><span className="font-medium">{fmtAED(laundryCharges)}</span></div>
            <div className="flex justify-between text-base pt-1.5 border-t border-slate-200"><span className="font-semibold text-slate-800">Final Settlement</span><span className="font-semibold text-slate-900">{fmtAED(finalTotal)}</span></div>
          </div>
        </Card>
      ) : (
        <Card><p className="p-6 text-sm text-slate-500">No settlement data available.</p></Card>
      )}
    </div>
  );
}
