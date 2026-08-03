import { RfidEventRow } from "@/lib/queries";
import { fmtDateTime, titleCase } from "@/lib/format";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function Timeline({ events }: { events: RfidEventRow[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-[var(--muted-fg)] px-5 py-6">
        No RFID events recorded for this item yet.
      </p>
    );
  }
  return (
    <ol className="px-5 py-4">
      {events.map((e, i) => (
        <li key={e.id} className="relative pl-6 pb-5 last:pb-0">
          {i !== events.length - 1 && (
            <span className="absolute left-[7px] top-3 bottom-0 w-px bg-[var(--border-subtle)]" />
          )}
          <span className="absolute left-0 top-1.5 h-3.5 w-3.5 rounded-full border-2 border-[var(--accent-500)] bg-[var(--card-bg)]" />
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-medium text-[var(--foreground)]">{fmtDateTime(e.timestamp)}</p>
            <StatusBadge
              status={e.status === "Missing" ? "MISSING" : e.eventType}
              label={titleCase(e.eventType)}
            />
          </div>
          <p className="text-xs text-[var(--muted)] mt-0.5">
            {titleCase(e.zone)} · Reader {e.readerCode}
          </p>
        </li>
      ))}
    </ol>
  );
}
