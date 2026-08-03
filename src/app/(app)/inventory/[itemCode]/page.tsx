import { notFound } from "next/navigation";
import { getItemByCode, getItemEvents } from "@/lib/queries";
import { fmtAED, fmtDate, fmtDateTime, titleCase } from "@/lib/format";
import { Card, CardHeader } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { ConfirmButton } from "@/components/ui/ConfirmButton";
import { PageHeader } from "@/components/layout/PageHeader";
import { Timeline } from "@/components/Timeline";
import { markItemFound, markItemLost, flagItem, requestReplacement } from "@/lib/actions";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import { TrackRecentView } from "@/components/TrackRecentView";

export default async function ItemDetailPage({ params }: { params: Promise<{ itemCode: string }> }) {
  const { itemCode } = await params;
  const item = getItemByCode(itemCode);
  if (!item) notFound();

  const session = await getSession();
  const events = getItemEvents(item.id);
  const path = `/inventory/${itemCode}`;
  const pct = Math.min(100, (item.washCycles / item.maxWashCycles) * 100);
  const remaining = Math.max(0, item.maxWashCycles - item.washCycles);

  return (
    <div>
      {session && (
        <TrackRecentView
          userId={session.id}
          view={{
            kind: "item",
            id: item.itemCode,
            label: item.itemCode,
            href: path,
            sub: `${item.itemTypeName} · ${item.customerName}`,
          }}
        />
      )}
      <PageHeader
        breadcrumb={`Inventory / ${item.itemTypeName}`}
        title={item.itemCode}
        subtitle={`RFID: ${item.epc}`}
        action={
          <div className="flex flex-wrap gap-2">
            {item.missing ? (
              <ConfirmButton
                variant="solidSuccess"
                confirmTitle="Mark as found?"
                confirmDescription={`Clear the missing flag on ${item.itemCode} and return it to active tracking.`}
                confirmLabel="Mark Found"
                confirmVariant="primary"
                formAction={markItemFound.bind(null, item.id, path)}
                successTitle="Item marked as found"
                successMessage={item.itemCode}
              >
                Mark Found
              </ConfirmButton>
            ) : (
              <ConfirmButton
                variant="secondary"
                confirmTitle="Flag for investigation?"
                confirmDescription={`Flag ${item.itemCode} for follow-up. Operators will see it in alerts.`}
                confirmLabel="Flag"
                confirmVariant="primary"
                formAction={flagItem.bind(null, item.id, path)}
                successTitle="Flagged for investigation"
                successMessage={item.itemCode}
              >
                Flag
              </ConfirmButton>
            )}
            {!item.disposed && (
              <ConfirmButton
                variant="danger"
                confirmTitle="Mark as lost?"
                confirmDescription={`Permanently mark ${item.itemCode} as lost. This affects loss analytics and settlements.`}
                confirmLabel="Mark Lost"
                confirmVariant="danger"
                formAction={markItemLost.bind(null, item.id, path)}
                successTitle="Item marked as lost"
                successMessage={item.itemCode}
              >
                Mark Lost
              </ConfirmButton>
            )}
            {item.disposed && (
              <ConfirmButton
                variant="primary"
                confirmTitle="Request replacement?"
                confirmDescription={`Create a replacement request for ${item.itemCode}.`}
                confirmLabel="Request Replacement"
                confirmVariant="primary"
                formAction={requestReplacement.bind(null, item.id, path)}
                successTitle="Replacement requested"
                successMessage={item.itemCode}
              >
                Request Replacement
              </ConfirmButton>
            )}
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader title="Overview" />
            <div className="px-5 pb-5 grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
              <Field label="Item Type" value={item.itemTypeName} />
              <Field label="Customer" value={<Link href={`/customers/${item.customerId}`} className="text-[var(--accent-600)] hover:underline">{item.customerName}</Link>} />
              <Field label="Location" value={item.locationName ?? "—"} />
              <Field label="Department" value={item.departmentName ?? "—"} />
              <Field label="Current Zone" value={titleCase(item.currentZone)} />
              <Field label="Current Status" value={<StatusBadge status={item.missing ? "MISSING" : item.currentStatus} />} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Lifecycle" subtitle="Wash cycle progress against manufacturer-rated maximum" />
            <div className="px-5 pb-5">
              <div className="flex items-end justify-between mb-1.5">
                <p className="text-sm text-slate-600">Wash Cycles: <span className="font-semibold text-slate-900">{item.washCycles} / {item.maxWashCycles}</span></p>
                <StatusBadge status={item.lifecycleStatus} />
              </div>
              <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className={`h-full rounded-full ${pct >= 100 ? "bg-red-500" : pct >= 80 ? "bg-amber-500" : pct >= 60 ? "bg-amber-400" : "bg-green-500"}`}
                  style={{ width: `${Math.min(100, pct)}%` }}
                />
              </div>
              <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                <Field label="Progress" value={`${pct.toFixed(1)}%`} />
                <Field label="Remaining Cycles" value={String(remaining)} />
                <Field label="Purchase Date" value={fmtDate(item.purchaseDate)} />
              </div>
            </div>
          </Card>

          <Card>
            <CardHeader title="RFID Event Timeline" />
            <Timeline events={events} />
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader title="RFID Information" />
            <div className="px-5 pb-5 space-y-3 text-sm">
              <Field label="EPC" value={<span className="font-mono">{item.epc}</span>} />
              <Field label="Last RFID Read" value={fmtDateTime(item.lastReadAt)} />
              <Field label="Last Reader" value={item.lastReaderCode ?? "—"} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Financial Information" />
            <div className="px-5 pb-5 space-y-3 text-sm">
              <Field label="Item Value" value={fmtAED(item.value)} />
              <Field label="Price / Wash Cycle" value={fmtAED(0)} />
            </div>
          </Card>

          <Card>
            <CardHeader title="Maintenance / Disposal" />
            <div className="px-5 pb-5 space-y-3 text-sm">
              <Field label="Damaged" value={item.damaged ? <StatusBadge status="CRITICAL" label="Damaged" /> : "No"} />
              <Field label="Disposed" value={item.disposed ? <StatusBadge status="DISPOSED" /> : "No"} />
              {item.missing && <Field label="Missing Since" value={item.missingSince ? fmtDateTime(item.missingSince) : "—"} />}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs text-slate-400">{label}</p>
      <div className="text-slate-800 font-medium mt-0.5">{value}</div>
    </div>
  );
}
