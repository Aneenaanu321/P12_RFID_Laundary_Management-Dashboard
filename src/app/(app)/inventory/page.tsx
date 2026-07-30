import { InventoryListPage } from "@/components/InventoryListPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; customerId?: string; status?: string }> }) {
  const sp = await searchParams;
  return (
    <InventoryListPage
      title="All Items"
      subtitle="Every RFID-tagged item across all customers and locations."
      basePath="/inventory"
      searchParams={sp}
    />
  );
}
