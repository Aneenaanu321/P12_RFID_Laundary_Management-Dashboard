import { FiltersSkeleton } from "@/components/DashboardFilters";
import { KpiGridSkeleton } from "@/components/KpiCard";
import { CardSkeleton } from "@/components/ui/Card";
import { CustomerTableSkeleton } from "@/components/CustomerOverviewTable";

export default function DashboardLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-6 w-72 rounded bg-[var(--surface-muted)]" />
        <div className="h-4 w-96 max-w-full rounded bg-[var(--surface-muted)] mt-2" />
      </div>
      <FiltersSkeleton />
      <KpiGridSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <CardSkeleton className="lg:col-span-2" height={280} />
        <CardSkeleton height={280} />
      </div>
      <CustomerTableSkeleton />
    </div>
  );
}
