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
        className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-slate-100 px-5 py-4 flex items-start justify-between gap-3 z-10">
          <div>
            <h2 id="kpi-modal-title" className="text-lg font-semibold text-slate-900">
              {kpi.label}
            </h2>
            <p className="text-2xl font-semibold tabular-nums text-slate-900 mt-1">{kpi.value}</p>
            {kpi.sub && <p className="text-xs text-slate-500 mt-0.5">{kpi.sub}</p>}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href={kpi.href}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-50"
            >
              Open page <ExternalLink size={12} />
            </Link>
            <button
              type="button"
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          <section>
            <h3 className="text-sm font-semibold text-slate-800 mb-2">30-day trend</h3>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2">
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
              <h3 className="text-sm font-semibold text-slate-800 mb-2">By customer type</h3>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                {kpi.byCustomerType.length > 0 ? (
                  <BarHorizontal
                    data={kpi.byCustomerType}
                    dataKey="value"
                    nameKey="name"
                    color={kpi.sparkColor}
                    height={220}
                  />
                ) : (
                  <p className="text-xs text-slate-400 p-4">No breakdown available.</p>
                )}
              </div>
            </section>
            <section>
              <h3 className="text-sm font-semibold text-slate-800 mb-2">By item type</h3>
              <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-2">
                {kpi.byItemType.length > 0 ? (
                  <BarHorizontal
                    data={kpi.byItemType}
                    dataKey="value"
                    nameKey="name"
                    color={kpi.sparkColor}
                    height={220}
                  />
                ) : (
                  <p className="text-xs text-slate-400 p-4">No breakdown available.</p>
                )}
              </div>
            </section>
          </div>

          {kpi.target.status !== "none" && (
            <section className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Goal</p>
              <p className="text-sm text-slate-800 mt-1">{kpi.target.label}</p>
              <p className="text-xs text-slate-500 mt-1">
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
