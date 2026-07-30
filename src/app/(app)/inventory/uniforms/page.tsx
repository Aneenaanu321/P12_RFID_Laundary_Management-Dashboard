import { InventoryListPage } from "@/components/InventoryListPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; customerId?: string; status?: string }> }) {
  const sp = await searchParams;
  return (
    <InventoryListPage
      category="UNIFORM"
      title="Uniforms"
      subtitle="Staff uniforms across all customers."
      basePath="/inventory/uniforms"
      searchParams={sp}
    />
  );
}
