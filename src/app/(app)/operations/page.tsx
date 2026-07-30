import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProcessFlow } from "@/components/ProcessFlow";
import { ItemsTable } from "@/components/ItemsTable";
import { Pagination } from "@/components/ui/Pagination";
import { getProcessFlow, getItemsPage } from "@/lib/queries";

export default async function OperationsPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const stages = getProcessFlow();
  const { rows, pageCount } = getItemsPage({ currentStatus: "IN_LAUNDRY" }, page, 20, "lastReadAt DESC");

  return (
    <div>
      <PageHeader title="Laundry Operations" subtitle="Live view of every item currently moving through the wash process." />
      <Card className="mb-6">
        <CardHeader title="Process Flow" />
        <div className="px-5 pb-5"><ProcessFlow stages={stages} /></div>
      </Card>
      <Card>
        <CardHeader title="Items Currently In Laundry" />
        <ItemsTable rows={rows} />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `/operations?page=${p}`} />
      </Card>
    </div>
  );
}
