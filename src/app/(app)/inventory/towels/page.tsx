import { InventoryListPage } from "@/components/InventoryListPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; customerId?: string; status?: string }> }) {
  const sp = await searchParams;
  return (
    <InventoryListPage
      category="TOWEL"
      title="Towels"
      subtitle="Gym towels, bath towels and hand towels."
      basePath="/inventory/towels"
      searchParams={sp}
    />
  );
}
