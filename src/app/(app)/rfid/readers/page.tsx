import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";
import { SearchableReadersTable } from "@/components/SearchableReadersTable";
import { getReaders, getReaderStats } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";

export default function Page() {
  const readers = getReaders();
  const stats = getReaderStats();

  return (
    <div>
      <PageHeader title="RFID Reader Health" subtitle="Live infrastructure status across all laundry zones." />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <KpiCard icon="Radio" label="Total Readers" value={String(stats.total)} tone="blue" href="/rfid/readers" />
        <KpiCard icon="Wifi" label="Online" value={String(stats.online)} tone="green" href="/rfid/readers" />
        <KpiCard icon="AlertTriangle" label="Warning" value={String(stats.warning)} tone="amber" href="/rfid/readers" />
        <KpiCard icon="WifiOff" label="Offline" value={String(stats.offline)} tone="red" href="/rfid/readers" />
        <KpiCard icon="Activity" label="Total Reads Today" value={fmtNumber(stats.totalReadsToday)} tone="blue" href="/rfid/events" />
        <KpiCard icon="CheckCircle2" label="Read Success Rate" value={`${stats.successRate}%`} tone="green" href="/rfid/history" />
      </div>

      <Card>
        <CardHeader title="Readers" />
        <SearchableReadersTable readers={readers} showReadsPerMin />
      </Card>
    </div>
  );
}
