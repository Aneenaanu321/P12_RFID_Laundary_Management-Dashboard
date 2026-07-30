import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  return (
    <ZoneOperationsPage
      zone="DRYING"
      title="Drying"
      subtitle="Items currently in the drying stage."
      basePath="/operations/drying"
      page={page}
    />
  );
}
