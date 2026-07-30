import Link from "next/link";
import { fmtNumber, fmtPct } from "@/lib/format";
import type { ProcessFlowStage } from "@/lib/queries";

const STAGE_HREF: Record<string, string> = {
  Receiving: "/operations/receiving",
  Sorting: "/operations",
  Washing: "/operations/washing",
  Drying: "/operations/drying",
  Folding: "/operations/folding",
  "Quality Check": "/operations",
  Ready: "/operations",
  Dispatch: "/operations/dispatch",
};

const ANOMALY_STYLES = {
  none: {
    card: "border-slate-200 bg-slate-50/80 hover:border-blue-300 hover:bg-white",
    badge: "bg-blue-50 text-blue-700 ring-blue-100",
    bar: "bg-[var(--status-blue)]",
    count: "text-slate-900",
  },
  amber: {
    card: "border-[var(--status-amber)]/40 bg-[var(--status-amber-bg)] hover:border-[var(--status-amber)] hover:bg-[var(--status-amber-bg)]",
    badge: "bg-[var(--status-amber-bg)] text-[var(--status-amber)] ring-[var(--status-amber)]/30",
    bar: "bg-[var(--status-amber)]",
    count: "text-[var(--status-amber)]",
  },
  red: {
    card: "border-[var(--status-red)]/40 bg-[var(--status-red-bg)] hover:border-[var(--status-red)] hover:bg-[var(--status-red-bg)]",
    badge: "bg-[var(--status-red-bg)] text-[var(--status-red)] ring-[var(--status-red)]/30",
    bar: "bg-[var(--status-red)]",
    count: "text-[var(--status-red)]",
  },
} as const;

export function ProcessFlow({ stages }: { stages: ProcessFlowStage[] }) {
  const maxCount = Math.max(...stages.map((s) => s.count), 1);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stages.map((s, i) => {
        const style = ANOMALY_STYLES[s.anomaly];
        const flowWidth = Math.max((s.count / maxCount) * 100, s.count > 0 ? 4 : 0);

        return (
          <Link
            key={s.key}
            href={STAGE_HREF[s.label] ?? "/operations"}
            className={`group relative rounded-xl border px-4 py-3.5 shadow-sm transition-all hover:shadow-md ${style.card}`}
            title={
              s.stuck > 0
                ? `${fmtNumber(s.stuck)} items past ${s.maxHours}h expected dwell`
                : `Expected dwell ≤ ${s.maxHours}h`
            }
          >
            <div className="flex items-start justify-between gap-2">
              <span
                className={`inline-flex h-6 min-w-6 items-center justify-center rounded-full text-[11px] font-semibold ring-1 ${style.badge}`}
              >
                {i + 1}
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 group-hover:text-blue-500">
                Stage
              </span>
            </div>
            <p className="mt-2.5 text-sm font-medium text-slate-600 group-hover:text-slate-800">{s.label}</p>
            <div className="mt-0.5 flex items-baseline gap-2">
              <p className={`text-xl font-semibold tabular-nums ${style.count}`}>{fmtNumber(s.count)}</p>
              <span className="text-xs font-medium tabular-nums text-slate-400">{fmtPct(s.pct)}</span>
            </div>

            {/* Proportional flow width — wider = more items (bottleneck visible) */}
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/80" aria-hidden>
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${style.bar}`}
                style={{ width: `${flowWidth}%` }}
              />
            </div>

            {s.stuck > 0 ? (
              <p
                className={`mt-2 text-[11px] font-medium ${
                  s.anomaly === "red" ? "text-[var(--status-red)]" : "text-[var(--status-amber)]"
                }`}
              >
                {fmtNumber(s.stuck)} stuck &gt; {s.maxHours}h
              </p>
            ) : (
              <p className="mt-2 text-[11px] text-slate-400">Within {s.maxHours}h SLA</p>
            )}
          </Link>
        );
      })}
    </div>
  );
}
