import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { getReconciliations } from "@/lib/queries";
import { fmtAED, fmtNumber, fmtDateTime } from "@/lib/format";

export default function Page() {
  const rows = getReconciliations();

  return (
    <div>
      <PageHeader title="Reconciliation" subtitle="Expected vs. received vs. missing items per customer, computed from live RFID counts." />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rows.map((r) => (
          <Card key={r.id}>
            <CardHeader title={r.customerName} subtitle={fmtDateTime(r.batchDate)} />
            <div className="px-5 pb-5">
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="bg-slate-50 rounded-lg py-3">
                  <p className="text-xs text-slate-500">Expected</p>
                  <p className="text-lg font-semibold text-slate-900 tabular-nums">{fmtNumber(r.expected)}</p>
                </div>
                <div className="bg-slate-50 rounded-lg py-3">
                  <p className="text-xs text-slate-500">Received</p>
                  <p className="text-lg font-semibold text-slate-900 tabular-nums">{fmtNumber(r.received)}</p>
                </div>
                <div className="bg-red-50 rounded-lg py-3">
                  <p className="text-xs text-red-500">Difference</p>
                  <p className="text-lg font-semibold text-red-600 tabular-nums">{fmtNumber(r.missingCount)}</p>
                </div>
              </div>
              <div className="flex justify-between text-sm border-t border-slate-100 pt-3">
                <span className="text-slate-500">Expected Value</span>
                <span className="font-medium text-slate-800">{fmtAED(r.expectedValue)}</span>
              </div>
              <div className="flex justify-between text-sm mt-1.5">
                <span className="text-slate-500">Missing Value</span>
                <span className="font-medium text-red-600">{fmtAED(r.missingValue)}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
