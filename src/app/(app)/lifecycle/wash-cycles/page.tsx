import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { BarVertical, DonutChart, BarHorizontal } from "@/components/charts/Charts";
import {
  getWashCycleDistribution, getLifecycleStatusCounts, getAvgCyclesByCustomer, getEolForecast, getItemTypes,
} from "@/lib/queries";
import { fmtNumber } from "@/lib/format";

export default function Page() {
  const distribution = getWashCycleDistribution();
  const lifecycle = getLifecycleStatusCounts().map((l) => ({ ...l, name: l.lifecycleStatus.replace(/_/g, " ") }));
  const avgByCustomer = getAvgCyclesByCustomer().map((c) => ({ ...c, avgCycles: Math.round(c.avgCycles * 10) / 10 }));
  const forecast = getEolForecast();
  const itemTypes = getItemTypes();

  return (
    <div>
      <PageHeader title="Wash Cycle Management" subtitle="Monitor wash-cycle consumption against configurable per-item-type limits." />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Wash Cycle Distribution" subtitle="Share of active inventory by cycles used" />
          <div className="px-3 pb-3"><BarVertical data={distribution} dataKey="c" nameKey="bucket" color="#2563eb" /></div>
        </Card>
        <Card>
          <CardHeader title="Items by Lifecycle Status" />
          <div className="px-3 pb-3"><DonutChart data={lifecycle} dataKey="c" nameKey="name" /></div>
        </Card>
        <Card>
          <CardHeader title="Average Cycles by Customer" />
          <div className="px-3 pb-3"><BarHorizontal data={avgByCustomer} dataKey="avgCycles" nameKey="customerName" color="#0ea5a4" /></div>
        </Card>
        <Card>
          <CardHeader title="Items Reaching End of Life" subtitle="Projected by month, based on remaining cycles" />
          <div className="px-3 pb-3"><BarVertical data={forecast} dataKey="count" nameKey="label" color="#d97706" /></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Wash Cycle Rules by Item Type" subtitle="Configurable thresholds — edit under Administration → Wash Cycle Rules" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Item Type</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium">Max Wash Cycles</th>
                <th className="px-3 py-3 font-medium">Monitor Threshold</th>
                <th className="px-3 py-3 font-medium">Near EOL Threshold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {itemTypes.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{t.name}</td>
                  <td className="px-3 py-3 text-slate-500">{t.category}</td>
                  <td className="px-3 py-3 tabular-nums text-slate-700">{fmtNumber(t.maxWashCycles)}</td>
                  <td className="px-3 py-3 tabular-nums text-slate-500">{t.monitorThresholdPct}%</td>
                  <td className="px-3 py-3 tabular-nums text-slate-500">{t.nearEolThresholdPct}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
