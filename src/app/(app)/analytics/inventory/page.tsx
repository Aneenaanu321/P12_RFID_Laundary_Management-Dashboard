import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { BarHorizontal, DonutChart, TrendAreaChart } from "@/components/charts/Charts";
import { getInventoryValueByCustomer, getInventoryValueByItemType, getItemTypeDistribution, getSnapshotSeries } from "@/lib/queries";

export default function Page() {
  const byCustomer = getInventoryValueByCustomer();
  const byType = getInventoryValueByItemType();
  const distribution = getItemTypeDistribution();
  const series = getSnapshotSeries(30).map((s) => ({ ...s, dateLabel: String(s.date).slice(5) }));

  return (
    <div>
      <PageHeader title="Inventory Analytics" subtitle="Where inventory value sits across customers and item types." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Inventory Value by Customer" />
          <div className="px-3 pb-3"><BarHorizontal data={byCustomer} dataKey="v" nameKey="customerName" color="#2563eb" /></div>
        </Card>
        <Card>
          <CardHeader title="Inventory Value by Item Type" />
          <div className="px-3 pb-3"><BarHorizontal data={byType} dataKey="v" nameKey="itemTypeName" color="#0ea5a4" /></div>
        </Card>
        <Card>
          <CardHeader title="Item Type Distribution" />
          <div className="px-3 pb-3"><DonutChart data={distribution} dataKey="c" nameKey="itemTypeName" /></div>
        </Card>
        <Card>
          <CardHeader title="Inventory Value Trend" subtitle="Last 30 days" />
          <div className="px-3 pb-3"><TrendAreaChart data={series} dataKey="inventoryValue" xKey="dateLabel" color="#2563eb" /></div>
        </Card>
      </div>
    </div>
  );
}
