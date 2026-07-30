import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EventsTable } from "@/components/EventsTable";
import { Pagination } from "@/components/ui/Pagination";
import { getEventsPage } from "@/lib/queries";

export default async function Page({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Number((await searchParams).page ?? 1);
  const { rows, pageCount } = getEventsPage({}, page, 40);
  return (
    <div>
      <PageHeader title="Read History" subtitle="Complete chronological RFID read history across the estate." />
      <Card>
        <EventsTable rows={rows} />
        <Pagination page={page} pageCount={pageCount} buildHref={(p) => `/rfid/history?page=${p}`} />
      </Card>
    </div>
  );
}
