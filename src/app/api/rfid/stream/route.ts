import { all, run } from "@/lib/db";
import crypto from "node:crypto";

export const dynamic = "force-dynamic";

const ZONE_NEXT: Record<string, { zone: string; eventType: string; readerZone: string }> = {
  WITH_CUSTOMER: { zone: "RECEIVING", eventType: "RECEIVED", readerZone: "Receiving" },
  RECEIVING: { zone: "SORTING", eventType: "SORTED", readerZone: "Sorting" },
  SORTING: { zone: "WASHING", eventType: "WASHING", readerZone: "Washing Area" },
  WASHING: { zone: "DRYING", eventType: "DRYING", readerZone: "Drying" },
  DRYING: { zone: "FOLDING", eventType: "FOLDING", readerZone: "Folding" },
  FOLDING: { zone: "QUALITY_CHECK", eventType: "READY", readerZone: "Quality Check" },
  QUALITY_CHECK: { zone: "READY", eventType: "READY", readerZone: "Quality Check" },
  READY: { zone: "DISPATCH", eventType: "DISPATCHED", readerZone: "Dispatch" },
  DISPATCH: { zone: "WITH_CUSTOMER", eventType: "RETURNED", readerZone: "Dispatch" },
};

function tick() {
  const candidates = all<{ id: string; itemCode: string; currentZone: string; itemTypeName: string; customerName: string }>(
    `SELECT i.id, i.itemCode, i.currentZone, it.name as itemTypeName, c.name as customerName
     FROM Item i JOIN ItemType it ON it.id = i.itemTypeId JOIN Customer c ON c.id = i.customerId
     WHERE i.disposed = 0 AND i.missing = 0
     ORDER BY RANDOM() LIMIT 1`
  );
  const item = candidates[0];
  if (!item) return null;

  const next = ZONE_NEXT[item.currentZone] ?? ZONE_NEXT.WITH_CUSTOMER;
  const readerPool = all<{ id: string; code: string }>(`SELECT id, code FROM RfidReader WHERE zone = ? AND status != 'OFFLINE'`, [next.readerZone]);
  const reader = readerPool[Math.floor(Math.random() * readerPool.length)] ?? all<{ id: string; code: string }>(`SELECT id, code FROM RfidReader LIMIT 1`)[0];
  if (!reader) return null;

  const eventId = crypto.randomUUID();
  run(
    `INSERT INTO RfidEvent (id, itemId, readerId, zone, eventType, status, timestamp) VALUES (?,?,?,?,?,?,datetime('now'))`,
    [eventId, item.id, reader.id, next.zone, next.eventType, "Active"]
  );
  run(`UPDATE Item SET currentZone = ?, currentStatus = ?, lastReadAt = datetime('now'), lastReaderId = ? WHERE id = ?`, [
    next.zone,
    next.zone === "WITH_CUSTOMER" ? "ACTIVE" : next.zone === "READY" || next.zone === "DISPATCH" ? "READY" : "IN_LAUNDRY",
    reader.id,
    item.id,
  ]);

  return {
    id: eventId,
    itemCode: item.itemCode,
    itemTypeName: item.itemTypeName,
    customerName: item.customerName,
    zone: next.zone,
    eventType: next.eventType,
    readerCode: reader.code,
    timestamp: new Date().toISOString(),
  };
}

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;
  const stream = new ReadableStream({
    start(controller) {
      const send = () => {
        if (closed) return;
        try {
          const event = tick();
          if (event) controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
        } catch {
          // ignore transient errors so the stream keeps running
        }
      };
      send();
      const interval = setInterval(send, 2500);
      // @ts-expect-error attach for cleanup
      controller._interval = interval;
    },
    cancel() {
      closed = true;
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
