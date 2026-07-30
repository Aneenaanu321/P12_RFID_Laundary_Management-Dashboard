"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { titleCase } from "@/lib/format";

type LiveEvent = {
  id: string; itemCode: string; itemTypeName: string; customerName: string;
  zone: string; eventType: string; readerCode: string; timestamp: string;
};

export function LiveFeed({ initial }: { initial: LiveEvent[] }) {
  const [events, setEvents] = useState<LiveEvent[]>(initial);
  const [connected, setConnected] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    const es = new EventSource("/api/rfid/stream");
    esRef.current = es;
    es.onopen = () => setConnected(true);
    es.onerror = () => setConnected(false);
    es.onmessage = (e) => {
      const parsed: LiveEvent = JSON.parse(e.data);
      setEvents((prev) => [parsed, ...prev].slice(0, 60));
    };
    return () => es.close();
  }, []);

  return (
    <div>
      <div className="flex items-center gap-2 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
        <span className={`h-2 w-2 rounded-full ${connected ? "bg-green-500 live-dot" : "bg-slate-300"}`} />
        <span className="text-xs font-medium text-slate-600">{connected ? "Live — streaming RFID reads" : "Connecting..."}</span>
      </div>
      <div className="overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-slate-200 text-left text-xs text-slate-500 uppercase tracking-wider">
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
          <tbody className="divide-y divide-slate-100">
            {events.map((e, i) => (
              <tr key={`${e.id}-${i}`} className={i === 0 ? "bg-blue-50/50" : "hover:bg-slate-50"}>
                <td className="px-5 py-2.5 text-slate-500 tabular-nums whitespace-nowrap">
                  {new Date(e.timestamp).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                </td>
                <td className="px-3 py-2.5">
                  <Link href={`/inventory/${e.itemCode}`} className="text-blue-700 hover:underline font-medium">{e.itemCode}</Link>
                </td>
                <td className="px-3 py-2.5 text-slate-600">{e.itemTypeName}</td>
                <td className="px-3 py-2.5 text-slate-600">{e.customerName}</td>
                <td className="px-3 py-2.5 text-slate-500">{titleCase(e.zone)}</td>
                <td className="px-3 py-2.5 text-slate-500">{e.readerCode}</td>
                <td className="px-3 py-2.5"><StatusBadge status={e.eventType} label={titleCase(e.eventType)} /></td>
                <td className="px-3 py-2.5"><StatusBadge status="ACTIVE" label="Active" /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
