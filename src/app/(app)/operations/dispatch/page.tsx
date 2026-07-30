import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  return (
    <ZoneOperationsPage
      zone="DISPATCH"
      title="Dispatch"
      subtitle="Clean items packed and dispatched back to customers."
      basePath="/operations/dispatch"
      page={page}
    />
  );
}
