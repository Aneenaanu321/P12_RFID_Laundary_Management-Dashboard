import Link from "next/link";
import { Item } from "@/lib/queries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { fmtAED, fmtDateTime, titleCase } from "@/lib/format";
import { EmptyState } from "@/components/ui/EmptyState";

export function ItemsTable({ rows }: { rows: Item[] }) {
  if (rows.length === 0) return <EmptyState title="No items match these filters" subtitle="Try adjusting search or filter criteria." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-5 py-3 font-medium">RFID / Item</th>
            <th className="px-3 py-3 font-medium">Type</th>
            <th className="px-3 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Zone</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium">Wash Cycles</th>
            <th className="px-3 py-3 font-medium">Lifecycle</th>
            <th className="px-3 py-3 font-medium">Value</th>
            <th className="px-3 py-3 font-medium">Last Read</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((it) => (
            <tr key={it.id} className="hover:bg-slate-50">
              <td className="px-5 py-3">
                <Link href={`/inventory/${it.itemCode}`} className="block">
                  <p className="font-medium text-blue-700 hover:underline">{it.itemCode}</p>
                  <p className="text-xs text-slate-400 font-mono">{it.epc}</p>
                </Link>
              </td>
              <td className="px-3 py-3 text-slate-600">{it.itemTypeName}</td>
              <td className="px-3 py-3">
                <Link href={`/customers/${it.customerId}`} className="text-slate-700 hover:text-blue-700 hover:underline">
                  {it.customerName}
                </Link>
              </td>
              <td className="px-3 py-3 text-slate-500">{titleCase(it.currentZone)}</td>
              <td className="px-3 py-3"><StatusBadge status={it.missing ? "MISSING" : it.currentStatus} /></td>
              <td className="px-3 py-3 text-slate-600 tabular-nums">
                {it.washCycles} / {it.maxWashCycles}
              </td>
              <td className="px-3 py-3"><StatusBadge status={it.lifecycleStatus} /></td>
              <td className="px-3 py-3 text-slate-600 tabular-nums">{fmtAED(it.value)}</td>
              <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{fmtDateTime(it.lastReadAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
