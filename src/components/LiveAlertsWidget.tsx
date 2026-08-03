"use client";

import Link from "next/link";
import { Bell, ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useDashboardLive, type LiveAlert } from "@/components/DashboardLiveProvider";
import { fmtDateTime, timeAgo } from "@/lib/format";

function AlertRow({ alert }: { alert: LiveAlert }) {
  return (
    <div className="flex items-start gap-2.5 px-4 py-2.5 hover:bg-[var(--surface-muted)] transition-colors">
      <StatusBadge status={alert.severity} />
      <div className="min-w-0 flex-1">
        <p className="text-[13px] text-[var(--foreground)] leading-snug line-clamp-2">{alert.message}</p>
        <p className="text-[10px] text-[var(--muted-fg)] mt-0.5">
          {timeAgo(alert.createdAt)} · {alert.category.replace(/_/g, " ")}
          <span className="hidden sm:inline"> · {fmtDateTime(alert.createdAt)}</span>
        </p>
      </div>
    </div>
  );
}

export function LiveAlertsWidget({ compact = false }: { compact?: boolean }) {
  const { connected, criticalAlerts } = useDashboardLive();

  return (
    <Card className={`h-full flex flex-col ${compact ? "" : "mb-6"}`}>
      <div className="flex items-start justify-between gap-3 px-4 pt-3.5 pb-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-[var(--foreground)]">Live Alerts</h3>
          <p className="text-[11px] text-[var(--muted)] mt-0.5">Critical alerts while this page is open</p>
        </div>
        <div className="flex items-center gap-2.5 shrink-0">
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)]">
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                connected ? "bg-[var(--status-green)] live-dot" : "bg-[var(--muted-fg)]"
              }`}
            />
            {connected ? "Live" : "Connecting"}
          </span>
          <Link
            href="/alerts"
            className="inline-flex items-center gap-0.5 text-xs font-medium text-[var(--status-blue)] hover:underline"
          >
            Center <ChevronRight size={12} />
          </Link>
        </div>
      </div>
      <div className="divide-y divide-[var(--border-subtle)] flex-1">
        {criticalAlerts.length === 0 ? (
          <div className="flex items-center gap-3 px-4 py-5 text-sm text-[var(--muted)]">
            <div className="h-8 w-8 rounded-lg bg-[var(--status-green-bg)] text-[var(--status-green)] flex items-center justify-center shrink-0">
              <Bell size={15} />
            </div>
            No critical alerts right now.
          </div>
        ) : (
          criticalAlerts.map((a) => <AlertRow key={a.id} alert={a} />)
        )}
      </div>
    </Card>
  );
}
