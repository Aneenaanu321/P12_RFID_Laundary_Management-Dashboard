"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDashboardLive, type LiveAlert } from "@/components/DashboardLiveProvider";
import { fmtDateTime, timeAgo } from "@/lib/format";

function AlertRow({ alert }: { alert: LiveAlert }) {
  return (
    <div className="flex items-start gap-3 px-5 py-3 hover:bg-[var(--surface-muted)] transition-colors">
      <StatusBadge status={alert.severity} />
      <div className="min-w-0 flex-1">
        <p className="text-sm text-[var(--foreground)] leading-snug line-clamp-2">{alert.message}</p>
        <p className="text-[11px] text-[var(--muted-fg)] mt-1">
          {timeAgo(alert.createdAt)} · {alert.category.replace(/_/g, " ")}
          <span className="text-[var(--muted-fg)]/70"> · {fmtDateTime(alert.createdAt)}</span>
        </p>
      </div>
    </div>
  );
}

export function LiveAlertsWidget() {
  const { connected, criticalAlerts } = useDashboardLive();

  return (
    <Card className="mb-6">
      <CardHeader
        title="Live Alerts"
        subtitle="Top critical alerts — updates while this page is open"
        action={
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)]">
              <span className={`h-1.5 w-1.5 rounded-full ${connected ? "bg-[var(--status-green)] live-dot" : "bg-[var(--muted-fg)]"}`} />
              {connected ? "Live" : "Connecting"}
            </span>
            <Link
              href="/alerts"
              className="inline-flex items-center gap-1 text-xs font-medium text-[var(--status-blue)] hover:underline"
            >
              Alert center <ChevronRight size={13} />
            </Link>
          </div>
        }
      />
      <div className="divide-y divide-[var(--border-subtle)]">
        {criticalAlerts.length === 0 ? (
          <div className="flex items-center gap-3 px-5 py-6 text-sm text-[var(--muted)]">
            <div className="h-9 w-9 rounded-lg bg-[var(--status-green-bg)] text-[var(--status-green)] flex items-center justify-center">
              <Bell size={16} />
            </div>
            No critical alerts right now. Everything looks healthy.
          </div>
        ) : (
          criticalAlerts.map((a) => <AlertRow key={a.id} alert={a} />)
        )}
      </div>
    </Card>
  );
}
