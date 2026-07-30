import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { TrendAreaChart, MultiLineChart, BarVertical } from "@/components/charts/Charts";
import { getSnapshotSeries, getProcessFlow } from "@/lib/queries";

export default function Page() {
  const series = getSnapshotSeries(60).map((s) => ({ ...s, dateLabel: String(s.date).slice(5) }));
  const stages = getProcessFlow();

  return (
    <div>
      <PageHeader title="Laundry Analytics" subtitle="Processing volume and throughput across the wash pipeline." />
      <div className="grid grid-cols-1 gap-6">
        <Card>
          <CardHeader title="Laundry Processing Volume" subtitle="Items processed per day — last 60 days" />
          <div className="px-3 pb-3"><TrendAreaChart data={series} dataKey="laundryProcessed" xKey="dateLabel" color="#2563eb" height={260} /></div>
        </Card>
        <Card>
          <CardHeader title="Laundry Throughput vs. Reader Activity" />
          <div className="px-3 pb-3">
            <MultiLineChart
              data={series}
              xKey="dateLabel"
              lines={[
                { key: "laundryProcessed", color: "#2563eb", name: "Items Processed" },
                { key: "inLaundry", color: "#0ea5a4", name: "In Laundry" },
              ]}
              height={260}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Items by Pipeline Stage" />
          <div className="px-3 pb-3"><BarVertical data={stages} dataKey="count" nameKey="label" color="#2563eb" /></div>
        </Card>
      </div>
    </div>
  );
}
