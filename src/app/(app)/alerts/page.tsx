import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";
import { getAlerts } from "@/lib/queries";
import { fmtDateTime } from "@/lib/format";
import { resolveAlert } from "@/lib/actions";
import Link from "next/link";
import { Bell } from "lucide-react";

const RELATED_HREF: Record<string, (id: string) => string> = {
  Customer: (id) => `/customers/${id}`,
  RfidReader: () => `/rfid/readers`,
  Item: () => `/loss/missing`,
};

export default function Page() {
  const alerts = getAlerts(false);

  return (
    <div>
      <PageHeader title="Alert Center" subtitle="Critical, warning and informational events across the platform." />
      <Card>
        {alerts.length === 0 ? (
          <EmptyState
            title="No active alerts"
            subtitle="Everything looks healthy right now."
            icon={Bell}
          />
        ) : (
          <div className="divide-y divide-[var(--border-subtle)]">
            {alerts.map((a) => {
              const href =
                a.relatedType && a.relatedId ? RELATED_HREF[a.relatedType]?.(a.relatedId) : undefined;
              const content = (
                <div className="flex items-start justify-between px-5 py-4 hover:bg-[var(--surface-hover)]">
                  <div className="flex items-start gap-3">
                    <StatusBadge status={a.severity} />
                    <div>
                      <p className="text-sm text-[var(--foreground)]">{a.message}</p>
                      <p className="text-xs text-[var(--muted-fg)] mt-1">
                        {fmtDateTime(a.createdAt)} · {a.category.replace(/_/g, " ")}
                      </p>
                    </div>
                  </div>
                  <form action={resolveAlert.bind(null, a.id, "/alerts")}>
                    <Button type="submit" variant="ghost" size="sm" className="text-[var(--muted-fg)]">
                      Dismiss
                    </Button>
                  </form>
                </div>
              );
              return href ? (
                <Link key={a.id} href={href} className="block">
                  {content}
                </Link>
              ) : (
                <div key={a.id}>{content}</div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}
