import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { LifecycleActionTable } from "@/components/LifecycleActionTable";
import { Pagination } from "@/components/ui/Pagination";
import { TableFilters } from "@/components/TableFilters";
import { getItemsPage, getCustomers } from "@/lib/queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; customerId?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const customers = getCustomers();
  const { rows, total, pageCount } = getItemsPage(
    { disposed: true, search: sp.q, customerId: sp.customerId },
    page,
    25,
    "disposedAt DESC"
  );

  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.customerId) params.set("customerId", sp.customerId);
  const qs = params.toString();

  return (
    <div>
      <PageHeader title="Replacement" subtitle={`${total.toLocaleString()} disposed items — request replacement stock to maintain committed inventory levels.`} />
      <Card>
        <CardHeader title="Disposed Items Awaiting Replacement" />
        <TableFilters
          searchPlaceholder="Search EPC or item code..."
          exportResource="items"
          exportFilename="replacement-items"
          exportParams={{ disposed: "1" }}
          filters={[
            { key: "customerId", label: "All Customers", options: customers.map((c) => ({ value: c.id, label: c.name })) },
          ]}
        />
        <LifecycleActionTable rows={rows} path="/lifecycle/replacement" showDisposeActions={false} />
        <Pagination
          page={page}
          pageCount={pageCount}
          buildHref={(p) => `/lifecycle/replacement?${qs}${qs ? "&" : ""}page=${p}`}
        />
      </Card>
    </div>
  );
}
