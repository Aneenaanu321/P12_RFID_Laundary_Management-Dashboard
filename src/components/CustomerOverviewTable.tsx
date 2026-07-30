import Link from "next/link";
import { fmtNumber } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

type Row = {
  id: string; name: string; type: string; totalItems: number; inLaundry: number;
  ready: number; missing: number; nearEol: number;
};

export function CustomerOverviewTable({ rows }: { rows: Row[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
            <th className="px-5 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Type</th>
            <th className="px-3 py-3 font-medium">Total Items</th>
            <th className="px-3 py-3 font-medium">In Laundry</th>
            <th className="px-3 py-3 font-medium">Ready</th>
            <th className="px-3 py-3 font-medium">Missing</th>
            <th className="px-3 py-3 font-medium">End of Life</th>
            <th className="px-3 py-3 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((c) => {
            const missingRate = c.totalItems ? c.missing / c.totalItems : 0;
            const health = missingRate > 0.01 ? "WARNING" : "HEALTHY";
            return (
              <tr key={c.id} className="hover:bg-slate-50">
                <td className="px-5 py-3">
                  <Link href={`/customers/${c.id}`} className="font-medium text-blue-700 hover:underline">{c.name}</Link>
                </td>
                <td className="px-3 py-3 text-slate-600">{c.type}</td>
                <td className="px-3 py-3 tabular-nums text-slate-700">{fmtNumber(c.totalItems)}</td>
                <td className="px-3 py-3 tabular-nums text-slate-600">{fmtNumber(c.inLaundry)}</td>
                <td className="px-3 py-3 tabular-nums text-slate-600">{fmtNumber(c.ready)}</td>
                <td className="px-3 py-3 tabular-nums text-slate-600">{fmtNumber(c.missing)}</td>
                <td className="px-3 py-3 tabular-nums text-slate-600">{fmtNumber(c.nearEol)}</td>
                <td className="px-3 py-3"><StatusBadge status={health} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
