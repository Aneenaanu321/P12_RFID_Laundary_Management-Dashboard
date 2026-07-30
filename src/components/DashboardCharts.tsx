import { Package } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendAreaChart } from "@/components/charts/Charts";
import { getSnapshotSeries, shiftDate } from "@/lib/queries";
import { parseDashboardFilters, resolveDateWindow } from "@/lib/dashboard-filters";

export async function DashboardCharts({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseDashboardFilters(searchParams);
  const window = resolveDateWindow(filters);
  const currentSeries = getSnapshotSeries({ from: window.from, to: window.to });

  let series = currentSeries.map((s) => ({ ...s, dateLabel: String(s.date).slice(5) }));

  if (filters.compare) {
    const prevTo = shiftDate(window.from, -1);
    const prevFrom = shiftDate(prevTo, -(window.days - 1));
    const previousSeries = getSnapshotSeries({ from: prevFrom, to: prevTo });
    series = currentSeries.map((s, i) => ({
      ...s,
      dateLabel: String(s.date).slice(5),
      totalItemsPrev: previousSeries[i]?.totalItems ?? null,
      missingPrev: previousSeries[i]?.missing ?? null,
    }));
  }

  const chartSubtitle = filters.compare
    ? `${window.label} · vs previous period`
    : window.label;

  const empty = series.length === 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <Card className="lg:col-span-2 dash-enter-slow [animation-delay:80ms]">
        <CardHeader title="Inventory & Loss Trend" subtitle={chartSubtitle} />
        <div className="px-3 pb-3">
          {empty ? (
            <EmptyState
              icon={Package}
              title="No trend data yet"
              subtitle="Snapshots will appear here once inventory activity is recorded."
            />
          ) : (
            <TrendAreaChart
              data={series}
              dataKey="totalItems"
              xKey="dateLabel"
              tone="primary"
              compareKey={filters.compare ? "totalItemsPrev" : undefined}
            />
          )}
        </div>
      </Card>
      <Card className="dash-enter-slow [animation-delay:140ms]">
        <CardHeader title="Missing Items Trend" subtitle={chartSubtitle} />
        <div className="px-3 pb-3">
          {empty ? (
            <EmptyState
              title="No missing-item history"
              subtitle="Trends show up after the first inventory snapshots."
            />
          ) : (
            <TrendAreaChart
              data={series}
              dataKey="missing"
              xKey="dateLabel"
              tone="danger"
              height={220}
              compareKey={filters.compare ? "missingPrev" : undefined}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
