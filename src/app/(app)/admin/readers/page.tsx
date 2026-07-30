import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getReaders } from "@/lib/queries";
import { fmtNumber, timeAgo } from "@/lib/format";

export default function Page() {
  const readers = getReaders();
  return (
    <div>
      <PageHeader title="RFID Readers" subtitle="Manage reader inventory, zones and firmware." />
      <Card>
        <CardHeader title={`${readers.length} Readers`} />
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Reader ID</th>
              <th className="px-3 py-3 font-medium">Zone</th>
              <th className="px-3 py-3 font-medium">Status</th>
              <th className="px-3 py-3 font-medium">Reads Today</th>
              <th className="px-3 py-3 font-medium">Firmware</th>
              <th className="px-3 py-3 font-medium">Last Seen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {readers.map((r) => (
              <tr key={r.id} className="hover:bg-slate-50">
                <td className="px-5 py-3 font-medium text-slate-800">{r.code}</td>
                <td className="px-3 py-3 text-slate-600">{r.zone}</td>
                <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{fmtNumber(r.readsToday)}</td>
                <td className="px-3 py-3 font-mono text-xs text-slate-500">{r.firmware}</td>
                <td className="px-3 py-3 text-slate-500">{timeAgo(r.lastCommAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
