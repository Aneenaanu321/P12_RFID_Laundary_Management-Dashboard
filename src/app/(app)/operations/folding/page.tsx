import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  return (
    <ZoneOperationsPage
      zone="FOLDING"
      title="Folding"
      subtitle="Items folded and awaiting quality check."
      basePath="/operations/folding"
      page={page}
    />
  );
}
