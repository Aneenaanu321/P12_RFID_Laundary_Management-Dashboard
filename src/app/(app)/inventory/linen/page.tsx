import { InventoryListPage } from "@/components/InventoryListPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; customerId?: string; status?: string }> }) {
  const sp = await searchParams;
  return (
    <InventoryListPage
      category="LINEN"
      title="Linen"
      subtitle="Bedsheets and blankets."
      basePath="/inventory/linen"
      searchParams={sp}
    />
  );
}
