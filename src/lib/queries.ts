import { all, get, run } from "./db";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
export type Customer = {
  id: string; name: string; code: string; type: string;
  contactEmail: string | null; contactPhone: string | null; createdAt: string;
};
export type ItemType = {
  id: string; name: string; category: string; unitValue: number;
  pricePerCycle: number; maxWashCycles: number; monitorThresholdPct: number; nearEolThresholdPct: number;
};
export type Reader = {
  id: string; code: string; name: string; zone: string; status: string;
  firmware: string; readsToday: number; readsPerMin: number; lastCommAt: string;
};
export type Item = {
  id: string; epc: string; itemCode: string;
  itemTypeId: string; itemTypeName: string; category: string;
  customerId: string; customerName: string;
  locationId: string | null; locationName: string | null;
  departmentId: string | null; departmentName: string | null;
  currentZone: string; currentStatus: string;
  washCycles: number; maxWashCycles: number; lifecycleStatus: string;
  purchaseDate: string; value: number;
  missing: number; missingSince: string | null;
  damaged: number; disposed: number; disposedAt: string | null;
  lastReadAt: string; lastReaderId: string | null; lastReaderCode: string | null;
};
export type RfidEventRow = {
  id: string; itemId: string; itemCode: string; itemTypeName: string;
  customerName: string; readerId: string; readerCode: string; zone: string;
  eventType: string; status: string; timestamp: string;
};

const ITEM_SELECT = `
  SELECT i.*, it.name as itemTypeName, it.category as category, it.maxWashCycles as maxWashCycles,
         c.name as customerName, l.name as locationName, d.name as departmentName,
         r.code as lastReaderCode
  FROM Item i
  JOIN ItemType it ON it.id = i.itemTypeId
  JOIN Customer c ON c.id = i.customerId
  LEFT JOIN Location l ON l.id = i.locationId
  LEFT JOIN Department d ON d.id = i.departmentId
  LEFT JOIN RfidReader r ON r.id = i.lastReaderId
`;

// ---------------------------------------------------------------------------
// Dashboard KPIs
// ---------------------------------------------------------------------------
export function getKpis(customerType?: string) {
  const today = customerType
    ? getLiveKpiRow(customerType)
    : get<Record<string, number>>(`SELECT * FROM DailySnapshot ORDER BY date DESC LIMIT 1`);

  const weekAgo = customerType
    ? null
    : get<Record<string, number>>(`SELECT * FROM DailySnapshot ORDER BY date DESC LIMIT 1 OFFSET 7`);

  const delta = (key: string) => {
    if (!today || !weekAgo || !weekAgo[key]) return undefined;
    return ((Number(today[key]) - Number(weekAgo[key])) / Number(weekAgo[key])) * 100;
  };
  return { today, weekAgo, delta };
}

function getLiveKpiRow(customerType?: string) {
  const where = customerType ? "WHERE c.type = ?" : "";
  const params = customerType ? [customerType] : [];
  return get<Record<string, number>>(
    `SELECT
      COUNT(*) as totalItems,
      COALESCE(SUM(CASE WHEN i.currentStatus='ACTIVE' THEN 1 ELSE 0 END), 0) as withCustomers,
      COALESCE(SUM(CASE WHEN i.currentStatus='IN_LAUNDRY' THEN 1 ELSE 0 END), 0) as inLaundry,
      COALESCE(SUM(CASE WHEN i.currentStatus='READY' THEN 1 ELSE 0 END), 0) as ready,
      COALESCE(SUM(CASE WHEN i.missing=1 THEN 1 ELSE 0 END), 0) as missing,
      COALESCE(SUM(CASE WHEN i.lifecycleStatus='NEAR_END_OF_LIFE' THEN 1 ELSE 0 END), 0) as nearEol,
      COALESCE(SUM(CASE WHEN i.lifecycleStatus='DISPOSAL_REQUIRED' AND i.disposed=0 THEN 1 ELSE 0 END), 0) as disposalRequired,
      COALESCE(SUM(CASE WHEN i.missing=1 THEN i.value ELSE 0 END), 0) as lossValue
     FROM Item i
     JOIN Customer c ON c.id = i.customerId
     ${where}`,
    params
  );
}

export type SnapshotSeriesOpts = { days?: number; from?: string; to?: string };

export function getSnapshotSeries(daysOrOpts: number | SnapshotSeriesOpts = 30) {
  if (typeof daysOrOpts === "number") {
    return all<Record<string, number | string>>(
      `SELECT * FROM DailySnapshot ORDER BY date DESC LIMIT ?`,
      [daysOrOpts]
    ).reverse();
  }

  const { days, from, to } = daysOrOpts;
  if (from && to) {
    return all<Record<string, number | string>>(
      `SELECT * FROM DailySnapshot WHERE date >= ? AND date <= ? ORDER BY date ASC`,
      [from, to]
    );
  }

  return all<Record<string, number | string>>(
    `SELECT * FROM DailySnapshot ORDER BY date DESC LIMIT ?`,
    [days ?? 30]
  ).reverse();
}

/** Shift a YYYY-MM-DD by `deltaDays` (negative = earlier). */
export function shiftDate(isoDate: string, deltaDays: number) {
  const d = new Date(`${isoDate}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + deltaDays);
  return d.toISOString().slice(0, 10);
}

// ---------------------------------------------------------------------------
// Process flow (laundry pipeline)
// ---------------------------------------------------------------------------
export const ZONE_STAGES = [
  { key: "RECEIVING", label: "Receiving" },
  { key: "SORTING", label: "Sorting" },
  { key: "WASHING", label: "Washing" },
  { key: "DRYING", label: "Drying" },
  { key: "FOLDING", label: "Folding" },
  { key: "QUALITY_CHECK", label: "Quality Check" },
  { key: "READY", label: "Ready" },
  { key: "DISPATCH", label: "Dispatch" },
];

export function getProcessFlow() {
  const rows = all<{ currentZone: string; c: number }>(
    `SELECT currentZone, COUNT(*) as c FROM Item WHERE currentZone IN (${ZONE_STAGES.map(() => "?").join(",")}) GROUP BY currentZone`,
    ZONE_STAGES.map((s) => s.key)
  );
  const map = new Map(rows.map((r) => [r.currentZone, r.c]));
  return ZONE_STAGES.map((s) => ({ ...s, count: map.get(s.key) ?? 0 }));
}

// ---------------------------------------------------------------------------
// Customers
// ---------------------------------------------------------------------------
export function getCustomers(type?: string) {
  const where = type ? `WHERE c.type = ?` : "";
  const params = type ? [type] : [];
  return all<
    Customer & {
      totalItems: number; inLaundry: number; ready: number; missing: number; nearEol: number; withCustomer: number;
    }
  >(
    `SELECT c.*,
      COUNT(i.id) as totalItems,
      SUM(CASE WHEN i.currentStatus='IN_LAUNDRY' THEN 1 ELSE 0 END) as inLaundry,
      SUM(CASE WHEN i.currentStatus='READY' THEN 1 ELSE 0 END) as ready,
      SUM(CASE WHEN i.missing=1 THEN 1 ELSE 0 END) as missing,
      SUM(CASE WHEN i.lifecycleStatus='NEAR_END_OF_LIFE' THEN 1 ELSE 0 END) as nearEol,
      SUM(CASE WHEN i.currentStatus='ACTIVE' THEN 1 ELSE 0 END) as withCustomer
     FROM Customer c
     LEFT JOIN Item i ON i.customerId = c.id
     ${where}
     GROUP BY c.id
     ORDER BY totalItems DESC`,
    params
  );
}

export function getCustomerById(id: string) {
  return get<Customer>(`SELECT * FROM Customer WHERE id = ?`, [id]);
}

export function getCustomerDeptBreakdown(customerId: string) {
  return all<{ name: string; c: number }>(
    `SELECT d.name as name, COUNT(i.id) as c
     FROM Item i JOIN Department d ON d.id = i.departmentId
     WHERE i.customerId = ?
     GROUP BY d.name ORDER BY c DESC`,
    [customerId]
  );
}

export function getCustomerLocations(customerId?: string) {
  const where = customerId ? "WHERE l.customerId = ?" : "";
  const params = customerId ? [customerId] : [];
  return all<{ id: string; name: string; city: string | null; customerName: string; itemCount: number }>(
    `SELECT l.id, l.name, l.city, c.name as customerName, COUNT(i.id) as itemCount
     FROM Location l JOIN Customer c ON c.id = l.customerId
     LEFT JOIN Item i ON i.locationId = l.id
     ${where}
     GROUP BY l.id ORDER BY itemCount DESC`,
    params
  );
}

// ---------------------------------------------------------------------------
// Items (generic filterable/paginated list used across many pages)
// ---------------------------------------------------------------------------
export type ItemFilters = {
  category?: string;
  customerId?: string;
  currentStatus?: string;
  currentZone?: string;
  lifecycleStatus?: string;
  missing?: boolean;
  damaged?: boolean;
  disposed?: boolean;
  search?: string;
  readerId?: string;
};

function buildItemWhere(f: ItemFilters) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (f.category) { clauses.push("it.category = ?"); params.push(f.category); }
  if (f.customerId) { clauses.push("i.customerId = ?"); params.push(f.customerId); }
  if (f.currentStatus) { clauses.push("i.currentStatus = ?"); params.push(f.currentStatus); }
  if (f.currentZone) { clauses.push("i.currentZone = ?"); params.push(f.currentZone); }
  if (f.lifecycleStatus) { clauses.push("i.lifecycleStatus = ?"); params.push(f.lifecycleStatus); }
  if (f.missing) { clauses.push("i.missing = 1"); }
  if (f.damaged) { clauses.push("i.damaged = 1"); }
  if (f.disposed !== undefined) { clauses.push(`i.disposed = ${f.disposed ? 1 : 0}`); }
  if (f.readerId) { clauses.push("i.lastReaderId = ?"); params.push(f.readerId); }
  if (f.search) {
    clauses.push("(i.epc LIKE ? OR i.itemCode LIKE ?)");
    params.push(`%${f.search}%`, `%${f.search}%`);
  }
  return { where: clauses.length ? `WHERE ${clauses.join(" AND ")}` : "", params };
}

export function getItemsPage(f: ItemFilters, page = 1, pageSize = 25, sort = "lastReadAt DESC") {
  const { where, params } = buildItemWhere(f);
  const total = get<{ c: number }>(
    `SELECT COUNT(*) as c FROM Item i JOIN ItemType it ON it.id = i.itemTypeId ${where}`,
    params
  )!.c;
  const offset = (page - 1) * pageSize;
  const rows = all<Item>(
    `${ITEM_SELECT} ${where} ORDER BY ${sort} LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  return { rows, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export function getItemByCode(itemCode: string) {
  return get<Item>(`${ITEM_SELECT} WHERE i.itemCode = ?`, [itemCode]);
}

export function searchItems(term: string, limit = 10) {
  return all<Item>(
    `${ITEM_SELECT} WHERE i.epc LIKE ? OR i.itemCode LIKE ? LIMIT ?`,
    [`%${term}%`, `%${term}%`, limit]
  );
}

export function getItemEvents(itemId: string) {
  return all<RfidEventRow>(
    `SELECT e.*, i.itemCode, it.name as itemTypeName, c.name as customerName, r.code as readerCode
     FROM RfidEvent e
     JOIN Item i ON i.id = e.itemId
     JOIN ItemType it ON it.id = i.itemTypeId
     JOIN Customer c ON c.id = i.customerId
     JOIN RfidReader r ON r.id = e.readerId
     WHERE e.itemId = ? ORDER BY e.timestamp DESC`,
    [itemId]
  );
}

// ---------------------------------------------------------------------------
// RFID Events (global)
// ---------------------------------------------------------------------------
export type EventFilters = {
  customerId?: string; zone?: string; eventType?: string; readerId?: string; status?: string; search?: string;
};
export function getEventsPage(f: EventFilters, page = 1, pageSize = 30) {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (f.customerId) { clauses.push("i.customerId = ?"); params.push(f.customerId); }
  if (f.zone) { clauses.push("e.zone = ?"); params.push(f.zone); }
  if (f.eventType) { clauses.push("e.eventType = ?"); params.push(f.eventType); }
  if (f.readerId) { clauses.push("e.readerId = ?"); params.push(f.readerId); }
  if (f.status) { clauses.push("e.status = ?"); params.push(f.status); }
  if (f.search) { clauses.push("(i.epc LIKE ? OR i.itemCode LIKE ?)"); params.push(`%${f.search}%`, `%${f.search}%`); }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const base = `FROM RfidEvent e
    JOIN Item i ON i.id = e.itemId
    JOIN ItemType it ON it.id = i.itemTypeId
    JOIN Customer c ON c.id = i.customerId
    JOIN RfidReader r ON r.id = e.readerId
    ${where}`;
  const total = get<{ c: number }>(`SELECT COUNT(*) as c ${base}`, params)!.c;
  const offset = (page - 1) * pageSize;
  const rows = all<RfidEventRow & { locationName: string | null }>(
    `SELECT e.*, i.itemCode, it.name as itemTypeName, c.name as customerName, r.code as readerCode
     ${base} ORDER BY e.timestamp DESC LIMIT ? OFFSET ?`,
    [...params, pageSize, offset]
  );
  return { rows, total, page, pageSize, pageCount: Math.max(1, Math.ceil(total / pageSize)) };
}

export const EVENT_TYPES = ["RECEIVED", "SORTED", "WASHING", "DRYING", "FOLDING", "READY", "DISPATCHED", "RETURNED", "MISSING", "DISPOSED"];

// ---------------------------------------------------------------------------
// Readers
// ---------------------------------------------------------------------------
export function getReaders() {
  return all<Reader>(`SELECT * FROM RfidReader ORDER BY code`);
}
export function getReaderStats() {
  const total = get<{ c: number }>(`SELECT COUNT(*) as c FROM RfidReader`)!.c;
  const online = get<{ c: number }>(`SELECT COUNT(*) as c FROM RfidReader WHERE status='ONLINE'`)!.c;
  const warning = get<{ c: number }>(`SELECT COUNT(*) as c FROM RfidReader WHERE status='WARNING'`)!.c;
  const offline = get<{ c: number }>(`SELECT COUNT(*) as c FROM RfidReader WHERE status='OFFLINE'`)!.c;
  const totalReadsToday = get<{ s: number }>(`SELECT SUM(readsToday) as s FROM RfidReader`)!.s ?? 0;
  return { total, online, warning, offline, totalReadsToday, successRate: 98.7 };
}

// ---------------------------------------------------------------------------
// Item types / Wash cycle rules
// ---------------------------------------------------------------------------
export function getItemTypes() {
  return all<ItemType>(`SELECT * FROM ItemType ORDER BY name`);
}
export function getItemTypeById(id: string) {
  return get<ItemType>(`SELECT * FROM ItemType WHERE id = ?`, [id]);
}
export function updateWashRule(id: string, maxWashCycles: number, monitorPct: number, eolPct: number) {
  run(`UPDATE ItemType SET maxWashCycles=?, monitorThresholdPct=?, nearEolThresholdPct=? WHERE id=?`, [maxWashCycles, monitorPct, eolPct, id]);
}

export function getWashCycleDistribution() {
  return all<{ bucket: string; c: number }>(
    `SELECT
      CASE
        WHEN CAST(washCycles AS FLOAT) / maxCycles < 0.2 THEN '0-20%'
        WHEN CAST(washCycles AS FLOAT) / maxCycles < 0.4 THEN '20-40%'
        WHEN CAST(washCycles AS FLOAT) / maxCycles < 0.6 THEN '40-60%'
        WHEN CAST(washCycles AS FLOAT) / maxCycles < 0.8 THEN '60-80%'
        WHEN CAST(washCycles AS FLOAT) / maxCycles < 1.0 THEN '80-100%'
        ELSE '100%+'
      END as bucket,
      COUNT(*) as c
     FROM (SELECT i.washCycles as washCycles, it.maxWashCycles as maxCycles FROM Item i JOIN ItemType it ON it.id = i.itemTypeId WHERE i.disposed = 0)
     GROUP BY bucket`
  );
}

export function getLifecycleStatusCounts() {
  return all<{ lifecycleStatus: string; c: number }>(
    `SELECT lifecycleStatus, COUNT(*) as c FROM Item WHERE disposed = 0 GROUP BY lifecycleStatus`
  );
}

export function getAvgCyclesByCustomer() {
  return all<{ customerName: string; avgCycles: number }>(
    `SELECT c.name as customerName, AVG(i.washCycles) as avgCycles
     FROM Item i JOIN Customer c ON c.id = i.customerId
     WHERE i.disposed = 0 GROUP BY c.name ORDER BY avgCycles DESC`
  );
}

export function getEolForecast() {
  // Derive a rough monthly forecast from remaining-cycle counts (avg ~8 cycles/month).
  const rows = all<{ id: string; washCycles: number; maxWashCycles: number }>(
    `SELECT i.id, i.washCycles, it.maxWashCycles
     FROM Item i JOIN ItemType it ON it.id = i.itemTypeId
     WHERE i.disposed = 0 AND i.lifecycleStatus IN ('NEAR_END_OF_LIFE','DISPOSAL_REQUIRED','MONITOR')`
  );
  const buckets = [0, 0, 0, 0, 0, 0]; // this month .. +5 months
  for (const r of rows) {
    const remaining = Math.max(0, r.maxWashCycles - r.washCycles);
    const monthsOut = Math.min(5, Math.floor(remaining / 8));
    buckets[monthsOut]++;
  }
  const labels = ["This Month", "+1 Month", "+2 Months", "+3 Months", "+4 Months", "+5 Months"];
  return labels.map((label, i) => ({ label, count: buckets[i] }));
}

// ---------------------------------------------------------------------------
// Loss prevention
// ---------------------------------------------------------------------------
export function getLossKpis() {
  const missing = get<{ c: number; v: number }>(`SELECT COUNT(*) as c, SUM(value) as v FROM Item WHERE missing = 1`)!;
  const gt24h = get<{ c: number }>(
    `SELECT COUNT(*) as c FROM Item WHERE missing = 1 AND missingSince <= datetime('now', '-1 day')`
  )!.c;
  const gt7d = get<{ c: number }>(
    `SELECT COUNT(*) as c FROM Item WHERE missing = 1 AND missingSince <= datetime('now', '-7 day')`
  )!.c;
  return { missingCount: missing.c, missingValue: missing.v ?? 0, gt24h, gt7d, annualLossTowels: 2000 };
}

export function getMissingByCustomer() {
  return all<{ customerName: string; c: number }>(
    `SELECT c.name as customerName, COUNT(*) as c FROM Item i JOIN Customer c ON c.id = i.customerId WHERE i.missing = 1 GROUP BY c.name ORDER BY c DESC`
  );
}
export function getMissingByLocation() {
  return all<{ locationName: string; c: number }>(
    `SELECT l.name as locationName, COUNT(*) as c FROM Item i JOIN Location l ON l.id = i.locationId WHERE i.missing = 1 GROUP BY l.name ORDER BY c DESC`
  );
}
export function getMissingItemsPage(f: ItemFilters, page = 1, pageSize = 25) {
  return getItemsPage({ ...f, missing: true }, page, pageSize, "missingSince ASC");
}

// ---------------------------------------------------------------------------
// Reconciliation
// ---------------------------------------------------------------------------
export function getReconciliations() {
  return all<{
    id: string; customerId: string; customerName: string; batchDate: string;
    expected: number; received: number; missingCount: number; expectedValue: number; missingValue: number;
  }>(
    `SELECT r.*, c.name as customerName FROM Reconciliation r JOIN Customer c ON c.id = r.customerId ORDER BY c.name`
  );
}

// ---------------------------------------------------------------------------
// Settlement
// ---------------------------------------------------------------------------
export function getSettlements() {
  return all<{ id: string; customerId: string; customerName: string; periodLabel: string; status: string; createdAt: string }>(
    `SELECT s.*, c.name as customerName FROM Settlement s JOIN Customer c ON c.id = s.customerId ORDER BY c.name`
  );
}
export function getSettlementLines(settlementId: string) {
  return all<{
    id: string; itemTypeName: string; sent: number; returned: number; missing: number;
    washCycles: number; pricePerCycle: number; amount: number;
  }>(
    `SELECT sl.*, it.name as itemTypeName FROM SettlementLine sl JOIN ItemType it ON it.id = sl.itemTypeId WHERE sl.settlementId = ?`,
    [settlementId]
  );
}
export function getSettlementForCustomer(customerId: string) {
  const settlement = get<{ id: string; customerId: string; periodLabel: string; status: string }>(
    `SELECT * FROM Settlement WHERE customerId = ? ORDER BY createdAt DESC LIMIT 1`,
    [customerId]
  );
  if (!settlement) return null;
  return { settlement, lines: getSettlementLines(settlement.id) };
}

// ---------------------------------------------------------------------------
// Inventory valuation
// ---------------------------------------------------------------------------
export function getInventoryValuation() {
  const active = get<{ v: number }>(`SELECT SUM(value) as v FROM Item WHERE currentStatus = 'ACTIVE'`)!.v ?? 0;
  const laundry = get<{ v: number }>(`SELECT SUM(value) as v FROM Item WHERE currentStatus = 'IN_LAUNDRY'`)!.v ?? 0;
  const missing = get<{ v: number }>(`SELECT SUM(value) as v FROM Item WHERE missing = 1`)!.v ?? 0;
  const damaged = get<{ v: number }>(`SELECT SUM(value) as v FROM Item WHERE damaged = 1`)!.v ?? 0;
  const disposed = get<{ v: number }>(`SELECT SUM(value) as v FROM Item WHERE disposed = 1`)!.v ?? 0;
  const total = get<{ v: number }>(`SELECT SUM(value) as v FROM Item WHERE disposed = 0`)!.v ?? 0;
  return { total, active, laundry, missing, damaged, disposed };
}
export function getInventoryValueByCustomer() {
  return all<{ customerName: string; v: number }>(
    `SELECT c.name as customerName, SUM(i.value) as v FROM Item i JOIN Customer c ON c.id = i.customerId WHERE i.disposed = 0 GROUP BY c.name ORDER BY v DESC`
  );
}
export function getInventoryValueByItemType() {
  return all<{ itemTypeName: string; v: number }>(
    `SELECT it.name as itemTypeName, SUM(i.value) as v FROM Item i JOIN ItemType it ON it.id = i.itemTypeId WHERE i.disposed = 0 GROUP BY it.name ORDER BY v DESC`
  );
}
export function getItemTypeDistribution() {
  return all<{ itemTypeName: string; c: number }>(
    `SELECT it.name as itemTypeName, COUNT(*) as c FROM Item i JOIN ItemType it ON it.id = i.itemTypeId WHERE i.disposed = 0 GROUP BY it.name ORDER BY c DESC`
  );
}

// ---------------------------------------------------------------------------
// Alerts
// ---------------------------------------------------------------------------
export function getAlerts(resolved = false) {
  return all<{ id: string; severity: string; message: string; category: string; relatedType: string | null; relatedId: string | null; createdAt: string; resolved: number }>(
    `SELECT * FROM Alert WHERE resolved = ? ORDER BY createdAt DESC`,
    [resolved ? 1 : 0]
  );
}
export function getAlertCounts() {
  return all<{ severity: string; c: number }>(
    `SELECT severity, COUNT(*) as c FROM Alert WHERE resolved = 0 GROUP BY severity`
  );
}

// ---------------------------------------------------------------------------
// Users / Admin
// ---------------------------------------------------------------------------
export function getUsers() {
  return all<{ id: string; name: string; email: string; role: string; createdAt: string }>(
    `SELECT id, name, email, role, createdAt FROM User ORDER BY name`
  );
}

// ---------------------------------------------------------------------------
// Global search
// ---------------------------------------------------------------------------
export function globalSearch(term: string) {
  if (!term || term.length < 2) return { items: [] as Item[], customers: [] as Customer[] };
  const items = all<Item>(`${ITEM_SELECT} WHERE i.epc LIKE ? OR i.itemCode LIKE ? LIMIT 8`, [`%${term}%`, `%${term}%`]);
  const customers = all<Customer>(`SELECT * FROM Customer WHERE name LIKE ? LIMIT 5`, [`%${term}%`]);
  return { items, customers };
}
