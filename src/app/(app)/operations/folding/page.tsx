import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

type Sp = { page?: string; q?: string; customerId?: string; status?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Sp> }) {
  const sp = await searchParams;
  return (
    <ZoneOperationsPage
      zone="FOLDING"
      title="Folding"
      subtitle="Items folded and awaiting quality check."
      basePath="/operations/folding"
      page={Number(sp.page ?? 1)}
      search={sp.q}
      customerId={sp.customerId}
      status={sp.status}
    />
  );
}
