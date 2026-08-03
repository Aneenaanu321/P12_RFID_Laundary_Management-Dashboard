import { ReactNode } from "react";

export function Card({
  children,
  className = "",
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <div id={id} className={`bg-[var(--card-bg)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] shadow-[var(--shadow-sm)] ${className}`}>
      {children}
    </div>
  );
}

export function CardHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div className="flex items-start justify-between px-5 pt-5 pb-3">
      <div>
        <h3 className="text-sm font-semibold text-[var(--foreground)]">{title}</h3>
        {subtitle && <p className="text-xs text-[var(--muted)] mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardSkeleton({ className = "", height = 260 }: { className?: string; height?: number }) {
  return (
    <div
      className={`bg-[var(--card-bg)] rounded-xl border border-[var(--border-subtle)] p-5 animate-pulse ${className}`}
      style={{ minHeight: height }}
    >
      <div className="h-4 w-40 rounded bg-[var(--surface-muted)] mb-2" />
      <div className="h-3 w-28 rounded bg-[var(--surface-muted)] mb-6" />
      <div className="h-[160px] w-full rounded-lg bg-[var(--surface-muted)]" />
    </div>
  );
}
