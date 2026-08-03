import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { SearchableReadersTable } from "@/components/SearchableReadersTable";
import { getReaders } from "@/lib/queries";

export default function Page() {
  const readers = getReaders();
  return (
    <div>
      <PageHeader title="RFID Readers" subtitle="Manage reader inventory, zones and firmware." />
      <Card>
        <CardHeader title={`${readers.length} Readers`} />
        <SearchableReadersTable readers={readers} />
      </Card>
    </div>
  );
}
