"use client";

import { StatusBadge } from "@/components/ui/StatusBadge";
import { ClientTableSearch } from "@/components/ClientTableSearch";
import { fmtNumber, timeAgo } from "@/lib/format";

type Reader = {
  id: string;
  code: string;
  zone: string;
  status: string;
  readsToday: number;
  readsPerMin?: number;
  lastCommAt: string;
  firmware: string;
};

export function SearchableReadersTable({
  readers,
  showReadsPerMin = false,
}: {
  readers: Reader[];
  showReadsPerMin?: boolean;
}) {
  const zones = [...new Set(readers.map((r) => r.zone))].sort();
  const statuses = [...new Set(readers.map((r) => r.status))].sort();

  return (
    <ClientTableSearch
      rows={readers}
      getSearchText={(r) => `${r.code} ${r.zone} ${r.firmware} ${r.status}`}
      searchPlaceholder="Search readers..."
      filters={[
        {
          key: "status",
          label: "All Statuses",
          getValue: (r) => r.status,
          options: statuses.map((s) => ({ value: s, label: s })),
        },
        {
          key: "zone",
          label: "All Zones",
          getValue: (r) => r.zone,
          options: zones.map((z) => ({ value: z, label: z })),
        },
      ]}
      emptyMessage="No readers match your search."
      exportFilename="readers"
    >
      {(filtered) => (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
                <th className="px-5 py-3 font-medium">Reader ID</th>
                <th className="px-3 py-3 font-medium">{showReadsPerMin ? "Location" : "Zone"}</th>
                <th className="px-3 py-3 font-medium">Status</th>
                <th className="px-3 py-3 font-medium">Reads Today</th>
                {showReadsPerMin && <th className="px-3 py-3 font-medium">Reads/min</th>}
                <th className="px-3 py-3 font-medium">{showReadsPerMin ? "Last Communication" : "Last Seen"}</th>
                <th className="px-3 py-3 font-medium">Firmware</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border-subtle)]">
              {filtered.map((r) => (
                <tr key={r.id} className="hover:bg-[var(--surface-hover)]">
                  <td className="px-5 py-3 font-medium text-[var(--foreground)]">{r.code}</td>
                  <td className="px-3 py-3 text-[var(--muted)]">{r.zone}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{fmtNumber(r.readsToday)}</td>
                  {showReadsPerMin && (
                    <td className="px-3 py-3 tabular-nums text-[var(--foreground)]">{r.readsPerMin ?? 0}/min</td>
                  )}
                  <td className="px-3 py-3 text-[var(--muted)]">{timeAgo(r.lastCommAt)}</td>
                  <td className="px-3 py-3 text-[var(--muted)] font-mono text-xs">{r.firmware}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </ClientTableSearch>
  );
}
