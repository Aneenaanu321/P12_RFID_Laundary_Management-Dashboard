import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { EventsTable } from "@/components/EventsTable";
import { Pagination } from "@/components/ui/Pagination";
import { TableFilters } from "@/components/TableFilters";
import { getEventsPage, getCustomers, getReaders, EVENT_TYPES } from "@/lib/queries";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string; customerId?: string; eventType?: string; readerId?: string }>;
}) {
  const sp = await searchParams;
  const page = Number(sp.page ?? 1);
  const { rows, total, pageCount } = getEventsPage(
    { search: sp.q, customerId: sp.customerId, eventType: sp.eventType, readerId: sp.readerId },
    page,
    15
  );
  const customers = getCustomers();
  const readers = getReaders();

  const params = new URLSearchParams();
  if (sp.q) params.set("q", sp.q);
  if (sp.customerId) params.set("customerId", sp.customerId);
  if (sp.eventType) params.set("eventType", sp.eventType);
  if (sp.readerId) params.set("readerId", sp.readerId);
  const qs = params.toString();

  return (
    <div>
      <PageHeader title="Read History" subtitle={`${total.toLocaleString()} RFID reads — complete chronological history.`} />
      <Card>
        <TableFilters
          searchPlaceholder="Search item code..."
          exportResource="events"
          exportFilename="rfid-history"
          filters={[
            { key: "customerId", label: "All Customers", options: customers.map((c) => ({ value: c.id, label: c.name })) },
            { key: "eventType", label: "All Event Types", options: EVENT_TYPES.map((t) => ({ value: t, label: t })) },
            { key: "readerId", label: "All Readers", options: readers.map((r) => ({ value: r.id, label: r.code })) },
          ]}
        />
        <EventsTable rows={rows} />
        <Pagination
          page={page}
          pageCount={pageCount}
          buildHref={(p) => `/rfid/history?${qs}${qs ? "&" : ""}page=${p}`}
        />
      </Card>
    </div>
  );
}
