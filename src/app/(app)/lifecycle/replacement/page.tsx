import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { LifecycleActionTable } from "@/components/LifecycleActionTable";
import { Pagination } from "@/components/ui/Pagination";
import { getItemsPage } from "@/lib/queries";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  const { rows, total, pageCount } = getItemsPage({ disposed: true }, page, 25, "disposedAt DESC");

  return (
    <div>
      <PageHeader title="Replacement" subtitle={`${total.toLocaleString()} disposed items — request replacement stock to maintain committed inventory levels.`} />
      <Card>
        <CardHeader title="Disposed Items Awaiting Replacement" />
        <LifecycleActionTable rows={rows} path="/lifecycle/replacement" showDisposeActions={false} />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `/lifecycle/replacement?page=${p}`} />
      </Card>
    </div>
  );
}
