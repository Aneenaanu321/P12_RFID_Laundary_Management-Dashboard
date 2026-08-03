"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Input } from "@/components/ui/Input";
import { ClientTableExportButtons } from "@/components/TableExportButtons";
import { titleCase } from "@/lib/format";

type LiveEvent = {
  id: string; itemCode: string; itemTypeName: string; customerName: string;
  zone: string; eventType: string; readerCode: string; timestamp: string;
};

type ConnState = "connecting" | "live" | "error";

export function LiveFeed({ initial }: { initial: LiveEvent[] }) {
  const [events, setEvents] = useState<LiveEvent[]>(initial);
  const [status, setStatus] = useState<ConnState>("connecting");
  const [query, setQuery] = useState("");
  const esRef = useRef<EventSource | null>(null);
  const [retryKey, setRetryKey] = useState(0);

  const disconnect = useCallback(() => {
    esRef.current?.close();
    esRef.current = null;
  }, []);

  useEffect(() => {
    setStatus("connecting");
    const es = new EventSource("/api/rfid/stream");
    esRef.current = es;

    es.onopen = () => setStatus("live");
    es.onerror = () => {
      setStatus("error");
      es.close();
    };
    es.onmessage = (e) => {
      const parsed = JSON.parse(e.data) as LiveEvent & { itemCode?: string };
      if (!parsed?.itemCode) return;
      setEvents((prev) => [parsed, ...prev].slice(0, 60));
    };

    return () => {
      es.close();
      if (esRef.current === es) esRef.current = null;
    };
  }, [retryKey]);

  function retry() {
    disconnect();
    setRetryKey((k) => k + 1);
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return events;
    return events.filter((e) =>
      `${e.itemCode} ${e.itemTypeName} ${e.customerName} ${e.zone} ${e.readerCode} ${e.eventType}`
        .toLowerCase()
        .includes(q)
    );
  }, [events, query]);

  const statusCopy =
    status === "live"
      ? "Live — streaming RFID reads"
      : status === "error"
        ? "Connection lost — stream unavailable"
        : "Connecting...";

  return (
    <div data-testid="live-feed">
      <div
        className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]/60"
        data-testid="sse-status"
        data-sse-state={status}
        role="status"
        aria-live="polite"
      >
        <span
          className={`h-2 w-2 rounded-full ${
            status === "live"
              ? "bg-[var(--status-green)] live-dot"
              : status === "error"
                ? "bg-[var(--status-red)]"
                : "bg-[var(--muted-fg)]"
          }`}
          aria-hidden
        />
        <span className="text-xs font-medium text-[var(--muted)]">{statusCopy}</span>
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Filter live feed..."
          className="w-48"
          aria-label="Filter live feed"
        />
        <ClientTableExportButtons
          rows={filtered as unknown as Record<string, unknown>[]}
          filename="live-rfid-feed"
        />
        {status === "error" && (
          <button
            type="button"
            onClick={retry}
            className="text-xs font-medium text-[var(--status-blue)] hover:underline a11y-focus rounded"
            data-testid="sse-retry"
          >
            Retry connection
          </button>
        )}
      </div>
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-sm" data-testid="live-feed-table">
          <thead className="sticky top-0 bg-[var(--card-bg)] z-10">
            <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
              <th className="px-5 py-3 font-medium">Time</th>
              <th className="px-3 py-3 font-medium">Item</th>
              <th className="px-3 py-3 font-medium">Type</th>
              <th className="px-3 py-3 font-medium">Customer</th>
              <th className="px-3 py-3 font-medium">Zone</th>
              <th className="px-3 py-3 font-medium">Reader</th>
              <th className="px-3 py-3 font-medium">Event</th>
              <th className="px-3 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[var(--border-subtle)]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-5 py-8 text-center text-sm text-[var(--muted)]">
                  No events match your filter.
                </td>
              </tr>
            ) : (
              filtered.map((e, i) => (
                <tr
                  key={`${e.id}-${i}`}
                  className={i === 0 && !query ? "bg-[var(--status-blue-bg)]/50" : "hover:bg-[var(--surface-hover)]"}
                >
                  <td className="px-5 py-2.5 text-[var(--muted)] tabular-nums whitespace-nowrap">
                    {new Date(e.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </td>
                  <td className="px-3 py-2.5">
                    <Link href={`/inventory/${e.itemCode}`} className="text-[var(--status-blue)] hover:underline font-medium">{e.itemCode}</Link>
                  </td>
                  <td className="px-3 py-2.5 text-[var(--muted)]">{e.itemTypeName}</td>
                  <td className="px-3 py-2.5 text-[var(--muted)]">{e.customerName}</td>
                  <td className="px-3 py-2.5 text-[var(--muted)]">{titleCase(e.zone)}</td>
                  <td className="px-3 py-2.5 text-[var(--muted)]">{e.readerCode}</td>
                  <td className="px-3 py-2.5"><StatusBadge status={e.eventType} label={titleCase(e.eventType)} /></td>
                  <td className="px-3 py-2.5"><StatusBadge status="ACTIVE" label="Active" /></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
