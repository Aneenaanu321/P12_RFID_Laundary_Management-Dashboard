import { Item } from "@/lib/queries";
import { EmptyState } from "@/components/ui/EmptyState";
import { fmtAED, fmtDateTime, daysSince } from "@/lib/format";
import { markItemFound, markItemLost, flagItem } from "@/lib/actions";
import Link from "next/link";

export function MissingItemsTable({ rows, path }: { rows: Item[]; path: string }) {
  if (rows.length === 0) return <EmptyState title="No missing items" subtitle="Everything currently tracked is accounted for." />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-5 py-3 font-medium">RFID</th>
            <th className="px-3 py-3 font-medium">Item</th>
            <th className="px-3 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Last Seen</th>
            <th className="px-3 py-3 font-medium">Days Missing</th>
            <th className="px-3 py-3 font-medium">Value</th>
            <th className="px-3 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((it) => (
            <tr key={it.id} className="hover:bg-slate-50">
              <td className="px-5 py-3 font-mono text-xs text-slate-500">{it.epc}</td>
              <td className="px-3 py-3">
                <Link href={`/inventory/${it.itemCode}`} className="font-medium text-blue-700 hover:underline">{it.itemCode}</Link>
                <p className="text-xs text-slate-400">{it.itemTypeName}</p>
              </td>
              <td className="px-3 py-3 text-slate-600">{it.customerName}</td>
              <td className="px-3 py-3 text-slate-500">{it.missingSince ? fmtDateTime(it.missingSince) : "—"}</td>
              <td className="px-3 py-3 tabular-nums text-slate-700">{it.missingSince ? daysSince(it.missingSince) : "—"}</td>
              <td className="px-3 py-3 tabular-nums text-slate-700">{fmtAED(it.value)}</td>
              <td className="px-3 py-3">
                <div className="flex justify-end gap-1.5">
                  <form action={flagItem.bind(null, it.id, path)}>
                    <button className="px-2 py-1 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">Investigate</button>
                  </form>
                  <form action={markItemFound.bind(null, it.id, path)}>
                    <button className="px-2 py-1 text-xs rounded-md border border-green-200 text-green-700 hover:bg-green-50">Mark Found</button>
                  </form>
                  <form action={markItemLost.bind(null, it.id, path)}>
                    <button className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50">Mark Lost</button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
