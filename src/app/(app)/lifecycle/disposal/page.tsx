import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { LifecycleActionTable } from "@/components/LifecycleActionTable";
import { Pagination } from "@/components/ui/Pagination";
import { getItemsPage } from "@/lib/queries";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  const { rows, total, pageCount } = getItemsPage({ lifecycleStatus: "DISPOSAL_REQUIRED", disposed: false }, page, 25, "washCycles DESC");

  return (
    <div>
      <PageHeader title="Disposal" subtitle={`${total.toLocaleString()} items have exceeded their maximum wash cycles and require disposal.`} />
      <Card>
        <CardHeader title="Disposal Required" />
        <LifecycleActionTable rows={rows} path="/lifecycle/disposal" />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `/lifecycle/disposal?page=${p}`} />
      </Card>
    </div>
  );
}
