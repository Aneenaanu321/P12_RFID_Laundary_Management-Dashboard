import { PageHeader } from "@/components/layout/PageHeader";
import { KpiCard } from "@/components/KpiCard";
import { CustomerOverviewTable } from "@/components/CustomerOverviewTable";
import { Card, CardHeader } from "@/components/ui/Card";
import { TrendAreaChart } from "@/components/charts/Charts";
import {
  getKpis, getSnapshotSeries, getCustomers,
} from "@/lib/queries";
import { fmtAED, fmtNumber, fmtPct } from "@/lib/format";
import {
  Package, Users, WashingMachine, CheckCircle2, AlertTriangle, Clock3, XOctagon, Coins,
} from "lucide-react";

export default async function DashboardPage() {
  const { today, delta } = getKpis();
  const series = getSnapshotSeries(30).map((s) => ({ ...s, dateLabel: String(s.date).slice(5) }));
  const customers = getCustomers();

  const withCustomerPct = today ? (Number(today.withCustomers) / Number(today.totalItems)) * 100 : 0;
  const inLaundryPct = today ? (Number(today.inLaundry) / Number(today.totalItems)) * 100 : 0;

  return (
    <div>
      <PageHeader
        title="RFID Linen Management Overview"
        subtitle="Real-time visibility across inventory, laundry operations and item lifecycle."
      />

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
          <CardHeader title="Inventory & Loss Trend" subtitle="Last 30 days" />
          <div className="px-3 pb-3">
            <TrendAreaChart data={series} dataKey="totalItems" xKey="dateLabel" color="#2563eb" />
          </div>
        </Card>
        <Card>
          <CardHeader title="Missing Items Trend" subtitle="Last 30 days" />
          <div className="px-3 pb-3">
            <TrendAreaChart data={series} dataKey="missing" xKey="dateLabel" color="#dc2626" height={220} />
          </div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Customer / Organization Overview" subtitle="Click a customer to open their detail dashboard" />
        <CustomerOverviewTable rows={customers} />
      </Card>
    </div>
  );
}
