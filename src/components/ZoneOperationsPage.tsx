import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { KpiCard } from "@/components/KpiCard";
import { getItemsPage } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";
import { Package, Gauge, Clock3 } from "lucide-react";

export async function ZoneOperationsPage({
  zone, title, subtitle, basePath, page,
}: { zone: string; title: string; subtitle: string; basePath: string; page: number }) {
  const { rows, total, pageCount } = getItemsPage({ currentZone: zone }, page, 20, "lastReadAt DESC");

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} breadcrumb="Operations" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard icon={Package} label={`Items in ${title}`} value={fmtNumber(total)} tone="blue" />
        <KpiCard icon={Gauge} label="Stage Throughput (est.)" value={`${Math.max(1, Math.round(total / 6))}/hr`} tone="green" />
        <KpiCard icon={Clock3} label="Avg. Time in Stage" value="~45 min" tone="amber" />
      </div>
      <Card>
        <CardHeader title={`Items — ${title}`} />
        <ItemsTable rows={rows} />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `${basePath}?page=${p}`} />
      </Card>
    </div>
  );
}
