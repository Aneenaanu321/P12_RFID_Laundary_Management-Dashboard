import { type ReactNode } from "react";
import { DashboardLiveProvider } from "@/components/DashboardLiveProvider";
import { LiveAlertsWidget } from "@/components/LiveAlertsWidget";
import { getCriticalAlerts } from "@/lib/queries";

/** Server wrapper: seeds critical alerts and hosts the dashboard SSE bridge. */
export function DashboardRealtime({ children }: { children: ReactNode }) {
  const alerts = getCriticalAlerts(3).map((a) => ({
    id: a.id,
    severity: a.severity,
    message: a.message,
    category: a.category,
    createdAt: a.createdAt,
  }));

  return (
    <DashboardLiveProvider initialAlerts={alerts}>
      {children}
      <LiveAlertsWidget />
    </DashboardLiveProvider>
  );
}
