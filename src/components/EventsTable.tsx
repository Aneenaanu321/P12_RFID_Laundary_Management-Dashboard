import { RfidEventRow } from "@/lib/queries";
import { fmtDateTime, titleCase } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";

export function EventsTable({ rows }: { rows: RfidEventRow[] }) {
  if (rows.length === 0) return <EmptyState title="No RFID events match these filters" />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-5 py-3 font-medium">Time</th>
            <th className="px-3 py-3 font-medium">RFID EPC</th>
            <th className="px-3 py-3 font-medium">Item</th>
            <th className="px-3 py-3 font-medium">Type</th>
            <th className="px-3 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Zone</th>
            <th className="px-3 py-3 font-medium">Reader</th>
            <th className="px-3 py-3 font-medium">Event</th>
            <th className="px-3 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((e) => (
            <tr key={e.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 text-slate-500 whitespace-nowrap tabular-nums">{fmtDateTime(e.timestamp)}</td>
              <td className="px-3 py-3 font-mono text-xs text-slate-500">EPC-{e.itemId.slice(0, 8).toUpperCase()}</td>
              <td className="px-3 py-3">
                <Link href={`/inventory/${e.itemCode}`} className="text-blue-700 hover:underline font-medium">{e.itemCode}</Link>
              </td>
              <td className="px-3 py-3 text-slate-600">{e.itemTypeName}</td>
              <td className="px-3 py-3 text-slate-600">{e.customerName}</td>
              <td className="px-3 py-3 text-slate-500">{titleCase(e.zone)}</td>
              <td className="px-3 py-3 text-slate-500">{e.readerCode}</td>
              <td className="px-3 py-3"><StatusBadge status={e.eventType} label={titleCase(e.eventType)} /></td>
              <td className="px-3 py-3"><StatusBadge status={e.status === "Missing" ? "MISSING" : "ACTIVE"} label={e.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
