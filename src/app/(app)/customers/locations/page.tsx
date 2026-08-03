import Link from "next/link";
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { SearchableLocationsTable } from "@/components/SearchableLocationsTable";
import { getCustomerLocations, getMisroutedItems } from "@/lib/queries";
import { fmtNumber, timeAgo } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

export default function Page() {
  const locations = getCustomerLocations();
  const misrouted = getMisroutedItems(25);
  const excessSites = locations.filter((l) => l.excess > 0).length;
  const totalExcess = locations.reduce((s, l) => s + Number(l.excess), 0);

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Site inventory with expected vs received counts. Excess flags items owned by another customer (possible misroutes)."
      />

      {(totalExcess > 0 || misrouted.length > 0) && (
        <Card className="mb-6 border-[var(--status-amber-ring)]">
          <CardHeader
            title="Misroute watch"
            subtitle={`${fmtNumber(totalExcess)} excess item(s) across ${fmtNumber(excessSites)} site(s) — e.g. a hospital gown scanned at a gym location`}
            action={
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[var(--status-amber)]">
                <AlertTriangle size={14} aria-hidden />
                Needs review
              </span>
            }
          />
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
                {misrouted.map((m) => (
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
                {misrouted.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-5 py-6 text-sm text-[var(--muted)] text-center">
                      No misrouted items right now.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      <Card>
        <SearchableLocationsTable locations={locations} />
      </Card>
    </div>
  );
}
