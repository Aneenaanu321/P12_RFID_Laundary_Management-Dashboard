import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  return (
    <ZoneOperationsPage
      zone="RECEIVING"
      title="Receiving"
      subtitle="Items arriving from customers and being scanned into the laundry."
      basePath="/operations/receiving"
      page={page}
    />
  );
}
