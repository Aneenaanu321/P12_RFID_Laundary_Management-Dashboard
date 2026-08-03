import { Package } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { TrendAreaChart, DonutChart, BarHorizontal } from "@/components/charts/LazyCharts";
import { getSnapshotSeries, shiftDate, getKpis, getCustomers } from "@/lib/queries";
import { parseDashboardFilters, resolveDateWindow } from "@/lib/dashboard-filters";
import { appendLinearForecast } from "@/lib/kpi";
import { detectSeriesSpikes } from "@/lib/chart-utils";

export async function DashboardCharts({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseDashboardFilters(searchParams);
  const window = resolveDateWindow(filters);
  const currentSeries = getSnapshotSeries({ from: window.from, to: window.to });
  const { today } = getKpis(filters.type);
  const customers = getCustomers(filters.type);

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
      lossValuePrev: previousSeries[i]?.lossValue ?? null,
    }));
  }

  const inventorySeries = appendLinearForecast(series, "totalItems", "dateLabel", 7);
  const missingSeries = appendLinearForecast(series, "missing", "dateLabel", 7);
  const lossSeries = appendLinearForecast(series, "lossValue", "dateLabel", 7);

  const missingMarkers = detectSeriesSpikes(series, "missing", "dateLabel", {
    href: "/loss/analytics",
  });

  const statusMix = [
    { name: "With Customer", c: Number(today?.withCustomers ?? 0) },
    { name: "In Laundry", c: Number(today?.inLaundry ?? 0) },
    { name: "Ready", c: Number(today?.ready ?? 0) },
    { name: "Missing", c: Number(today?.missing ?? 0) },
    { name: "Near EOL", c: Number(today?.nearEol ?? 0) },
  ].filter((r) => r.c > 0);

  const topMissing = customers
    .map((c) => ({
      customerName: c.name,
      c: Number(c.missing ?? 0),
    }))
    .filter((r) => r.c > 0)
    .sort((a, b) => b.c - a.c)
    .slice(0, 5);

  const chartSubtitle = filters.compare
    ? `${window.label} · vs previous period · +7d forecast`
    : `${window.label} · +7d forecast`;

  const empty = series.length === 0;

  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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
                data={inventorySeries}
                dataKey="totalItems"
                xKey="dateLabel"
                tone="primary"
                compareKey={filters.compare ? "totalItemsPrev" : undefined}
                forecastKey="totalItemsForecast"
                filename="inventory-trend"
                ariaLabel="Inventory trend over the selected date range with forecast"
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
                data={missingSeries}
                dataKey="missing"
                xKey="dateLabel"
                tone="danger"
                height={220}
                compareKey={filters.compare ? "missingPrev" : undefined}
                forecastKey="missingForecast"
                markers={missingMarkers}
                filename="missing-trend"
                ariaLabel="Missing items trend over the selected date range with forecast"
              />
            )}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="dash-enter-slow [animation-delay:160ms]">
          <CardHeader title="Loss Value Trend" subtitle={chartSubtitle} />
          <div className="px-3 pb-3">
            {empty ? (
              <EmptyState
                title="No loss-value history"
                subtitle="Value at risk trends appear after inventory snapshots."
              />
            ) : (
              <TrendAreaChart
                data={lossSeries}
                dataKey="lossValue"
                xKey="dateLabel"
                tone="amber"
                height={220}
                compareKey={filters.compare ? "lossValuePrev" : undefined}
                forecastKey="lossValueForecast"
                filename="loss-value-trend"
                ariaLabel="Inventory loss value trend over the selected date range with forecast"
              />
            )}
          </div>
        </Card>

        <Card className="dash-enter-slow [animation-delay:180ms]">
          <CardHeader title="Item Status Mix" subtitle="Current fleet distribution" />
          <div className="px-3 pb-3">
            {statusMix.length === 0 ? (
              <EmptyState title="No status data" subtitle="Status mix appears once items are registered." />
            ) : (
              <DonutChart
                data={statusMix}
                dataKey="c"
                nameKey="name"
                height={220}
                filename="status-mix"
                ariaLabel="Item status mix donut chart"
              />
            )}
          </div>
        </Card>

        <Card className="dash-enter-slow [animation-delay:200ms]">
          <CardHeader title="Top Missing by Customer" subtitle="Highest missing-item counts" />
          <div className="px-3 pb-3">
            {topMissing.length === 0 ? (
              <EmptyState title="No missing items" subtitle="Customers with missing stock will appear here." />
            ) : (
              <BarHorizontal
                data={topMissing}
                dataKey="c"
                nameKey="customerName"
                color="var(--status-red)"
                height={220}
                filename="top-missing-customers"
                ariaLabel="Top five customers by missing items"
              />
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
