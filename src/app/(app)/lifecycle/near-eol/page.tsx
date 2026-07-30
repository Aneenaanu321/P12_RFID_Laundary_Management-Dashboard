import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { LifecycleActionTable } from "@/components/LifecycleActionTable";
import { Pagination } from "@/components/ui/Pagination";
import { getItemsPage } from "@/lib/queries";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  const { rows, total, pageCount } = getItemsPage({ lifecycleStatus: "NEAR_END_OF_LIFE", disposed: false }, page, 25, "washCycles DESC");

  return (
    <div>
      <PageHeader title="Near End of Life" subtitle={`${total.toLocaleString()} items are approaching their configured wash-cycle limit.`} />
      <Card>
        <CardHeader title="Items Near End of Life" />
        <LifecycleActionTable rows={rows} path="/lifecycle/near-eol" />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `/lifecycle/near-eol?page=${p}`} />
      </Card>
    </div>
  );
}
