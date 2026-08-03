import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { BarVertical, DonutChart } from "@/components/charts/Charts";
import { getWashCycleDistribution, getLifecycleStatusCounts, getEolForecast } from "@/lib/queries";

export default function Page() {
  const distribution = getWashCycleDistribution();
  const lifecycle = getLifecycleStatusCounts().map((l) => ({ ...l, name: l.lifecycleStatus.replace(/_/g, " ") }));
  const forecast = getEolForecast();

  return (
    <div>
      <PageHeader title="Lifecycle Analytics" subtitle="Wash-cycle wear and end-of-life forecasting across the fleet." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Wash Cycle Distribution" />
          <div className="px-3 pb-3"><BarVertical data={distribution} dataKey="c" nameKey="bucket" color="var(--status-blue)" /></div>
        </Card>
        <Card>
          <CardHeader title="Lifecycle Status Breakdown" />
          <div className="px-3 pb-3"><DonutChart data={lifecycle} dataKey="c" nameKey="name" /></div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="End-of-Life Forecast" subtitle="Projected disposals by month based on remaining wash cycles" />
          <div className="px-3 pb-3"><BarVertical data={forecast} dataKey="count" nameKey="label" color="var(--status-amber)" /></div>
        </Card>
      </div>
    </div>
  );
}
