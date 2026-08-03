import { all, get, run } from "@/lib/db";
import { getLiveOpsKpis } from "@/lib/queries";
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

let lastCriticalAlertAt = 0;

function maybeCriticalAlert(itemCode: string, zone: string) {
  const now = Date.now();
  // At most one stream-generated critical every ~28s, ~25% chance when eligible.
  if (now - lastCriticalAlertAt < 28_000 || Math.random() > 0.25) return null;

  const openCritical = get<{ c: number }>(
    `SELECT COUNT(*) as c FROM Alert WHERE resolved = 0 AND severity = 'CRITICAL' AND category = 'LIVE_MONITOR'`
  );
  if (Number(openCritical?.c ?? 0) >= 4) return null;

  lastCriticalAlertAt = now;
  const id = crypto.randomUUID();
  const message = `Critical RFID alert: ${itemCode} requires attention after transition to ${zone.replace(/_/g, " ").toLowerCase()}.`;
  const createdAt = new Date().toISOString();
  run(
    `INSERT INTO Alert (id, severity, message, category, relatedType, relatedId, createdAt, resolved) VALUES (?,?,?,?,?,?,?,0)`,
    [id, "CRITICAL", message, "LIVE_MONITOR", null, null, createdAt]
  );
  return { id, severity: "CRITICAL" as const, message, category: "LIVE_MONITOR", createdAt };
}

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

  const kpis = getLiveOpsKpis();
  const alert = maybeCriticalAlert(item.itemCode, next.zone);

  return {
    id: eventId,
    itemCode: item.itemCode,
    itemTypeName: item.itemTypeName,
    customerName: item.customerName,
    zone: next.zone,
    eventType: next.eventType,
    readerCode: reader.code,
    timestamp: new Date().toISOString(),
    kpis,
    alert,
  };
}

export async function GET() {
  const encoder = new TextEncoder();
  let closed = false;
  let interval: ReturnType<typeof setInterval> | undefined;

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
      interval = setInterval(send, 2500);
    },
    cancel() {
      closed = true;
      if (interval) clearInterval(interval);
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
