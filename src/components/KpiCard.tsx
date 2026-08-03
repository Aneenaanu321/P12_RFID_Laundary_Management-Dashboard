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
import { Sparkline } from "@/components/charts/Charts";
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
  icon,
  label,
  value,
  sub,
  trend,
  tone = "slate",
  sparkline,
  sparkColor,
  sparkKey,
  target,
  href,
  onExpand,
  dragHandleProps,
  enterDelay = 0,
}: {
  /** Lucide icon name — must be a plain string (RSC-safe). */
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
  /** Navigate to the related page/tab when the card is clicked. */
  href?: string;
  /** Optional detail modal (dashboard). Shown as a secondary control when href is set. */
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

  const className = `group relative block bg-[var(--card-bg)] rounded-lg border border-[var(--border-subtle)] shadow-sm p-2.5 sm:p-3 h-full hover:border-[var(--accent-500)] hover:shadow-md transition-all text-left w-full dash-enter interactive-card ${
    clickable ? "cursor-pointer a11y-focus" : ""
  }`;

  const body = (
    <>
      <div className="flex items-start justify-between gap-1.5">
        <div className="flex items-center gap-1.5 min-w-0">
          {dragHandleProps && (
            <button
              type="button"
              className="text-[var(--muted-fg)] hover:text-[var(--muted)] -ml-0.5 p-0.5 cursor-grab active:cursor-grabbing a11y-focus rounded"
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
          <div className={`h-7 w-7 rounded-md flex items-center justify-center shrink-0 ${TONE[tone]}`} aria-hidden>
            <Icon size={14} strokeWidth={2} />
          </div>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {trend !== undefined && (
            <span
              className={`inline-flex items-center gap-0.5 text-[10px] sm:text-[11px] font-medium ${
                trend >= 0 ? "text-[var(--status-green)]" : "text-[var(--status-red)]"
              }`}
              aria-label={`${trend >= 0 ? "Up" : "Down"} ${Math.abs(trend).toFixed(1)} percent`}
            >
              {trend >= 0 ? <ArrowUpRight size={11} aria-hidden /> : <ArrowDownRight size={11} aria-hidden />}
              {Math.abs(trend).toFixed(1)}%
            </span>
          )}
          {onExpand && (
            <button
              type="button"
              className="h-6 w-6 inline-flex items-center justify-center rounded-md text-[var(--muted-fg)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] a11y-focus opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              aria-label={`Expand details for ${label}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onExpand();
              }}
            >
              <Maximize2 size={11} aria-hidden />
            </button>
          )}
          {href && (
            <ArrowUpRight
              size={12}
              aria-hidden
              className="text-[var(--muted-fg)] opacity-0 group-hover:opacity-100 transition-opacity"
            />
          )}
        </div>
      </div>

      <div className="mt-1.5 sm:mt-2">
        <p className="text-lg sm:text-xl font-semibold text-[var(--foreground)] tabular-nums leading-tight truncate">
          {value}
        </p>
        <p className="text-[10px] sm:text-[11px] text-[var(--muted)] mt-0.5 line-clamp-2">{label}</p>
        {sub && (
          <p className="text-[9px] sm:text-[10px] text-[var(--muted-fg)] mt-0.5 truncate">{sub}</p>
        )}
      </div>

      {sparkline && sparkline.length > 0 && (
        <div
          className="mt-1.5 sm:mt-2 -mx-0.5 hidden min-[380px]:block"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          role="img"
          aria-label={`${label} 7-day sparkline`}
        >
          <Sparkline
            data={sparkline}
            dataKey="value"
            color={sparkColor ?? "var(--status-blue)"}
            height={22}
            id={sparkKey ?? label}
          />
        </div>
      )}

      {target && target.status !== "none" && (
        <div className="mt-2" aria-label={`${target.label}: ${Math.round(Math.min(target.pct, 999))} percent of target`}>
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <p className="text-[9px] text-[var(--muted-fg)] truncate">{target.label}</p>
            <p className="text-[9px] font-medium text-[var(--muted)] tabular-nums shrink-0">
              {Math.round(Math.min(target.pct, 999))}%
            </p>
          </div>
          <div className="h-1 rounded-full bg-[var(--surface-muted)] overflow-hidden" aria-hidden>
            <div
              className={`h-full rounded-full transition-all ${BAR[target.status]}`}
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
    <div className="bg-[var(--card-bg)] rounded-lg border border-[var(--border-subtle)] p-2.5 sm:p-3 h-[112px] sm:h-[128px] animate-pulse">
      <div className="flex justify-between">
        <div className="h-7 w-7 rounded-md bg-[var(--surface-muted)]" />
        <div className="h-3 w-8 rounded bg-[var(--surface-muted)]" />
      </div>
      <div className="mt-2 h-5 w-16 sm:w-20 rounded bg-[var(--surface-muted)]" />
      <div className="mt-1.5 h-2.5 w-20 sm:w-24 rounded bg-[var(--surface-muted)]" />
      <div className="mt-2 h-5 w-full rounded bg-[var(--surface-hover)] hidden min-[380px]:block" />
      <div className="mt-2 h-1 w-full rounded-full bg-[var(--surface-muted)]" />
    </div>
  );
}

export function KpiGridSkeleton() {
  return (
    <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2.5 sm:gap-3 mb-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  );
}
