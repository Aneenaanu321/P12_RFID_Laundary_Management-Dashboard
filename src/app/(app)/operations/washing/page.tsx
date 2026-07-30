import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  return (
    <ZoneOperationsPage
      zone="WASHING"
      title="Washing"
      subtitle="Items currently in a wash cycle."
      basePath="/operations/washing"
      page={page}
    />
  );
}
