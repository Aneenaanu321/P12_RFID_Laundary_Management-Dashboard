import Link from "next/link";
import { Radio, Wifi, WifiOff, AlertTriangle, Activity } from "lucide-react";
import { getReaderStats } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";

export async function ReaderHealthWidget() {
  const stats = getReaderStats();
  const onlinePct = stats.total ? Math.round((stats.online / stats.total) * 100) : 0;
  const tone =
    stats.offline > 0
      ? "text-[var(--status-red)] bg-[var(--status-red-bg)] border-[var(--status-red)]/20"
      : stats.warning > 0
        ? "text-[var(--status-amber)] bg-[var(--status-amber-bg)] border-[var(--status-amber)]/20"
        : "text-[var(--status-green)] bg-[var(--status-green-bg)] border-[var(--status-green)]/20";

  const bar =
    stats.offline > 0
      ? "bg-[var(--status-red)]"
      : stats.warning > 0
        ? "bg-[var(--status-amber)]"
        : "bg-[var(--status-green)]";

  return (
    <div className="mb-6">
      <Link
        href="/rfid/readers"
        className="block rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-sm hover:border-[var(--muted-fg)] hover:shadow-md transition-all p-4 a11y-focus"
        aria-label={`RFID reader health: ${stats.online} of ${stats.total} online`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`h-10 w-10 rounded-lg flex items-center justify-center border ${tone}`}>
              <Radio size={18} aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-[var(--foreground)]">RFID Reader Health</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                {stats.online}/{stats.total} online · {onlinePct}% healthy
              </p>
            </div>
          </div>

          <div className="flex-1 h-2 rounded-full bg-[var(--surface-muted)] overflow-hidden min-w-[120px]" aria-hidden>
            <div className={`h-full rounded-full ${bar}`} style={{ width: `${onlinePct}%` }} />
          </div>

          <div className="flex flex-wrap gap-3 text-xs">
            <span className="inline-flex items-center gap-1 text-[var(--status-green)]">
              <Wifi size={13} aria-hidden /> {stats.online} online
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--status-amber)]">
              <AlertTriangle size={13} aria-hidden /> {stats.warning} warn
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--status-red)]">
              <WifiOff size={13} aria-hidden /> {stats.offline} offline
            </span>
            <span className="inline-flex items-center gap-1 text-[var(--muted)]">
              <Activity size={13} aria-hidden /> {fmtNumber(stats.totalReadsToday)} reads today
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}
