"use client";

import Link from "next/link";
import {
  LucideIcon,
  ArrowUpRight,
  ArrowDownRight,
  GripVertical,
  Package,
  Users,
  WashingMachine,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  XOctagon,
  Coins,
  Timer,
  Gauge,
  BadgeDollarSign,
  Radio,
  Wifi,
  WifiOff,
  Activity,
  TrendingDown,
  CalendarX,
  Maximize2,
} from "lucide-react";
import type { KpiTarget, KpiTone } from "@/lib/kpi";

export const KPI_ICONS: Record<string, LucideIcon> = {
  Package,
  Users,
  WashingMachine,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  XOctagon,
  Coins,
  Timer,
  Gauge,
  BadgeDollarSign,
  Radio,
  Wifi,
  WifiOff,
  Activity,
  TrendingDown,
  CalendarX,
  ArrowDownRight,
};

const TONE: Record<KpiTone, string> = {
  slate: "text-[var(--status-gray)]",
  green: "text-[var(--status-green)]",
  amber: "text-[var(--status-amber)]",
  red: "text-[var(--status-red)]",
  blue: "text-[var(--status-blue)]",
};

const BAR: Record<string, string> = {
  ok: "bg-[var(--status-green)]",
  warn: "bg-[var(--status-amber)]",
  bad: "bg-[var(--status-red)]",
  none: "bg-[var(--status-gray-ring)]",
};

export function KpiCard({
  icon,
  label,
  value,
  sub,
  trend,
  tone = "slate",
  sparkline: _sparkline,
  sparkColor: _sparkColor,
  sparkKey,
  target,
  href,
  onExpand,
  dragHandleProps,
  enterDelay = 0,
}: {
  icon: string;
  label: string;
  value: string;
  sub?: string;
  trend?: number;
  tone?: KpiTone;
  sparkline?: { date: string; value: number }[];
  sparkColor?: string;
  sparkKey?: string;
  target?: KpiTarget;
  href?: string;
  onExpand?: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  enterDelay?: number;
}) {
  const Icon = KPI_ICONS[icon] ?? Package;
  const clickable = Boolean(href || onExpand);
  const cardLabel = [
    `${label}: ${value}`,
    sub,
    trend !== undefined ? `${trend >= 0 ? "up" : "down"} ${Math.abs(trend).toFixed(1)} percent` : null,
    href ? `Open ${label}` : onExpand ? "Activate for details" : null,
  ]
    .filter(Boolean)
    .join(". ");

  const className = `group block bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] p-4 h-full hover:shadow-sm transition-shadow text-left w-full dash-enter ${
    clickable ? "cursor-pointer a11y-focus" : ""
  }`;

  const body = (
    <>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          {dragHandleProps && (
            <button
              type="button"
              className="text-[var(--muted-fg)] hover:text-[var(--muted)] p-0.5 cursor-grab active:cursor-grabbing a11y-focus rounded"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
              aria-label={`Drag to reorder ${label}`}
              {...dragHandleProps}
            >
              <GripVertical size={12} aria-hidden />
            </button>
          )}
          <Icon size={15} className={`shrink-0 ${TONE[tone]}`} aria-hidden />
          <p className="text-sm text-[var(--muted)] truncate">{label}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                trend >= 0 ? "text-[var(--status-green)]" : "text-[var(--status-red)]"
              }`}
              aria-label={`${trend >= 0 ? "Up" : "Down"} ${Math.abs(trend).toFixed(1)} percent`}
            >
              {trend >= 0 ? <ArrowUpRight size={12} aria-hidden /> : <ArrowDownRight size={12} aria-hidden />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {onExpand && (
            <button
              type="button"
              className="h-6 w-6 inline-flex items-center justify-center rounded-md text-[var(--muted-fg)] hover:bg-[var(--surface-muted)] a11y-focus opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label={`Expand details for ${label}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onExpand();
              }}
            >
              <Maximize2 size={12} aria-hidden />
            </button>
          )}
        </div>
      </div>

      <p className="mt-3 text-2xl font-semibold text-[var(--foreground)] tabular-nums leading-none truncate">
        {value}
      </p>
      {sub && <p className="mt-1.5 text-xs text-[var(--muted-fg)] truncate">{sub}</p>}

      {target && target.status !== "none" && (
        <div className="mt-3" aria-label={`${target.label}: ${Math.round(Math.min(target.pct, 999))} percent of target`}>
          <div className="flex justify-between gap-2 mb-1">
            <span className="text-[11px] text-[var(--muted-fg)] truncate">{target.label}</span>
            <span className="text-[11px] text-[var(--muted)] tabular-nums">
              {Math.round(Math.min(target.pct, 999))}%
            </span>
          </div>
          <div className="h-1 rounded-full bg-[var(--surface-muted)] overflow-hidden" aria-hidden>
            <div
              className={`h-full rounded-full ${BAR[target.status]}`}
              style={{ width: `${Math.min(target.pct, 100)}%` }}
            />
          </div>
        </div>
      )}
    </>
  );

  const sharedProps = {
    className,
    style: { animationDelay: `${enterDelay}ms` } as React.CSSProperties,
    "data-testid": sparkKey ? `kpi-${sparkKey}` : "kpi-card",
    "data-kpi-label": label,
    "aria-label": clickable ? cardLabel : undefined,
  };

  if (href) {
    return (
      <Link href={href} {...sharedProps}>
        {body}
      </Link>
    );
  }

  if (onExpand) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onExpand}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onExpand();
          }
        }}
        {...sharedProps}
      >
        {body}
      </div>
    );
  }

  return <div {...sharedProps}>{body}</div>;
}

export function KpiCardSkeleton() {
  return (
    <div className="bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] p-4 h-[108px] animate-pulse">
      <div className="h-4 w-32 rounded bg-[var(--surface-muted)]" />
      <div className="mt-3 h-7 w-20 rounded bg-[var(--surface-muted)]" />
      <div className="mt-3 h-1 w-full rounded-full bg-[var(--surface-muted)]" />
    </div>
  );
}

export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-3.5 mb-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}
