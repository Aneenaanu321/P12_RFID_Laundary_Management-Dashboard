import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { CustomerOverviewTable } from "@/components/CustomerOverviewTable";
import { getCustomers } from "@/lib/queries";

export function CustomerTypeListPage({ type, title, subtitle }: { type?: string; title: string; subtitle: string }) {
  const rows = getCustomers(type);
  return (
    <div>
      <PageHeader title={title} subtitle={subtitle} />
      <Card>
        <CustomerOverviewTable rows={rows} />
      </Card>
    </div>
  );
}
