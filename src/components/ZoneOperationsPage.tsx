import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { TableFilters } from "@/components/TableFilters";
import { KpiCard } from "@/components/KpiCard";
import { getItemsPage, getCustomers } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";

export async function ZoneOperationsPage({
  zone,
  title,
  subtitle,
  basePath,
  page,
  search,
  customerId,
  status,
}: {
  zone: string;
  title: string;
  subtitle: string;
  basePath: string;
  page: number;
  search?: string;
  customerId?: string;
  status?: string;
}) {
  const { rows, total, pageCount } = getItemsPage(
    { currentZone: zone, search, customerId, currentStatus: status },
    page,
    20,
    "lastReadAt DESC"
  );
  const customers = getCustomers();

  const params = new URLSearchParams();
  if (search) params.set("q", search);
  if (customerId) params.set("customerId", customerId);
  if (status) params.set("status", status);
  const qs = params.toString();

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} breadcrumb="Operations" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <KpiCard
          icon="Package"
          label={`Items in ${title}`}
          value={fmtNumber(total)}
          tone="blue"
          href={basePath}
        />
        <KpiCard
          icon="Gauge"
          label="Stage Throughput (est.)"
          value={`${Math.max(1, Math.round(total / 6))}/hr`}
          tone="green"
          href="/analytics/laundry"
        />
        <KpiCard
          icon="Clock3"
          label="Avg. Time in Stage"
          value="~45 min"
          tone="amber"
          href="/analytics/laundry"
        />
      </div>
      <Card>
        <CardHeader title={`Items — ${title}`} />
        <TableFilters
          searchPlaceholder="Search EPC or item code..."
          exportResource="items"
          exportFilename={`${zone.toLowerCase()}-items`}
          exportParams={{ zone }}
          filters={[
            { key: "customerId", label: "All Customers", options: customers.map((c) => ({ value: c.id, label: c.name })) },
            {
              key: "status",
              label: "All Statuses",
              options: [
                { value: "ACTIVE", label: "Active" },
                { value: "IN_LAUNDRY", label: "In Laundry" },
                { value: "READY", label: "Ready" },
                { value: "MISSING", label: "Missing" },
              ],
            },
          ]}
        />
        <ItemsTable rows={rows} />
        <Pagination
          page={page}
          pageCount={pageCount}
          buildHref={(p) => `${basePath}?${qs}${qs ? "&" : ""}page=${p}`}
        />
      </Card>
    </div>
  );
}
