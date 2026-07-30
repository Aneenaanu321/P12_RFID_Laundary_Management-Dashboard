import { Suspense } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardFilters, FiltersSkeleton } from "@/components/DashboardFilters";
import { DashboardKpis } from "@/components/DashboardKpis";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardCustomers } from "@/components/DashboardCustomers";
import { KpiGridSkeleton } from "@/components/KpiCard";
import { CardSkeleton } from "@/components/ui/Card";
import { CustomerTableSkeleton } from "@/components/CustomerOverviewTable";
import { parseDashboardFilters } from "@/lib/dashboard-filters";

function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <CardSkeleton className="lg:col-span-2" height={280} />
      <CardSkeleton height={280} />
    </div>
  );
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filters = parseDashboardFilters(sp);

  return (
    <div>
      <PageHeader
        title="RFID Linen Management Overview"
        subtitle="Real-time visibility across inventory, laundry operations and item lifecycle."
      />

      <Suspense fallback={<FiltersSkeleton />}>
        <DashboardFilters />
      </Suspense>

      <Suspense fallback={<KpiGridSkeleton />}>
        <DashboardKpis customerType={filters.type} />
      </Suspense>

      <Suspense fallback={<ChartsSkeleton />}>
        <DashboardCharts searchParams={sp} />
      </Suspense>

      <Suspense fallback={<CustomerTableSkeleton />}>
        <DashboardCustomers customerType={filters.type} />
      </Suspense>
    </div>
  );
}
