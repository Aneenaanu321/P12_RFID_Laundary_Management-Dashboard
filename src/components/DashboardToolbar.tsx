"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Printer, RefreshCw, HelpCircle } from "lucide-react";
import { fmtDateTime, timeAgo } from "@/lib/format";

const TOUR_EVENT = "rfid-dashboard-tour-start";

export function requestDashboardTour() {
  window.dispatchEvent(new CustomEvent(TOUR_EVENT));
}

export function DashboardToolbar({ fetchedAt }: { fetchedAt: string }) {
  const router = useRouter();
  const [updatedAt, setUpdatedAt] = useState(() => new Date(fetchedAt));
  const [refreshing, setRefreshing] = useState(false);
  const [, setTick] = useState(0);

  useEffect(() => {
    setUpdatedAt(new Date(fetchedAt));
  }, [fetchedAt]);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 15_000);
    return () => window.clearInterval(id);
  }, []);

  const refresh = useCallback(() => {
    setRefreshing(true);
    router.refresh();
    setUpdatedAt(new Date());
    window.setTimeout(() => setRefreshing(false), 600);
  }, [router]);

  return (
    <div className="flex flex-wrap items-center gap-2 no-print">
      <p className="text-xs text-[var(--muted)] tabular-nums mr-1" title={fmtDateTime(updatedAt)}>
        Last updated {timeAgo(updatedAt)}
      </p>
      <button
        type="button"
        onClick={refresh}
        disabled={refreshing}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] disabled:opacity-60 a11y-focus"
        aria-label="Refresh dashboard"
      >
        <RefreshCw size={13} className={refreshing ? "animate-spin" : undefined} aria-hidden />
        Refresh
      </button>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] a11y-focus"
        aria-label="Print dashboard"
      >
        <Printer size={13} aria-hidden />
        Print
      </button>
      <button
        type="button"
        onClick={requestDashboardTour}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] a11y-focus"
        aria-label="Start dashboard tour"
        title="Take a quick tour"
      >
        <HelpCircle size={13} aria-hidden />
        Tour
      </button>
    </div>
  );
}

export { TOUR_EVENT };
