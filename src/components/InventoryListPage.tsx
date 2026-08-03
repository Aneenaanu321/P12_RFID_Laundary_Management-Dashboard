import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { TableFilters } from "@/components/TableFilters";
import { getItemsPage, getCustomers, ItemFilters } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";

export async function InventoryListPage({
  category, title, subtitle, basePath, searchParams,
}: {
  category?: string; title: string; subtitle: string; basePath: string;
  searchParams: { page?: string; q?: string; customerId?: string; status?: string };
}) {
  const page = Number(searchParams.page ?? 1);
  const filters: ItemFilters = {
    category,
    search: searchParams.q,
    customerId: searchParams.customerId,
    currentStatus: searchParams.status,
  };
  const { rows, total, pageCount } = getItemsPage(filters, page, 15, "lastReadAt DESC");
  const customers = getCustomers();

  const params = new URLSearchParams();
  if (searchParams.q) params.set("q", searchParams.q);
  if (searchParams.customerId) params.set("customerId", searchParams.customerId);
  if (searchParams.status) params.set("status", searchParams.status);

  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} action={<span className="text-sm text-slate-500">{fmtNumber(total)} items</span>} />
      <Card>
        <TableFilters
          searchPlaceholder="Search EPC or item code..."
          exportResource="items"
          exportFilename={category ? `${category.toLowerCase()}-items` : "inventory-items"}
          exportParams={{ category }}
          filters={[
            { key: "customerId", label: "All Customers", options: customers.map((c) => ({ value: c.id, label: c.name })) },
            { key: "status", label: "All Statuses", options: [
              { value: "ACTIVE", label: "Active" },
              { value: "IN_LAUNDRY", label: "In Laundry" },
              { value: "READY", label: "Ready" },
              { value: "MISSING", label: "Missing" },
              { value: "DISPOSED", label: "Disposed" },
            ]},
          ]}
        />
        <ItemsTable rows={rows} />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `${basePath}?${params.toString()}${params.toString() ? "&" : ""}page=${p}`} />
      </Card>
    </div>
  );
}
