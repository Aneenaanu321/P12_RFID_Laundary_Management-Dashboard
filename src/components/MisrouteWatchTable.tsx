"use client";

import Link from "next/link";
import { ClientTableSearch } from "@/components/ClientTableSearch";
import { timeAgo } from "@/lib/format";

type MisrouteRow = {
  id: string;
  itemCode: string;
  itemTypeName: string;
  ownerName: string;
  locationName: string;
  locationCustomerName: string;
  currentStatus: string;
  lastReadAt: string | null;
};

export function MisrouteWatchTable({ rows }: { rows: MisrouteRow[] }) {
  return (
    <ClientTableSearch
      rows={rows}
      getSearchText={(m) =>
        `${m.itemCode} ${m.itemTypeName} ${m.ownerName} ${m.locationName} ${m.locationCustomerName}`
      }
      searchPlaceholder="Search misrouted items..."
      emptyMessage="No misrouted items right now."
      exportFilename="misrouted-items"
    >
      {(filtered) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Item</th>
                <th className="px-3 py-3 font-medium">Type</th>
                <th className="px-3 py-3 font-medium">Owned by</th>
                <th className="px-3 py-3 font-medium">Found at</th>
                <th className="px-3 py-3 font-medium">Site customer</th>
                <th className="px-3 py-3 font-medium">Last read</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((m) => (
                <tr key={m.id} className="hover:bg-[var(--surface-hover)]">
                  <td className="px-5 py-3">
                    <Link
                      href={`/inventory/${m.itemCode}`}
                      className="font-medium text-[var(--status-blue)] hover:underline"
                    >
                      {m.itemCode}
                    </Link>
                  </td>
                  <td className="px-3 py-3 text-[var(--muted)]">{m.itemTypeName}</td>
                  <td className="px-3 py-3 text-[var(--foreground)]">{m.ownerName}</td>
                  <td className="px-3 py-3 text-[var(--foreground)]">{m.locationName}</td>
                  <td className="px-3 py-3 text-[var(--status-amber)] font-medium">{m.locationCustomerName}</td>
                  <td className="px-3 py-3 text-[var(--muted)]">
                    {m.lastReadAt ? timeAgo(m.lastReadAt) : "—"}
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
