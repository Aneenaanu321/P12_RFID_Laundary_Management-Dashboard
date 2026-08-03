"use client";

import Link from "next/link";
import { X, ExternalLink } from "lucide-react";
import { TrendAreaChart, BarHorizontal } from "@/components/charts/Charts";
import type { KpiCardData } from "@/lib/kpi";

export function KpiModal({
  kpi,
  onClose,
}: {
  kpi: KpiCardData;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="kpi-modal-title"
    >
      <div
        className="bg-[var(--card-bg)] rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto border border-[var(--border-subtle)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-[var(--card-bg)] border-b border-[var(--border-subtle)] px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div>
            <h2 id="kpi-modal-title" className="text-lg font-semibold text-[var(--foreground)]">
              {kpi.label}
            </h2>
            <p className="text-2xl font-semibold tabular-nums text-[var(--foreground)] mt-1">{kpi.value}</p>
            {kpi.sub && <p className="text-xs text-[var(--muted)] mt-0.5">{kpi.sub}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={kpi.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[var(--muted)] border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--surface-muted)] a11y-focus"
            >
              Open page <ExternalLink size={12} aria-hidden />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--muted-fg)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] a11y-focus"
              aria-label="Close details"
            >
              <X size={18} aria-hidden />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">30-day trend</h3>
            <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 p-2">
              <TrendAreaChart
                data={kpi.series30}
                dataKey="value"
                xKey="dateLabel"
                color={kpi.sparkColor}
                height={220}
              />
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <section>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">By customer type</h3>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 p-2">
                {kpi.byCustomerType.length > 0 ? (
                  <BarHorizontal
                    data={kpi.byCustomerType}
                    dataKey="value"
                    nameKey="name"
                    color={kpi.sparkColor}
                    height={220}
                  />
                ) : (
                  <p className="text-xs text-[var(--muted-fg)] p-4">No breakdown available.</p>
                )}
              </div>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-[var(--foreground)] mb-2">By item type</h3>
              <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]/50 p-2">
                {kpi.byItemType.length > 0 ? (
                  <BarHorizontal
                    data={kpi.byItemType}
                    dataKey="value"
                    nameKey="name"
                    color={kpi.sparkColor}
                    height={220}
                  />
                ) : (
                  <p className="text-xs text-[var(--muted-fg)] p-4">No breakdown available.</p>
                )}
              </div>
            </section>
          </div>

          {kpi.target.status !== "none" && (
            <section className="rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] px-4 py-3">
              <p className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider">Goal</p>
              <p className="text-sm text-[var(--foreground)] mt-1">{kpi.target.label}</p>
              <p className="text-xs text-[var(--muted)] mt-1">
                Current progress: {Math.round(kpi.target.pct)}%
                {kpi.target.status === "ok" && " · On track"}
                {kpi.target.status === "warn" && " · Watch closely"}
                {kpi.target.status === "bad" && " · Needs attention"}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
