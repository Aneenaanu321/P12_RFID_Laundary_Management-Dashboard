import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { KpiCard } from "@/components/KpiCard";
import { MissingItemsTable } from "@/components/MissingItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { TableFilters } from "@/components/TableFilters";
import { BarHorizontal } from "@/components/charts/Charts";
import { getLossKpis, getMissingByCustomer, getMissingByLocation, getMissingItemsPage, getCustomers } from "@/lib/queries";
import { fmtAED, fmtNumber } from "@/lib/format";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; customerId?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const kpis = getLossKpis();
  const byCustomer = getMissingByCustomer();
  const byLocation = getMissingByLocation().slice(0, 10);
  const customers = getCustomers();
  const { rows, total, pageCount } = getMissingItemsPage(
    { search: sp.q, customerId: sp.customerId },
    page,
    25
  );

  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.customerId) params.set("customerId", sp.customerId);
  const qs = params.toString();

  return (
    <div>
      <PageHeader title="Missing Items" subtitle="Loss prevention — items unaccounted for across the tracked estate." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <KpiCard icon="AlertTriangle" label="Missing Items" value={fmtNumber(kpis.missingCount)} tone="red" href="/loss/missing" />
        <KpiCard icon="Coins" label="Estimated Loss" value={fmtAED(kpis.missingValue)} tone="amber" href="/loss/analytics" />
        <KpiCard icon="Clock3" label="Missing > 24 Hours" value={fmtNumber(kpis.gt24h)} tone="amber" href="/loss/missing" />
        <KpiCard icon="CalendarX" label="Missing > 7 Days" value={fmtNumber(kpis.gt7d)} tone="red" href="/loss/missing" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <Card>
          <CardHeader title="Missing Items by Customer" />
          <div className="px-3 pb-3"><BarHorizontal data={byCustomer} dataKey="c" nameKey="customerName" color="var(--status-red)" /></div>
        </Card>
        <Card>
          <CardHeader title="Missing Items by Location" />
          <div className="px-3 pb-3"><BarHorizontal data={byLocation} dataKey="c" nameKey="locationName" color="var(--status-amber)" /></div>
        </Card>
      </div>

      <Card>
        <CardHeader title="Missing Items" subtitle={`${fmtNumber(total)} matching`} />
        <TableFilters
          searchPlaceholder="Search EPC or item code..."
          exportResource="missing"
          exportFilename="missing-items"
          filters={[
            { key: "customerId", label: "All Customers", options: customers.map((c) => ({ value: c.id, label: c.name })) },
          ]}
        />
        <MissingItemsTable rows={rows} path="/loss/missing" />
        <Pagination
          page={page}
          pageCount={pageCount}
          buildHref={(p) => `/loss/missing?${qs}${qs ? "&" : ""}page=${p}`}
        />
      </Card>
    </div>
  );
}
