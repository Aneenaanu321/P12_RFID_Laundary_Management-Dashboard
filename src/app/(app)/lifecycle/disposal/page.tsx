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
    {
      lifecycleStatus: "DISPOSAL_REQUIRED",
      disposed: false,
      search: sp.q,
      customerId: sp.customerId,
    },
    page,
    25,
    "washCycles DESC"
  );

  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.customerId) params.set("customerId", sp.customerId);
  const qs = params.toString();

  return (
    <div>
      <PageHeader title="Disposal" subtitle={`${total.toLocaleString()} items have exceeded their maximum wash cycles and require disposal.`} />
      <Card>
        <CardHeader title="Disposal Required" />
        <TableFilters
          searchPlaceholder="Search EPC or item code..."
          exportResource="items"
          exportFilename="disposal-items"
          exportParams={{ lifecycleStatus: "DISPOSAL_REQUIRED", disposed: "0" }}
          filters={[
            { key: "customerId", label: "All Customers", options: customers.map((c) => ({ value: c.id, label: c.name })) },
          ]}
        />
        <LifecycleActionTable rows={rows} path="/lifecycle/disposal" />
        <Pagination
          page={page}
          pageCount={pageCount}
          buildHref={(p) => `/lifecycle/disposal?${qs}${qs ? "&" : ""}page=${p}`}
        />
      </Card>
    </div>
  );
}
