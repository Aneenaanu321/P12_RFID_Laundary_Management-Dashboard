import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardHeader } from "@/components/ui/Card";
import { BarHorizontal, BarVertical } from "@/components/charts/Charts";
import { getInventoryValueByCustomer, getMissingByCustomer, getAvgCyclesByCustomer } from "@/lib/queries";

export default function Page() {
  const value = getInventoryValueByCustomer();
  const missing = getMissingByCustomer();
  const avgCycles = getAvgCyclesByCustomer().map((c) => ({ ...c, avgCycles: Math.round(c.avgCycles * 10) / 10 }));

  return (
    <div>
      <PageHeader title="Customer Analytics" subtitle="Inventory, loss and utilization compared across customers." />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader title="Customer Inventory" subtitle="Total inventory value by customer" />
          <div className="px-3 pb-3"><BarHorizontal data={value} dataKey="v" nameKey="customerName" color="var(--status-blue)" /></div>
        </Card>
        <Card>
          <CardHeader title="Customer Loss Comparison" />
          <div className="px-3 pb-3"><BarHorizontal data={missing} dataKey="c" nameKey="customerName" color="var(--status-red)" /></div>
        </Card>
        <Card className="lg:col-span-2">
          <CardHeader title="Average Wash Cycles by Customer" />
          <div className="px-3 pb-3"><BarVertical data={avgCycles} dataKey="avgCycles" nameKey="customerName" color="#0ea5a4" /></div>
        </Card>
      </div>
    </div>
  );
}
