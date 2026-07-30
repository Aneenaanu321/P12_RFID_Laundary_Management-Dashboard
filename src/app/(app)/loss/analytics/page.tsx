import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";
import { TrendAreaChart, BarHorizontal } from "@/components/charts/Charts";
import { getLossKpis, getMissingByLocation, getSnapshotSeries } from "@/lib/queries";
import { fmtAED, fmtNumber, fmtPct } from "@/lib/format";
import { TrendingDown, Coins, ArrowDownRight } from "lucide-react";

export default function Page() {
  const kpis = getLossKpis();
  const byLocation = getMissingByLocation().slice(0, 8);
  const series = getSnapshotSeries(90).map((s) => ({ ...s, dateLabel: String(s.date).slice(5) }));
  const previousYear = Math.round(kpis.annualLossTowels * 1.12);
  const improvement = ((previousYear - kpis.annualLossTowels) / previousYear) * 100;

  return (
    <div>
      <PageHeader title="Loss Analytics" subtitle="Organization-wide loss trends and the branches driving them." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={TrendingDown} label="Annual Towel Loss" value={fmtNumber(kpis.annualLossTowels)} tone="red" />
        <KpiCard icon={Coins} label="Estimated Cost" value={fmtAED(kpis.annualLossTowels * 25)} tone="amber" />
        <KpiCard icon={TrendingDown} label="Previous Year" value={fmtNumber(previousYear)} tone="slate" />
        <KpiCard icon={ArrowDownRight} label="Improvement" value={fmtPct(improvement)} tone="green" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Monthly Loss Trend" subtitle="Last 90 days, inventory value at risk" />
          <div className="px-3 pb-3"><TrendAreaChart data={series} dataKey="lossValue" xKey="dateLabel" color="#dc2626" /></div>
        </Card>
        <Card>
          <CardHeader title="Highest-Loss Locations" />
          <div className="px-3 pb-3"><BarHorizontal data={byLocation} dataKey="c" nameKey="locationName" color="#d97706" /></div>
        </Card>
      </div>
    </div>
  );
}
