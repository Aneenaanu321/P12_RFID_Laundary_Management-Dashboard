import { PageHeader } from "@/components/layout/PageHeader";
import { DashboardView } from "@/components/DashboardView";
import { DashboardToolbar } from "@/components/DashboardToolbar";
import { DashboardTour } from "@/components/DashboardTour";
import { parseDashboardFilters } from "@/lib/dashboard-filters";
import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session) redirect("/login");

  const sp = await searchParams;
  const filters = parseDashboardFilters(sp);
  const fetchedAt = new Date().toISOString();

  return (
    <div className="dashboard-print-root">
      <div className="print-only-header" aria-hidden>
        <p className="print-only-brand">ibTech · RFID Linen Management</p>
        <h1>RFID Linen Management Overview</h1>
        <p>
          Management report · Generated {new Date(fetchedAt).toLocaleString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>

      <PageHeader
        title="RFID Linen Management Overview"
        subtitle="Real-time visibility across inventory, laundry operations and item lifecycle."
        action={<DashboardToolbar fetchedAt={fetchedAt} />}
        className="no-print"
      />

      <DashboardView
        role={session.role}
        userId={session.id}
        filters={filters}
        searchParams={sp}
      />

      <DashboardTour />
    </div>
  );
}
