import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { LiveFeed } from "@/components/LiveFeed";
import { getEventsPage } from "@/lib/queries";

export default function Page() {
  const { rows } = getEventsPage({}, 1, 25);
  const initial = rows.map((r) => ({
    id: r.id, itemCode: r.itemCode, itemTypeName: r.itemTypeName, customerName: r.customerName,
    zone: r.zone, eventType: r.eventType, readerCode: r.readerCode, timestamp: r.timestamp,
  }));

  return (
    <div>
      <PageHeader title="Live RFID Tracking" subtitle="Real-time stream of RFID tag reads across every reader in the network." />
      <Card>
        <CardHeader title="Live Feed" subtitle="New reads stream in automatically via Server-Sent Events" />
        <LiveFeed initial={initial} />
      </Card>
    </div>
  );
}
