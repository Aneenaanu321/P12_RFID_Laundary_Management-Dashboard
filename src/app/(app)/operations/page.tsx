import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProcessFlow } from "@/components/ProcessFlow";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { TableFilters } from "@/components/TableFilters";
import { getProcessFlow, getItemsPage, getCustomers } from "@/lib/queries";

export default async function OperationsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; customerId?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const stages = getProcessFlow();
  const customers = getCustomers();
  const { rows, total, pageCount } = getItemsPage(
    {
      currentStatus: sp.status || "IN_LAUNDRY",
      search: sp.q,
      customerId: sp.customerId,
    },
    page,
    15,
    "lastReadAt DESC"
  );

  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.customerId) params.set("customerId", sp.customerId);
  if (sp.status) params.set("status", sp.status);
  const qs = params.toString();

  return (
    <div>
      <PageHeader title="Laundry Operations" subtitle="Live view of every item currently moving through the wash process." />
      <Card className="mb-6">
        <CardHeader title="Process Flow" />
        <div className="px-5 pb-5"><ProcessFlow stages={stages} /></div>
      </Card>
      <Card>
        <CardHeader title="Items Currently In Laundry" subtitle={`${total.toLocaleString()} matching`} />
        <TableFilters
          searchPlaceholder="Search EPC or item code..."
          exportResource="items"
          exportFilename="in-laundry-items"
          exportParams={{ status: sp.status || "IN_LAUNDRY" }}
          filters={[
            { key: "customerId", label: "All Customers", options: customers.map((c) => ({ value: c.id, label: c.name })) },
            {
              key: "status",
              label: "In Laundry (default)",
              options: [
                { value: "IN_LAUNDRY", label: "In Laundry" },
                { value: "ACTIVE", label: "Active" },
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
          buildHref={(p) => `/operations?${qs}${qs ? "&" : ""}page=${p}`}
        />
      </Card>
    </div>
  );
}
