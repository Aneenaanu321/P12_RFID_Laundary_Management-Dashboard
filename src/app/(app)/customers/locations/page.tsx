import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchableLocationsTable } from "@/components/SearchableLocationsTable";
import { getCustomerLocations } from "@/lib/queries";

export default function Page() {
  const locations = getCustomerLocations();
  return (
    <div>
      <PageHeader title="Locations" subtitle="All customer sites and branches tracked in the system." />
      <Card>
        <SearchableLocationsTable locations={locations} />
      </Card>
    </div>
  );
}
