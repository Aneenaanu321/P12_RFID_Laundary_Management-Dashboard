"use client";

import { ClientTableSearch } from "@/components/ClientTableSearch";
import { fmtAED, fmtNumber } from "@/lib/format";

type Line = {
  id: string;
  itemTypeName: string;
  sent: number;
  returned: number;
  missing: number;
  washCycles: number;
  pricePerCycle: number;
  amount: number;
};

export function SearchableSettlementLines({ lines }: { lines: Line[] }) {
  return (
    <ClientTableSearch
      rows={lines}
      getSearchText={(l) => l.itemTypeName}
      searchPlaceholder="Search item types..."
      emptyMessage="No settlement lines match your search."
      exportFilename="settlement-lines"
    >
      {(filtered) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Item Type</th>
                <th className="px-3 py-3 font-medium">Sent</th>
                <th className="px-3 py-3 font-medium">Returned</th>
                <th className="px-3 py-3 font-medium">Missing</th>
                <th className="px-3 py-3 font-medium">Wash Cycles</th>
                <th className="px-3 py-3 font-medium">Price / Cycle</th>
                <th className="px-3 py-3 font-medium">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((l) => (
                <tr key={l.id} className="hover:bg-[var(--surface-hover)]">
                  <td className="px-5 py-3 font-medium text-[var(--foreground)]">{l.itemTypeName}</td>
                  <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtNumber(l.sent)}</td>
                  <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtNumber(l.returned)}</td>
                  <td className="px-3 py-3 tabular-nums text-[var(--status-red)]">{fmtNumber(l.missing)}</td>
                  <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtNumber(l.washCycles)}</td>
                  <td className="px-3 py-3 tabular-nums text-[var(--muted)]">{fmtAED(l.pricePerCycle)}</td>
                  <td className="px-3 py-3 tabular-nums font-medium text-[var(--foreground)]">{fmtAED(l.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientTableSearch>
  );
}
