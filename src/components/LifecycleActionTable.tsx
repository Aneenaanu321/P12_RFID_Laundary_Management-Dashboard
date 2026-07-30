import { Item } from "@/lib/queries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { flagItem, approveDisposal, markItemDisposed, requestReplacement } from "@/lib/actions";
import Link from "next/link";

export function LifecycleActionTable({ rows, path, showDisposeActions = true }: { rows: Item[]; path: string; showDisposeActions?: boolean }) {
  if (rows.length === 0) return <EmptyState title="Nothing here right now" subtitle="Items will appear as they approach their wash-cycle limit." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-5 py-3 font-medium">RFID / Item</th>
            <th className="px-3 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Wash Cycles</th>
            <th className="px-3 py-3 font-medium">Limit</th>
            <th className="px-3 py-3 font-medium">Remaining</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((it) => {
            const remaining = Math.max(0, it.maxWashCycles - it.washCycles);
            const critical = remaining <= (it.maxWashCycles * 0.05);
            return (
              <tr key={it.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/inventory/${it.itemCode}`} className="font-medium text-blue-700 hover:underline">{it.itemCode}</Link>
                  <p className="text-xs text-slate-400">{it.itemTypeName}</p>
                </td>
                <td className="px-3 py-3 text-slate-600">{it.customerName}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{it.washCycles}</td>
                <td className="px-3 py-3 tabular-nums text-slate-500">{it.maxWashCycles}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{remaining}</td>
                <td className="px-3 py-3"><StatusBadge status={critical ? "CRITICAL" : it.lifecycleStatus} label={critical ? "Critical" : undefined} /></td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5 flex-wrap">
                    <form action={flagItem.bind(null, it.id, path)}>
                      <button className="px-2 py-1 text-xs rounded-md border border-slate-200 text-slate-600 hover:bg-slate-50">Flag</button>
                    </form>
                    {showDisposeActions && it.lifecycleStatus !== "DISPOSAL_REQUIRED" && (
                      <form action={approveDisposal.bind(null, it.id, path)}>
                        <button className="px-2 py-1 text-xs rounded-md border border-amber-200 text-amber-700 hover:bg-amber-50">Approve Disposal</button>
                      </form>
                    )}
                    {showDisposeActions && !it.disposed && (
                      <form action={markItemDisposed.bind(null, it.id, path)}>
                        <button className="px-2 py-1 text-xs rounded-md border border-red-200 text-red-600 hover:bg-red-50">Mark Disposed</button>
                      </form>
                    )}
                    {it.disposed && (
                      <form action={requestReplacement.bind(null, it.id, path)}>
                        <button className="px-2 py-1 text-xs rounded-md bg-blue-600 text-white hover:bg-blue-700">Request Replacement</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
