import { InventoryListPage } from "@/components/InventoryListPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string; q?: string; customerId?: string; status?: string }> }) {
  const sp = await searchParams;
  return (
    <InventoryListPage
      title="RFID Tags"
      subtitle="All tagged items sorted by most recent RFID read."
      basePath="/inventory/tags"
      searchParams={sp}
    />
  );
}
