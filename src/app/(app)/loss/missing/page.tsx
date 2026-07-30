import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";
import { MissingItemsTable } from "@/components/MissingItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { BarHorizontal } from "@/components/charts/Charts";
import { getLossKpis, getMissingByCustomer, getMissingByLocation, getMissingItemsPage } from "@/lib/queries";
import { fmtAED, fmtNumber } from "@/lib/format";
import { AlertTriangle, Coins, Clock3, CalendarX } from "lucide-react";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  const kpis = getLossKpis();
  const byCustomer = getMissingByCustomer();
  const byLocation = getMissingByLocation().slice(0, 10);
  const { rows, pageCount } = getMissingItemsPage({}, page, 25);

  return (
    <div>
      <PageHeader title="Missing Items" subtitle="Loss prevention — items unaccounted for across the tracked estate." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon={AlertTriangle} label="Missing Items" value={fmtNumber(kpis.missingCount)} tone="red" />
        <KpiCard icon={Coins} label="Estimated Loss" value={fmtAED(kpis.missingValue)} tone="amber" />
        <KpiCard icon={Clock3} label="Missing > 24 Hours" value={fmtNumber(kpis.gt24h)} tone="amber" />
        <KpiCard icon={CalendarX} label="Missing > 7 Days" value={fmtNumber(kpis.gt7d)} tone="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Missing Items by Customer" />
          <div className="px-3 pb-3"><BarHorizontal data={byCustomer} dataKey="c" nameKey="customerName" color="#dc2626" /></div>
        </Card>
        <Card>
          <CardHeader title="Missing Items by Location" />
          <div className="px-3 pb-3"><BarHorizontal data={byLocation} dataKey="c" nameKey="locationName" color="#d97706" /></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Missing Items" />
        <MissingItemsTable rows={rows} path="/loss/missing" />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `/loss/missing?page=${p}`} />
      </Card>
    </div>
  );
}
