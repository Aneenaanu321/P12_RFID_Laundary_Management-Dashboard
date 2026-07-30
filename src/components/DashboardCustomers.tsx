import { Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { CustomerOverviewTable } from "@/components/CustomerOverviewTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { getCustomers, getKpis } from "@/lib/queries";
import { CUSTOMER_TYPES } from "@/lib/dashboard-filters";

export async function DashboardCustomers({
  customerType,
}: {
  customerType?: string;
}) {
  const customers = getCustomers(customerType);
  const { today } = getKpis(customerType);
  const totalItems = Number(today?.totalItems ?? 0);
  const typeLabel = CUSTOMER_TYPES.find((t) => t.value === customerType)?.label;

  if (totalItems === 0 && customers.length === 0) {
    return (
      <Card className="dash-enter-slow [animation-delay:200ms]">
        <EmptyState
          icon={Users}
          title="Welcome — no inventory yet"
          subtitle="Register RFID items and customers to populate KPIs, trends, and this overview."
        />
      </Card>
    );
  }

  return (
    <Card className="dash-enter-slow [animation-delay:200ms]">
      <CardHeader
        title="Customer / Organization Overview"
        subtitle={
          typeLabel
            ? `${typeLabel} customers — click a row to open their detail dashboard`
            : "Click a customer to open their detail dashboard"
        }
      />
      <CustomerOverviewTable rows={customers} />
    </Card>
  );
}
