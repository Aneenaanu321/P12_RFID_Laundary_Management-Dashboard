import Link from "next/link";
import { Package } from "lucide-react";
import { fmtNumber } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";

type Row = {
  id: string; name: string; type: string; totalItems: number; inLaundry: number;
  ready: number; missing: number; nearEol: number;
};

function healthFor(c: Row) {
  const missingRate = c.totalItems ? c.missing / c.totalItems : 0;
  return missingRate > 0.01 ? "WARNING" : "HEALTHY";
}

function CustomerMobileCard({ c }: { c: Row }) {
  const health = healthFor(c);
  return (
    <Link
      href={`/customers/${c.id}`}
      className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-4 hover:border-[var(--muted-fg)] hover:shadow-sm transition-all a11y-focus"
      aria-label={`Customer ${c.name}, ${fmtNumber(c.totalItems)} items`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[var(--foreground)] truncate">{c.name}</p>
          <p className="text-[11px] text-[var(--muted)] mt-0.5 capitalize">{c.type.toLowerCase()}</p>
        </div>
        <StatusBadge status={health} />
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[11px]">
        <div>
          <dt className="text-[var(--muted-fg)]">Total</dt>
          <dd className="font-medium tabular-nums text-[var(--foreground)]">{fmtNumber(c.totalItems)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-fg)]">In laundry</dt>
          <dd className="font-medium tabular-nums text-[var(--foreground)]">{fmtNumber(c.inLaundry)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-fg)]">Ready</dt>
          <dd className="font-medium tabular-nums text-[var(--foreground)]">{fmtNumber(c.ready)}</dd>
        </div>
        <div>
          <dt className="text-[var(--muted-fg)]">Missing</dt>
          <dd className="font-medium tabular-nums text-[var(--status-red)]">{fmtNumber(c.missing)}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[var(--muted-fg)]">Near end of life</dt>
          <dd className="font-medium tabular-nums text-[var(--foreground)]">{fmtNumber(c.nearEol)}</dd>
        </div>
      </dl>
    </Link>
  );
}

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
    <>
      {/* Mobile: stacked cards — no horizontal scroll */}
      <div className="md:hidden space-y-3 px-4 pb-4">
        {rows.map((c) => (
          <CustomerMobileCard key={c.id} c={c} />
        ))}
      </div>

      {/* Desktop / tablet: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
              <th className="px-5 py-3 font-medium" scope="col">Customer</th>
              <th className="px-3 py-3 font-medium" scope="col">Type</th>
              <th className="px-3 py-3 font-medium" scope="col">Total Items</th>
              <th className="px-3 py-3 font-medium" scope="col">In Laundry</th>
              <th className="px-3 py-3 font-medium" scope="col">Ready</th>
              <th className="px-3 py-3 font-medium" scope="col">Missing</th>
              <th className="px-3 py-3 font-medium" scope="col">End of Life</th>
              <th className="px-3 py-3 font-medium" scope="col">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {rows.map((c) => {
              const health = healthFor(c);
              return (
                <tr key={c.id} className="a11y-row hover:bg-[var(--surface-hover)]">
                  <td className="px-5 py-3">
                    <Link
                      href={`/customers/${c.id}`}
                      className="font-medium text-[var(--status-blue)] hover:underline rounded-sm a11y-focus"
                      aria-label={`Customer ${c.name}, ${fmtNumber(c.totalItems)} items`}
                    >
                      {c.name}
                    </Link>
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
    </>
  );
}

export function CustomerTableSkeleton() {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] p-5 animate-pulse">
      <div className="h-4 w-56 rounded bg-[var(--surface-muted)] mb-2" />
      <div className="h-3 w-40 rounded bg-[var(--surface-muted)] mb-6" />
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-28 w-full rounded-xl bg-[var(--surface-muted)]" />
        ))}
      </div>
      <div className="hidden md:block space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-10 w-full rounded bg-[var(--surface-muted)]" />
        ))}
      </div>
    </div>
  );
}
