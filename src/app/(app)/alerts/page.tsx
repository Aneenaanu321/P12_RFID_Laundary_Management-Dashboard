import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { getAlerts } from "@/lib/queries";
import { fmtDateTime } from "@/lib/format";
import { resolveAlert } from "@/lib/actions";
import Link from "next/link";

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
        <div className="divide-y divide-slate-100">
          {alerts.map((a) => {
            const href = a.relatedType && a.relatedId ? RELATED_HREF[a.relatedType]?.(a.relatedId) : undefined;
            const content = (
              <div className="flex items-start justify-between px-5 py-4 hover:bg-slate-50">
                <div className="flex items-start gap-3">
                  <StatusBadge status={a.severity} />
                  <div>
                    <p className="text-sm text-slate-800">{a.message}</p>
                    <p className="text-xs text-slate-400 mt-1">{fmtDateTime(a.createdAt)} · {a.category.replace(/_/g, " ")}</p>
                  </div>
                </div>
                <form action={resolveAlert.bind(null, a.id, "/alerts")}>
                  <button className="text-xs text-slate-400 hover:text-slate-700 shrink-0">Dismiss</button>
                </form>
              </div>
            );
            return href ? <Link key={a.id} href={href} className="block">{content}</Link> : <div key={a.id}>{content}</div>;
          })}
          {alerts.length === 0 && <p className="p-6 text-sm text-slate-500">No active alerts. Everything looks healthy.</p>}
        </div>
      </Card>
    </div>
  );
}
