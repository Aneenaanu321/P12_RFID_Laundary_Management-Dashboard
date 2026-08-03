import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getReaders, getReaderStats } from "@/lib/queries";
import { fmtNumber, timeAgo } from "@/lib/format";

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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Reader ID</th>
                <th className="px-3 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Reads Today</th>
                <th className="px-3 py-3 font-medium">Reads/min</th>
                <th className="px-3 py-3 font-medium">Last Communication</th>
                <th className="px-3 py-3 font-medium">Firmware</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {readers.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-5 py-3 font-medium text-slate-800">{r.code}</td>
                  <td className="px-3 py-3 text-slate-600">{r.zone}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 tabular-nums text-slate-700">{fmtNumber(r.readsToday)}</td>
                  <td className="px-3 py-3 tabular-nums text-slate-700">{r.readsPerMin}/min</td>
                  <td className="px-3 py-3 text-slate-500">{timeAgo(r.lastCommAt)}</td>
                  <td className="px-3 py-3 text-slate-500 font-mono text-xs">{r.firmware}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
