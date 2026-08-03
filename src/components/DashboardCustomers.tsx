import { Users } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { CustomerOverviewTable } from "@/components/CustomerOverviewTable";
import { EmptyState } from "@/components/ui/EmptyState";
import { Pagination } from "@/components/ui/Pagination";
import { TableFilters } from "@/components/TableFilters";
import { getCustomersPage, getKpis } from "@/lib/queries";
import { CUSTOMER_TYPES } from "@/lib/dashboard-filters";

const PAGE_SIZE = 15;

function firstParam(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function buildPageHref(
  searchParams: Record<string, string | string[] | undefined>,
  page: number
) {
  const params = new URLSearchParams();
  for (const [key, raw] of Object.entries(searchParams)) {
    if (key === "page") continue;
    const value = firstParam(raw);
    if (value) params.set(key, value);
  }
  if (page > 1) params.set("page", String(page));
  const qs = params.toString();
  return qs ? `/?${qs}` : "/";
}

export async function DashboardCustomers({
  customerType,
  searchParams = {},
}: {
  customerType?: string;
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const pageRaw = Number(firstParam(searchParams.page) ?? "1");
  const page = Number.isFinite(pageRaw) && pageRaw > 0 ? Math.floor(pageRaw) : 1;
  const q = firstParam(searchParams.q);
  const { rows, total, page: safePage, pageCount } = getCustomersPage(
    customerType ?? "__all__",
    page,
    PAGE_SIZE,
    q
  );
  const { today } = getKpis(customerType);
  const totalItems = Number(today?.totalItems ?? 0);
  const typeLabel = CUSTOMER_TYPES.find((t) => t.value === customerType)?.label;

  if (totalItems === 0 && total === 0) {
    return (
      <Card id="view-customers" className="mb-6 dash-enter-slow [animation-delay:200ms]">
        <EmptyState
          icon={Users}
          title="Welcome — no inventory yet"
          subtitle="Demo data is missing. Locally run npm run seed. On Render, wait for the first boot seed to finish (several minutes), then refresh."
        />
      </Card>
    );
  }

  return (
    <Card id="view-customers" className="mb-6 dash-enter-slow [animation-delay:200ms]">
      <CardHeader
        title="Customer / Organization Overview"
        subtitle={
          typeLabel
            ? `${typeLabel} customers (${total}) — click a row to open their detail dashboard`
            : `${total} customers — click a row to open their detail dashboard`
        }
      />
      <TableFilters
        searchPlaceholder="Search customers..."
        filters={[]}
        exportResource="customers"
        exportFilename="customers"
        exportParams={{ type: customerType }}
      />
      <CustomerOverviewTable rows={rows} />
      <div className="no-print">
        <Pagination
          page={safePage}
          pageCount={pageCount}
          buildHref={(p) => buildPageHref(searchParams, p)}
        />
      </div>
    </Card>
  );
}
