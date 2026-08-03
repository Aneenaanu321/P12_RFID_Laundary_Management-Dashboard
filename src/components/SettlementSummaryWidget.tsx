import Link from "next/link";
import { Scale, Coins, FileText } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { getSettlements, getSettlementLines, getKpis } from "@/lib/queries";
import { fmtAED, fmtNumber } from "@/lib/format";

export async function SettlementSummaryWidget() {
  const settlements = getSettlements().slice(0, 5);
  const { today } = getKpis();
  const lossValue = Number(today?.lossValue ?? 0);

  const rows = settlements.map((s) => {
    const lines = getSettlementLines(s.id);
    const amount = lines.reduce((sum, l) => sum + Number(l.amount ?? 0), 0);
    const missing = lines.reduce((sum, l) => sum + Number(l.missing ?? 0), 0);
    return { ...s, amount, missing };
  });

  const totalOpen = rows.reduce((s, r) => s + r.amount, 0);

  return (
    <Card className="mb-6">
      <CardHeader
        title="Settlement & Loss Snapshot"
        subtitle="Finance-first overview of open settlements and inventory at risk"
        action={
          <Link href="/settlement" className="text-xs font-medium text-[var(--status-blue)] hover:underline">
            Settlement center
          </Link>
        }
      />
      <div className="px-5 pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-0 sm:gap-0 mb-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border-subtle)] rounded-xl border border-[var(--border-subtle)] overflow-hidden">
          <div className="bg-[var(--surface-muted)] p-3.5">
            <div className="flex items-center gap-2 text-[var(--status-amber)]">
              <Coins size={15} />
              <span className="text-[11px] font-medium uppercase tracking-wide">Loss value</span>
            </div>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--foreground)]">{fmtAED(lossValue)}</p>
            <Link href="/loss/analytics" className="text-[11px] text-[var(--status-blue)] hover:underline">
              Loss analytics
            </Link>
          </div>
          <div className="bg-[var(--surface-muted)] p-3.5">
            <div className="flex items-center gap-2 text-[var(--status-blue)]">
              <Scale size={15} />
              <span className="text-[11px] font-medium uppercase tracking-wide">Open settlement $</span>
            </div>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--foreground)]">{fmtAED(totalOpen)}</p>
            <p className="text-[11px] text-[var(--muted)]">{fmtNumber(rows.length)} customers shown</p>
          </div>
          <div className="bg-[var(--surface-muted)] p-3.5">
            <div className="flex items-center gap-2 text-[var(--muted)]">
              <FileText size={15} />
              <span className="text-[11px] font-medium uppercase tracking-wide">Missing on bills</span>
            </div>
            <p className="mt-1.5 text-xl font-semibold tabular-nums text-[var(--foreground)]">
              {fmtNumber(rows.reduce((s, r) => s + r.missing, 0))}
            </p>
            <Link href="/loss/reconciliation" className="text-[11px] text-[var(--status-blue)] hover:underline">
              Reconciliation
            </Link>
          </div>
        </div>

        <div className="overflow-x-auto rounded-lg border border-[var(--border-subtle)]">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[var(--muted)] bg-[var(--surface-muted)]">
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Period</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {rows.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--surface-muted)]">
                  <td className="px-3 py-2.5 font-medium text-[var(--foreground)]">{r.customerName}</td>
                  <td className="px-3 py-2.5 text-[var(--muted)]">{r.periodLabel}</td>
                  <td className="px-3 py-2.5 text-[var(--muted)]">{r.status}</td>
                  <td className="px-3 py-2.5 text-right tabular-nums font-medium">{fmtAED(r.amount)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-3 py-6 text-center text-[var(--muted)]">
                    No settlements yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Card>
  );
}
