import { Item } from "@/lib/queries";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { flagItem, approveDisposal, markItemDisposed, requestReplacement } from "@/lib/actions";
import Link from "next/link";

export function LifecycleActionTable({ rows, path, showDisposeActions = true }: { rows: Item[]; path: string; showDisposeActions?: boolean }) {
  if (rows.length === 0) return <EmptyState title="Nothing here right now" subtitle="Items will appear as they approach their wash-cycle limit." />;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
            <th className="px-5 py-3 font-medium">RFID / Item</th>
            <th className="px-3 py-3 font-medium">Customer</th>
            <th className="px-3 py-3 font-medium">Wash Cycles</th>
            <th className="px-3 py-3 font-medium">Limit</th>
            <th className="px-3 py-3 font-medium">Remaining</th>
            <th className="px-3 py-3 font-medium">Status</th>
            <th className="px-3 py-3 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[var(--border-subtle)]">
          {rows.map((it) => {
            const remaining = Math.max(0, it.maxWashCycles - it.washCycles);
            const critical = remaining <= (it.maxWashCycles * 0.05);
            return (
              <tr key={it.id} className="hover:bg-[var(--surface-hover)]">
                <td className="px-5 py-3">
                  <Link href={`/inventory/${it.itemCode}`} className="font-medium text-[var(--accent-600)] hover:underline">{it.itemCode}</Link>
                  <p className="text-xs text-[var(--muted-fg)]">{it.itemTypeName}</p>
                </td>
                <td className="px-3 py-3 text-[var(--muted)]">{it.customerName}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{it.washCycles}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{it.maxWashCycles}</td>
                <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{remaining}</td>
                <td className="px-3 py-3"><StatusBadge status={critical ? "CRITICAL" : it.lifecycleStatus} label={critical ? "Critical" : undefined} /></td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-1.5 flex-wrap">
                    <ConfirmButton
                      variant="secondary"
                      size="sm"
                      confirmTitle="Flag for investigation?"
                      confirmDescription={`Flag ${it.itemCode} for follow-up. Operators will see it in alerts.`}
                      confirmLabel="Flag"
                      confirmVariant="primary"
                      formAction={flagItem.bind(null, it.id, path)}
                      successTitle="Flagged for investigation"
                      successMessage={it.itemCode}
                    >
                      Flag
                    </ConfirmButton>
                    {showDisposeActions && it.lifecycleStatus !== "DISPOSAL_REQUIRED" && (
                      <ConfirmButton
                        variant="warning"
                        size="sm"
                        confirmTitle="Approve disposal?"
                        confirmDescription={`Mark ${it.itemCode} as approved for disposal. This cannot be easily undone.`}
                        confirmLabel="Approve Disposal"
                        confirmVariant="warning"
                        formAction={approveDisposal.bind(null, it.id, path)}
                        successTitle="Disposal approved"
                        successMessage={it.itemCode}
                      >
                        Approve Disposal
                      </ConfirmButton>
                    )}
                    {showDisposeActions && !it.disposed && (
                      <ConfirmButton
                        variant="danger"
                        size="sm"
                        confirmTitle="Mark as disposed?"
                        confirmDescription={`Permanently mark ${it.itemCode} as disposed.`}
                        confirmLabel="Mark Disposed"
                        confirmVariant="danger"
                        formAction={markItemDisposed.bind(null, it.id, path)}
                        successTitle="Item marked as disposed"
                        successMessage={it.itemCode}
                      >
                        Mark Disposed
                      </ConfirmButton>
                    )}
                    {it.disposed && (
                      <ConfirmButton
                        variant="primary"
                        size="sm"
                        confirmTitle="Request replacement?"
                        confirmDescription={`Create a replacement request for ${it.itemCode}.`}
                        confirmLabel="Request Replacement"
                        confirmVariant="primary"
                        formAction={requestReplacement.bind(null, it.id, path)}
                        successTitle="Replacement requested"
                        successMessage={it.itemCode}
                      >
                        Request Replacement
                      </ConfirmButton>
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
