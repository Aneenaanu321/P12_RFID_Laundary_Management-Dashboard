"use client";

import { LucideIcon, ArrowUpRight, ArrowDownRight, GripVertical } from "lucide-react";
import { Sparkline } from "@/components/charts/Charts";
import type { KpiTarget, KpiTone } from "@/lib/kpi";

const TONE: Record<KpiTone, string> = {
  slate: "bg-[var(--status-gray-bg)] text-[var(--status-gray)]",
  green: "bg-[var(--status-green-bg)] text-[var(--status-green)]",
  amber: "bg-[var(--status-amber-bg)] text-[var(--status-amber)]",
  red: "bg-[var(--status-red-bg)] text-[var(--status-red)]",
  blue: "bg-[var(--status-blue-bg)] text-[var(--status-blue)]",
};

const BAR: Record<string, string> = {
  ok: "bg-[var(--status-green)]",
  warn: "bg-[var(--status-amber)]",
  bad: "bg-[var(--status-red)]",
  none: "bg-[var(--status-gray-ring)]",
};

export function KpiCard({
  icon: Icon,
  label,
  value,
  sub,
  trend,
  tone = "slate",
  sparkline,
  sparkColor,
  sparkKey,
  target,
  onExpand,
  dragHandleProps,
  enterDelay = 0,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  tone?: KpiTone;
  sparkline?: { date: string; value: number }[];
  sparkColor?: string;
  sparkKey?: string;
  target?: KpiTarget;
  onExpand?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  enterDelay?: number;
}) {
  return (
    <div
      role={onExpand ? "button" : undefined}
      tabIndex={onExpand ? 0 : undefined}
      onClick={onExpand}
      onKeyDown={(e) => {
        if (!onExpand) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onExpand();
        }
      }}
      className={`bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] shadow-sm p-4 h-full hover:border-[var(--muted-fg)] hover:shadow-md transition-all text-left w-full dash-enter ${
        onExpand ? "cursor-pointer" : ""
      }`}
      style={{ animationDelay: `${enterDelay}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {dragHandleProps && (
            <button
              type="button"
              className="text-[var(--muted-fg)] hover:text-[var(--muted)] -ml-1 p-0.5 cursor-grab active:cursor-grabbing"
              onClick={(e) => e.stopPropagation()}
              aria-label="Drag to reorder"
              {...dragHandleProps}
            >
              <GripVertical size={14} />
            </button>
          )}
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${TONE[tone]}`}>
            <Icon size={18} strokeWidth={2} />
          </div>
        </div>
        {trend !== undefined && (
          <span
            className={`inline-flex items-center gap-0.5 text-xs font-medium ${
              trend >= 0 ? "text-[var(--status-green)]" : "text-[var(--status-red)]"
            }`}
          >
            {trend >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(trend).toFixed(1)}%
          </span>
        )}
      </div>

      <div className="mt-3">
        <p className="text-2xl font-semibold text-[var(--foreground)] tabular-nums leading-tight">{value}</p>
        <p className="text-xs text-[var(--muted)] mt-1">{label}</p>
        {sub && <p className="text-[11px] text-[var(--muted-fg)] mt-0.5">{sub}</p>}
      </div>

      {sparkline && sparkline.length > 0 && (
        <div className="mt-3 -mx-1" onClick={(e) => e.stopPropagation()}>
          <Sparkline
            data={sparkline}
            dataKey="value"
            color={sparkColor ?? "var(--status-blue)"}
            height={40}
            id={sparkKey ?? label}
          />
        </div>
      )}

      {target && target.status !== "none" && (
        <div className="mt-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-[10px] text-[var(--muted-fg)] truncate">{target.label}</p>
            <p className="text-[10px] font-medium text-[var(--muted)] tabular-nums shrink-0">
              {Math.round(Math.min(target.pct, 999))}%
            </p>
          </div>
          <div className="h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${BAR[target.status]}`}
              style={{ width: `${Math.min(target.pct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] p-4 h-[180px] animate-pulse">
      <div className="flex justify-between">
        <div className="h-9 w-9 rounded-lg bg-[var(--surface-muted)]" />
        <div className="h-4 w-10 rounded bg-[var(--surface-muted)]" />
      </div>
      <div className="mt-4 h-7 w-24 rounded bg-[var(--surface-muted)]" />
      <div className="mt-2 h-3 w-28 rounded bg-[var(--surface-muted)]" />
      <div className="mt-4 h-10 w-full rounded bg-[var(--surface-hover)]" />
      <div className="mt-3 h-1.5 w-full rounded-full bg-[var(--surface-muted)]" />
    </div>
  );
}

export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}
