import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";

export function EmptyState({
  title,
  subtitle,
  icon: Icon = Inbox,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="h-12 w-12 rounded-full bg-[var(--status-gray-bg)] text-[var(--status-gray)] flex items-center justify-center mb-3">
        <Icon size={20} strokeWidth={1.75} />
      </div>
      <p className="text-sm font-medium text-[var(--foreground)]">{title}</p>
      {subtitle && <p className="text-xs text-[var(--muted)] mt-1 max-w-sm">{subtitle}</p>}
    </div>
  );
}
