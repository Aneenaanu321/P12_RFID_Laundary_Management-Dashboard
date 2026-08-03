import { Suspense, type ReactNode } from "react";
import { DashboardFilters, FiltersSkeleton } from "@/components/DashboardFilters";
import { DashboardKpis } from "@/components/DashboardKpis";
import { DashboardCharts } from "@/components/DashboardCharts";
import { DashboardCustomers } from "@/components/DashboardCustomers";
import { DashboardLiveProvider } from "@/components/DashboardLiveProvider";
import { LiveAlertsWidget } from "@/components/LiveAlertsWidget";
import { ReaderHealthWidget } from "@/components/ReaderHealthWidget";
import { DashboardProcessFlow } from "@/components/DashboardProcessFlow";
import { SettlementSummaryWidget } from "@/components/SettlementSummaryWidget";
import { PinnedCustomersWidget } from "@/components/PinnedCustomersWidget";
import { RecentlyViewedWidget } from "@/components/RecentlyViewedWidget";
import { KpiGridSkeleton } from "@/components/KpiCard";
import { CardSkeleton } from "@/components/ui/Card";
import { CustomerTableSkeleton } from "@/components/CustomerOverviewTable";
import { SectionErrorBoundary } from "@/components/SectionErrorBoundary";
import { getCriticalAlerts } from "@/lib/queries";
import {
  getDashboardSections,
  getDashboardVariantLabel,
  type DashboardSectionId,
} from "@/lib/dashboard-layout";
import type { DashboardFilterState } from "@/lib/dashboard-filters";

function ChartsSkeleton() {
  return (
    <div className="space-y-6 mb-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton className="lg:col-span-2" height={280} />
        <CardSkeleton height={280} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <CardSkeleton height={280} />
        <CardSkeleton height={280} />
        <CardSkeleton height={280} />
      </div>
    </div>
  );
}

function SectionFallback({ height = 160 }: { height?: number }) {
  return <div className="mb-6 rounded-xl bg-[var(--surface-muted)] animate-pulse" style={{ height }} />;
}

const SECTION_TITLES: Record<DashboardSectionId, string> = {
  settlement: "Settlement summary",
  processFlow: "Process flow",
  systemHealth: "System health",
  kpis: "KPI cards",
  charts: "Trend charts",
  pinned: "Pinned customers",
  recent: "Recently viewed",
  customers: "Customer overview",
};

function wrapSection(id: DashboardSectionId, content: ReactNode) {
  return (
    <SectionErrorBoundary key={id} title={SECTION_TITLES[id]}>
      {content}
    </SectionErrorBoundary>
  );
}

function SystemHealthRow() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-6">
      <div className="lg:col-span-2">
        <Suspense fallback={<SectionFallback height={200} />}>
          <ReaderHealthWidget compact />
        </Suspense>
      </div>
      <div className="lg:col-span-3">
        <LiveAlertsWidget compact />
      </div>
    </div>
  );
}

function renderSection(
  id: DashboardSectionId,
  ctx: {
    filters: DashboardFilterState;
    searchParams: Record<string, string | string[] | undefined>;
    userId: string;
    role: string;
  }
): ReactNode {
  switch (id) {
    case "settlement":
      return wrapSection(
        id,
        <Suspense fallback={<SectionFallback height={280} />}>
          <SettlementSummaryWidget />
        </Suspense>
      );
    case "processFlow":
      return wrapSection(
        id,
        <Suspense fallback={<SectionFallback height={220} />}>
          <DashboardProcessFlow />
        </Suspense>
      );
    case "systemHealth":
      return wrapSection(id, <SystemHealthRow />);
    case "kpis":
      return wrapSection(
        id,
        <Suspense fallback={<KpiGridSkeleton />}>
          <DashboardKpis customerType={ctx.filters.type} role={ctx.role} />
        </Suspense>
      );
    case "charts":
      return wrapSection(
        id,
        <Suspense fallback={<ChartsSkeleton />}>
          <DashboardCharts searchParams={ctx.searchParams} />
        </Suspense>
      );
    case "pinned":
      return wrapSection(id, <PinnedCustomersWidget userId={ctx.userId} />);
    case "recent":
      return wrapSection(id, <RecentlyViewedWidget userId={ctx.userId} />);
    case "customers":
      return wrapSection(
        id,
        <Suspense fallback={<CustomerTableSkeleton />}>
          <DashboardCustomers
            customerType={ctx.filters.type}
            searchParams={ctx.searchParams}
          />
        </Suspense>
      );
    default:
      return null;
  }
}

export function DashboardView({
  role,
  userId,
  filters,
  searchParams,
}: {
  role: string;
  userId: string;
  filters: DashboardFilterState;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const sections = getDashboardSections(role);
  const variantLabel = getDashboardVariantLabel(role);
  const alerts = getCriticalAlerts(3).map((a) => ({
    id: a.id,
    severity: a.severity,
    message: a.message,
    category: a.category,
    createdAt: a.createdAt,
  }));

  return (
    <DashboardLiveProvider initialAlerts={alerts}>
      <p className="text-xs text-[var(--muted)] mb-4 -mt-2 no-print">{variantLabel}</p>

      <Suspense fallback={<FiltersSkeleton />}>
        <DashboardFilters />
      </Suspense>

      {sections.map((id) =>
        renderSection(id, { filters, searchParams, userId, role })
      )}
    </DashboardLiveProvider>
  );
}
