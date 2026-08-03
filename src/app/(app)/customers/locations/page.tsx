import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { SearchableLocationsTable } from "@/components/SearchableLocationsTable";
import { MisrouteWatchTable } from "@/components/MisrouteWatchTable";
import { getCustomerLocations, getMisroutedItems } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";
import { AlertTriangle } from "lucide-react";

export default function Page() {
  const locations = getCustomerLocations();
  const misrouted = getMisroutedItems(200);
  const excessSites = locations.filter((l) => l.excess > 0).length;
  const totalExcess = locations.reduce((s, l) => s + Number(l.excess), 0);

  return (
    <div>
      <PageHeader
        title="Locations"
        subtitle="Site inventory with expected vs received counts. Excess flags items owned by another customer (possible misroutes)."
      />

      <Card>
        <SearchableLocationsTable locations={locations} />
      </Card>

      {(totalExcess > 0 || misrouted.length > 0) && (
        <Card className="mt-6 border-[var(--status-amber-ring)]">
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
          <MisrouteWatchTable rows={misrouted} />
        </Card>
      )}
    </div>
  );
}
