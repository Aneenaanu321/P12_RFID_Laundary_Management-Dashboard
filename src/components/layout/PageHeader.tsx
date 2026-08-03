import { ReactNode } from "react";

export function PageHeader({
  title, subtitle, action, breadcrumb, className = "",
}: { title: string; subtitle?: string; action?: ReactNode; breadcrumb?: string; className?: string }) {
  return (
    <div className={`flex items-start justify-between mb-4 sm:mb-6 gap-3 sm:gap-4 flex-wrap ${className}`}>
      <div className="min-w-0">
        {breadcrumb && <p className="text-xs text-[var(--muted-fg)] mb-1 truncate">{breadcrumb}</p>}
        <h1 className="text-lg sm:text-xl font-semibold text-[var(--foreground)] leading-snug">{title}</h1>
        {subtitle && <p className="text-xs sm:text-sm text-[var(--muted)] mt-1 line-clamp-2 sm:line-clamp-none">{subtitle}</p>}
      </div>
      {action && <div className="w-full sm:w-auto flex flex-wrap gap-2">{action}</div>}
    </div>
  );
}
