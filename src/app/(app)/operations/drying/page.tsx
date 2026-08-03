import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

type Sp = { page?: string; q?: string; customerId?: string; status?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Sp> }) {
  const sp = await searchParams;
  return (
    <ZoneOperationsPage
      zone="DRYING"
      title="Drying"
      subtitle="Items currently in the drying stage."
      basePath="/operations/drying"
      page={Number(sp.page ?? 1)}
      search={sp.q}
      customerId={sp.customerId}
      status={sp.status}
    />
  );
}
