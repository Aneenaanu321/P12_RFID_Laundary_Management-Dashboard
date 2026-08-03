import { ZoneOperationsPage } from "@/components/ZoneOperationsPage";

type Sp = { page?: string; q?: string; customerId?: string; status?: string };

export default async function Page({ searchParams }: { searchParams: Promise<Sp> }) {
  const sp = await searchParams;
  return (
    <ZoneOperationsPage
      zone="DISPATCH"
      title="Dispatch"
      subtitle="Clean items packed and dispatched back to customers."
      basePath="/operations/dispatch"
      page={Number(sp.page ?? 1)}
      search={sp.q}
      customerId={sp.customerId}
      status={sp.status}
    />
  );
}
