import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { CustomerOverviewTable } from "@/components/CustomerOverviewTable";
import { DashboardFilters } from "@/components/DashboardFilters";
import { Card, CardHeader } from "@/components/ui/Card";
import { TrendAreaChart } from "@/components/charts/Charts";
import {
  getKpis, getSnapshotSeries, getCustomers, shiftDate,
} from "@/lib/queries";
import { parseDashboardFilters, resolveDateWindow, CUSTOMER_TYPES } from "@/lib/dashboard-filters";
import { fmtAED, fmtNumber, fmtPct } from "@/lib/format";
import {
  Package, Users, WashingMachine, CheckCircle2, AlertTriangle, Clock3, XOctagon, Coins,
} from "lucide-react";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseDashboardFilters(sp);
  const window = resolveDateWindow(filters);

  const { today, delta } = getKpis(filters.type);
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

  const customers = getCustomers(filters.type);
  const typeLabel = CUSTOMER_TYPES.find((t) => t.value === filters.type)?.label;
  const chartSubtitle = filters.compare
    ? `${window.label} · vs previous period`
    : window.label;

  const withCustomerPct = today && Number(today.totalItems)
    ? (Number(today.withCustomers) / Number(today.totalItems)) * 100
    : 0;
  const inLaundryPct = today && Number(today.totalItems)
    ? (Number(today.inLaundry) / Number(today.totalItems)) * 100
    : 0;

  return (
    <div>
      <PageHeader
        title="RFID Linen Management Overview"
        subtitle="Real-time visibility across inventory, laundry operations and item lifecycle."
      />

      <Suspense fallback={<div className="h-9 mb-6" />}>
        <DashboardFilters />
      </Suspense>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={Package} label="Total RFID Items" value={fmtNumber(Number(today?.totalItems ?? 0))} trend={delta("totalItems")} href="/inventory" tone="blue" />
        <KpiCard icon={Users} label="With Customers" value={fmtNumber(Number(today?.withCustomers ?? 0))} sub={fmtPct(withCustomerPct)} href="/inventory?status=ACTIVE" tone="green" />
        <KpiCard icon={WashingMachine} label="Currently In Laundry" value={fmtNumber(Number(today?.inLaundry ?? 0))} sub={fmtPct(inLaundryPct)} href="/operations" tone="blue" />
        <KpiCard icon={CheckCircle2} label="Clean & Ready" value={fmtNumber(Number(today?.ready ?? 0))} href="/operations/dispatch" tone="green" />
        <KpiCard icon={AlertTriangle} label="Missing Items" value={fmtNumber(Number(today?.missing ?? 0))} trend={delta("missing")} href="/loss/missing" tone="red" />
        <KpiCard icon={Clock3} label="Near End of Life" value={fmtNumber(Number(today?.nearEol ?? 0))} href="/lifecycle/near-eol" tone="amber" />
        <KpiCard icon={XOctagon} label="Exceeded Wash Limit" value={fmtNumber(Number(today?.disposalRequired ?? 0))} href="/lifecycle/disposal" tone="red" />
        <KpiCard icon={Coins} label="Inventory Loss Value" value={fmtAED(Number(today?.lossValue ?? 0))} href="/loss/analytics" tone="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <Card className="lg:col-span-2">
          <CardHeader title="Inventory & Loss Trend" subtitle={chartSubtitle} />
          <div className="px-3 pb-3">
            <TrendAreaChart
              data={series}
              dataKey="totalItems"
              xKey="dateLabel"
              color="#2563eb"
              compareKey={filters.compare ? "totalItemsPrev" : undefined}
            />
          </div>
        </Card>
        <Card>
          <CardHeader title="Missing Items Trend" subtitle={chartSubtitle} />
          <div className="px-3 pb-3">
            <TrendAreaChart
              data={series}
              dataKey="missing"
              xKey="dateLabel"
              color="#dc2626"
              height={220}
              compareKey={filters.compare ? "missingPrev" : undefined}
            />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader
          title="Customer / Organization Overview"
          subtitle={
            typeLabel
              ? `${typeLabel} customers — click a row to open their detail dashboard`
              : "Click a customer to open their detail dashboard"
          }
        />
        <CustomerOverviewTable rows={customers} />
      </Card>
    </div>
  );
}
