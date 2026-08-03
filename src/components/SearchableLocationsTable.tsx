"use client";

import Link from "next/link";
import { ClientTableSearch } from "@/components/ClientTableSearch";
import { fmtNumber } from "@/lib/format";

type Location = {
  id: string;
  name: string;
  city: string | null;
  customerId: string;
  customerName: string;
  itemCount: number;
  expected: number;
  received: number;
  excess: number;
  shortfall: number;
};

export function SearchableLocationsTable({ locations }: { locations: Location[] }) {
  return (
    <ClientTableSearch
      rows={locations}
      getSearchText={(l) => `${l.name} ${l.customerName} ${l.city ?? ""}`}
      searchPlaceholder="Search location, customer, city..."
      emptyMessage="No locations match your search."
      exportFilename="locations"
    >
      {(filtered) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Location</th>
                <th className="px-3 py-3 font-medium">Customer</th>
                <th className="px-3 py-3 font-medium">City</th>
                <th className="px-3 py-3 font-medium text-right">Items</th>
                <th className="px-3 py-3 font-medium text-right">Expected</th>
                <th className="px-3 py-3 font-medium text-right">Received</th>
                <th className="px-3 py-3 font-medium text-right">Excess</th>
                <th className="px-3 py-3 font-medium text-right">Short</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((l) => (
                <tr
                  key={l.id}
                  className={`hover:bg-[var(--surface-hover)] ${
                    l.excess > 0 ? "bg-[var(--status-amber-bg)]/40" : ""
                  }`}
                >
                  <td className="px-5 py-3 font-medium text-[var(--foreground)]">{l.name}</td>
                  <td className="px-3 py-3 text-[var(--status-blue)]">
                    <Link href={`/customers/${l.customerId}`}>{l.customerName}</Link>
                  </td>
                  <td className="px-3 py-3 text-[var(--muted)]">{l.city ?? "—"}</td>
                  <td className="px-3 py-3 tabular-nums text-right text-[var(--foreground)]">
                    {fmtNumber(l.itemCount)}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-right text-[var(--muted)]">
                    {fmtNumber(l.expected)}
                  </td>
                  <td className="px-3 py-3 tabular-nums text-right text-[var(--foreground)]">
                    {fmtNumber(l.received)}
                  </td>
                  <td
                    className={`px-3 py-3 tabular-nums text-right font-medium ${
                      l.excess > 0 ? "text-[var(--status-amber)]" : "text-[var(--muted)]"
                    }`}
                    title={
                      l.excess > 0
                        ? "Items at this site owned by a different customer (possible misroute)"
                        : undefined
                    }
                  >
                    {fmtNumber(l.excess)}
                  </td>
                  <td
                    className={`px-3 py-3 tabular-nums text-right ${
                      l.shortfall > 0 ? "text-[var(--status-red)]" : "text-[var(--muted)]"
                    }`}
                  >
                    {fmtNumber(l.shortfall)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientTableSearch>
  );
}
