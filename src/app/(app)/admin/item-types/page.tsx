import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchableItemTypesTable } from "@/components/SearchableItemTypesTable";
import { getItemTypes } from "@/lib/queries";

export default function Page() {
  const itemTypes = getItemTypes();
  return (
    <div>
      <PageHeader title="Item Types" subtitle="The catalogue of linen item types tracked across the system." />
      <Card>
        <SearchableItemTypesTable itemTypes={itemTypes} mode="catalog" />
      </Card>
    </div>
  );
}
