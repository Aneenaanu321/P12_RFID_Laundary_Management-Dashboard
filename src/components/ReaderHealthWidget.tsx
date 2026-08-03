import Link from "next/link";
import { Radio, Wifi, WifiOff, AlertTriangle, Activity, ChevronRight } from "lucide-react";
import { getReaderStats } from "@/lib/queries";
import { fmtNumber } from "@/lib/format";

export async function ReaderHealthWidget({ compact = false }: { compact?: boolean }) {
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
    <Link
      href="/rfid/readers"
      className={`block h-full rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-sm hover:border-[var(--muted-fg)] hover:shadow-md transition-all p-4 a11y-focus ${
        compact ? "" : "mb-6"
      }`}
      aria-label={`RFID reader health: ${stats.online} of ${stats.total} online`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`h-9 w-9 rounded-lg flex items-center justify-center border shrink-0 ${tone}`}>
            <Radio size={16} aria-hidden />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--foreground)]">RFID Reader Health</p>
            <p className="text-[11px] text-[var(--muted)] mt-0.5">
              {stats.online}/{stats.total} online · {onlinePct}% healthy
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-0.5 text-[11px] font-medium text-[var(--status-blue)] shrink-0">
          Readers <ChevronRight size={12} aria-hidden />
        </span>
      </div>

      <div className="h-1.5 rounded-full bg-[var(--surface-muted)] overflow-hidden mb-3" aria-hidden>
        <div className={`h-full rounded-full ${bar}`} style={{ width: `${onlinePct}%` }} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg bg-[var(--surface-muted)] px-2.5 py-2">
          <p className="inline-flex items-center gap-1 text-[10px] text-[var(--status-green)]">
            <Wifi size={11} aria-hidden /> Online
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">{stats.online}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface-muted)] px-2.5 py-2">
          <p className="inline-flex items-center gap-1 text-[10px] text-[var(--status-amber)]">
            <AlertTriangle size={11} aria-hidden /> Warn
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">{stats.warning}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface-muted)] px-2.5 py-2">
          <p className="inline-flex items-center gap-1 text-[10px] text-[var(--status-red)]">
            <WifiOff size={11} aria-hidden /> Offline
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">{stats.offline}</p>
        </div>
        <div className="rounded-lg bg-[var(--surface-muted)] px-2.5 py-2">
          <p className="inline-flex items-center gap-1 text-[10px] text-[var(--muted)]">
            <Activity size={11} aria-hidden /> Reads today
          </p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums text-[var(--foreground)]">
            {fmtNumber(stats.totalReadsToday)}
          </p>
        </div>
      </div>
    </Link>
  );
}
