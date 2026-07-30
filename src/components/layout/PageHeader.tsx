import { ReactNode } from "react";

export function PageHeader({
  title, subtitle, action, breadcrumb,
}: { title: string; subtitle?: string; action?: ReactNode; breadcrumb?: string }) {
  return (
    <div className="flex items-start justify-between mb-6 gap-4 flex-wrap">
      <div>
        {breadcrumb && <p className="text-xs text-[var(--muted-fg)] mb-1">{breadcrumb}</p>}
        <h1 className="text-xl font-semibold text-[var(--foreground)]">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--muted)] mt-1">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
