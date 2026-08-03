import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { ProcessFlow } from "@/components/ProcessFlow";
import { getProcessFlow } from "@/lib/queries";

export async function DashboardProcessFlow() {
  const stages = getProcessFlow();
  return (
    <Card id="tour-process-flow" className="mb-6">
      <CardHeader
        title="Laundry Process Flow"
        subtitle="Items currently in each stage — bottlenecks highlighted"
        action={
          <Link href="/operations" className="text-xs font-medium text-[var(--status-blue)] hover:underline no-print">
            Open operations
          </Link>
        }
      />
      <div className="px-5 pb-5">
        <ProcessFlow stages={stages} />
      </div>
    </Card>
  );
}
