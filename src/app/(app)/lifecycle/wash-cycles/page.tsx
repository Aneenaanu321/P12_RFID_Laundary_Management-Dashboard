import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { BarVertical, DonutChart, BarHorizontal } from "@/components/charts/Charts";
import { SearchableItemTypesTable } from "@/components/SearchableItemTypesTable";
import {
  getWashCycleDistribution, getLifecycleStatusCounts, getAvgCyclesByCustomer, getEolForecast, getItemTypes,
} from "@/lib/queries";

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
          <div className="px-3 pb-3"><BarVertical data={distribution} dataKey="c" nameKey="bucket" color="var(--status-blue)" /></div>
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
          <div className="px-3 pb-3"><BarVertical data={forecast} dataKey="count" nameKey="label" color="var(--status-amber)" /></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Wash Cycle Rules by Item Type" subtitle="Configurable thresholds — edit under Administration → Wash Cycle Rules" />
        <SearchableItemTypesTable itemTypes={itemTypes} mode="wash-rules" />
      </Card>
    </div>
  );
}
