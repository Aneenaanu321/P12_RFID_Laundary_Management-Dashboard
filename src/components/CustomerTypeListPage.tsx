import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { SearchableCustomerOverview } from "@/components/SearchableCustomerOverview";
import { getCustomers } from "@/lib/queries";

export function CustomerTypeListPage({ type, title, subtitle }: { type?: string; title: string; subtitle: string }) {
  const rows = getCustomers(type);
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <SearchableCustomerOverview rows={rows} />
      </Card>
    </div>
  );
}
