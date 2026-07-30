import Link from "next/link";
import { Package } from "lucide-react";
import { fmtNumber } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

type Row = {
  id: string; name: string; type: string; totalItems: number; inLaundry: number;
  ready: number; missing: number; nearEol: number;
};

export function CustomerOverviewTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return (
      <EmptyState
        icon={Package}
        title="No customers yet"
        subtitle="Add customers or clear filters to see organization inventory health here."
      />
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
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
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {rows.map((c) => {
            const missingRate = c.totalItems ? c.missing / c.totalItems : 0;
            const health = missingRate > 0.01 ? "WARNING" : "HEALTHY";
            return (
              <tr key={c.id} className="hover:bg-[var(--surface-hover)]">
                <td className="px-5 py-3">
                  <Link href={`/customers/${c.id}`} className="font-medium text-[var(--status-blue)] hover:underline">{c.name}</Link>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">{c.type}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{fmtNumber(c.totalItems)}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtNumber(c.inLaundry)}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtNumber(c.ready)}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtNumber(c.missing)}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtNumber(c.nearEol)}</td>
                <td className="px-3 py-3"><StatusBadge status={health} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function CustomerTableSkeleton() {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] p-5 animate-pulse">
      <div className="h-4 w-56 rounded bg-[var(--surface-muted)] mb-2" />
      <div className="h-3 w-40 rounded bg-[var(--surface-muted)] mb-6" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-[var(--surface-muted)]" />
        ))}
      </div>
    </div>
  );
}
