import { InventoryListPage } from "@/components/InventoryListPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; customerId?: string; status?: string }> }) {
  const sp = await searchParams;
  return (
    <InventoryListPage
      category="GOWN"
      title="Gowns"
      subtitle="Surgical gowns and patient gowns."
      basePath="/inventory/gowns"
      searchParams={sp}
    />
  );
}
