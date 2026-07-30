import Link from "next/link";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

export function KpiCard({
  icon: Icon, label, value, sub, trend, href, tone = "slate",
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  href?: string;
  tone?: "slate" | "green" | "amber" | "red" | "blue";
}) {
  const toneClasses: Record<string, string> = {
    slate: "bg-slate-50 text-slate-600",
    green: "bg-[var(--status-green-bg)] text-[var(--status-green)]",
    amber: "bg-[var(--status-amber-bg)] text-[var(--status-amber)]",
    red: "bg-[var(--status-red-bg)] text-[var(--status-red)]",
    blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue)]",
  };

  const content = (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 h-full hover:border-slate-300 hover:shadow-md transition-all">
      <div className="flex items-start justify-between">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${toneClasses[tone]}`}>
          <Icon size={18} strokeWidth={2} />
        </div>
        {trend !== undefined && (
          <span className={`inline-flex items-center gap-0.5 text-xs font-medium ${trend >= 0 ? "text-green-600" : "text-red-600"}`}>
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>
      <div className="mt-3">
        <p className="text-2xl font-semibold text-slate-900 tabular-nums leading-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-1">{label}</p>
        {sub && <p className="text-[11px] text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );

  return href ? <Link href={href} className="block h-full">{content}</Link> : content;
}
