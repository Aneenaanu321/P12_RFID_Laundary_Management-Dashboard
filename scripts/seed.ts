/* eslint-disable no-console */
import { getDb } from "../src/lib/db";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";

const db = getDb();
const id = () => crypto.randomUUID();
const now = new Date();

function daysAgo(n: number) {
  const d = new Date(now);
  d.setDate(d.getDate() - n);
  return d;
}
function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function pick<T>(arr: T[]): T {
  return arr[randInt(0, arr.length - 1)];
}
function weightedPick<T extends { w: number }>(arr: T[]): T {
  const total = arr.reduce((s, a) => s + a.w, 0);
  let r = Math.random() * total;
  for (const a of arr) {
    if (r < a.w) return a;
    r -= a.w;
  }
  return arr[arr.length - 1];
}
function isoDaysAgo(n: number, jitterHours = 12) {
  const d = daysAgo(n);
  d.setHours(d.getHours() - randInt(0, jitterHours));
  d.setMinutes(randInt(0, 59));
  return d.toISOString();
}

console.log("Resetting database...");
db.exec(`
  DELETE FROM RfidEvent;
  DELETE FROM SettlementLine;
  DELETE FROM Settlement;
  DELETE FROM Reconciliation;
  DELETE FROM Alert;
  DELETE FROM Item;
  DELETE FROM Department;
  DELETE FROM Location;
  DELETE FROM RfidReader;
  DELETE FROM ItemType;
  DELETE FROM Customer;
  DELETE FROM User;
`);

// ---------------------------------------------------------------------------
// 1. Customers
// ---------------------------------------------------------------------------
type CustomerSeed = { name: string; code: string; type: string; total: number };

/** Full demo ≈125k items. Lite ≈2.5k — used for fast hosted recovery when DB is empty. */
const SEED_SCALE = process.env.SEED_MODE === "lite" ? 0.02 : 1;
console.log(`Seed mode: ${process.env.SEED_MODE === "lite" ? "lite" : "full"} (scale=${SEED_SCALE})`);

const customerSeeds: CustomerSeed[] = [
  { name: "Hospital A", code: "HOSP-A", type: "HOSPITAL", total: Math.max(80, Math.round(34000 * SEED_SCALE)) },
  { name: "Hospital B", code: "HOSP-B", type: "HOSPITAL", total: Math.max(60, Math.round(19000 * SEED_SCALE)) },
  { name: "Gym A", code: "GYM-A", type: "GYM", total: Math.max(60, Math.round(24000 * SEED_SCALE)) },
  { name: "Gym B", code: "GYM-B", type: "GYM", total: Math.max(40, Math.round(14000 * SEED_SCALE)) },
  { name: "Hotel A", code: "HOTEL-A", type: "HOTEL", total: Math.max(50, Math.round(20000 * SEED_SCALE)) },
  { name: "Hotel B", code: "HOTEL-B", type: "HOTEL", total: Math.max(40, Math.round(10920 * SEED_SCALE)) },
  { name: "Spa A", code: "SPA-A", type: "SPA", total: Math.max(30, Math.round(3500 * SEED_SCALE)) },
];

const insCustomer = db.prepare(
  `INSERT INTO Customer (id, name, code, type, contactEmail, contactPhone) VALUES (?,?,?,?,?,?)`
);
const customers = customerSeeds.map((c) => {
  const cid = id();
  insCustomer.run(
    cid,
    c.name,
    c.code,
    c.type,
    `ops@${c.code.toLowerCase()}.example.com`,
    `+971-4-${randInt(1000000, 9999999)}`
  );
  return { ...c, id: cid };
});

// ---------------------------------------------------------------------------
// 2. Locations & Departments
// ---------------------------------------------------------------------------
const insLocation = db.prepare(`INSERT INTO Location (id, customerId, name, city) VALUES (?,?,?,?)`);
const insDepartment = db.prepare(`INSERT INTO Department (id, locationId, name) VALUES (?,?,?)`);

const HOSPITAL_DEPTS = ["Emergency", "Surgery", "ICU", "General Ward", "Maternity", "Other"];
const HOSPITAL_DEPT_WEIGHTS = [4820, 8420, 5240, 9320, 4120, 10380]; // reference proportions from brief

type LocRef = { id: string; customerId: string; name: string };
const locations: LocRef[] = [];
const departmentsByLocation: Record<string, { id: string; name: string }[]> = {};

for (const c of customers) {
  const branchCount = c.type === "HOSPITAL" ? 1 : c.type === "GYM" ? 3 : c.type === "HOTEL" ? 2 : 1;
  for (let i = 0; i < branchCount; i++) {
    const locId = id();
    const name =
      branchCount === 1
        ? `${c.name} - Main Campus`
        : `${c.name} - Branch ${String.fromCharCode(65 + i)}`;
    insLocation.run(locId, c.id, name, pick(["Dubai", "Abu Dhabi", "Sharjah", "Ajman"]));
    locations.push({ id: locId, customerId: c.id, name });

    if (c.type === "HOSPITAL") {
      departmentsByLocation[locId] = HOSPITAL_DEPTS.map((d) => {
        const did = id();
        insDepartment.run(did, locId, d);
        return { id: did, name: d };
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 3. Item Types
// ---------------------------------------------------------------------------
type ItemTypeSeed = {
  name: string;
  category: string;
  unitValue: number;
  pricePerCycle: number;
  maxWashCycles: number;
};
const itemTypeSeeds: ItemTypeSeed[] = [
  { name: "Gym Towel", category: "TOWEL", unitValue: 25, pricePerCycle: 0.6, maxWashCycles: 80 },
  { name: "Bath Towel", category: "TOWEL", unitValue: 30, pricePerCycle: 0.7, maxWashCycles: 90 },
  { name: "Hand Towel", category: "TOWEL", unitValue: 12, pricePerCycle: 0.4, maxWashCycles: 70 },
  { name: "Bedsheet", category: "LINEN", unitValue: 45, pricePerCycle: 1.5, maxWashCycles: 120 },
  { name: "Surgical Gown", category: "GOWN", unitValue: 60, pricePerCycle: 2.2, maxWashCycles: 80 },
  { name: "Patient Gown", category: "GOWN", unitValue: 40, pricePerCycle: 1.8, maxWashCycles: 100 },
  { name: "Uniform", category: "UNIFORM", unitValue: 55, pricePerCycle: 1.2, maxWashCycles: 150 },
  { name: "Bathrobe", category: "OTHER", unitValue: 70, pricePerCycle: 1.0, maxWashCycles: 100 },
  { name: "Blanket", category: "LINEN", unitValue: 85, pricePerCycle: 1.3, maxWashCycles: 110 },
];
const insItemType = db.prepare(
  `INSERT INTO ItemType (id, name, category, unitValue, pricePerCycle, maxWashCycles, monitorThresholdPct, nearEolThresholdPct) VALUES (?,?,?,?,?,?,60,80)`
);
const itemTypes = itemTypeSeeds.map((t) => {
  const tid = id();
  insItemType.run(tid, t.name, t.category, t.unitValue, t.pricePerCycle, t.maxWashCycles);
  return { ...t, id: tid };
});
const byName = (n: string) => itemTypes.find((t) => t.name === n)!;

// Item-type weighting per customer type
const typeWeights: Record<string, { name: string; w: number }[]> = {
  HOSPITAL: [
    { name: "Surgical Gown", w: 15 },
    { name: "Patient Gown", w: 20 },
    { name: "Bedsheet", w: 25 },
    { name: "Bath Towel", w: 15 },
    { name: "Hand Towel", w: 10 },
    { name: "Uniform", w: 10 },
    { name: "Blanket", w: 5 },
  ],
  GYM: [
    { name: "Gym Towel", w: 70 },
    { name: "Hand Towel", w: 15 },
    { name: "Uniform", w: 10 },
    { name: "Bathrobe", w: 5 },
  ],
  HOTEL: [
    { name: "Bath Towel", w: 30 },
    { name: "Hand Towel", w: 20 },
    { name: "Bedsheet", w: 25 },
    { name: "Bathrobe", w: 15 },
    { name: "Blanket", w: 10 },
  ],
  SPA: [
    { name: "Bathrobe", w: 40 },
    { name: "Bath Towel", w: 30 },
    { name: "Hand Towel", w: 20 },
    { name: "Blanket", w: 10 },
  ],
};

// ---------------------------------------------------------------------------
// 4. RFID Readers (18)
// ---------------------------------------------------------------------------
type ReaderSeed = { zone: string };
const readerZonePlan: string[] = [
  "Receiving", "Receiving",
  "Sorting", "Sorting",
  "Washing Area", "Washing Area", "Washing Area", "Washing Area",
  "Drying", "Drying", "Drying",
  "Folding", "Folding",
  "Quality Check", "Quality Check",
  "Dispatch", "Dispatch", "Dispatch",
];
const insReader = db.prepare(
  `INSERT INTO RfidReader (id, code, name, zone, status, firmware, readsToday, readsPerMin, lastCommAt) VALUES (?,?,?,?,?,?,?,?,?)`
);
const readers = readerZonePlan.map((zone, i) => {
  const code = `RDR-${String(i + 1).padStart(3, "0")}`;
  const rid = id();
  let status = "ONLINE";
  let lastCommAt = new Date(now.getTime() - randInt(5, 60) * 1000).toISOString();
  let readsToday = randInt(20000, 90000);
  let readsPerMin = randInt(200, 900);
  if (code === "RDR-004") {
    status = "OFFLINE";
    lastCommAt = new Date(now.getTime() - 15 * 60 * 1000).toISOString();
    readsToday = 0;
    readsPerMin = 0;
  } else if (code === "RDR-011") {
    status = "WARNING";
    lastCommAt = new Date(now.getTime() - randInt(3, 6) * 60 * 1000).toISOString();
    readsPerMin = randInt(20, 80);
  }
  insReader.run(
    rid,
    code,
    `${zone} Reader ${i + 1}`,
    zone,
    status,
    `v${randInt(2, 4)}.${randInt(0, 9)}.${randInt(0, 9)}`,
    readsToday,
    readsPerMin,
    lastCommAt
  );
  return { id: rid, code, zone, status };
});
const readersByZone = (zone: string) => readers.filter((r) => r.zone === zone);

// ---------------------------------------------------------------------------
// 5. Items (125,420)
// ---------------------------------------------------------------------------
const insItem = db.prepare(`
  INSERT INTO Item (
    id, epc, itemCode, itemTypeId, customerId, locationId, departmentId,
    currentZone, currentStatus, washCycles, lifecycleStatus, purchaseDate, value,
    missing, missingSince, damaged, disposed, disposedAt, lastReadAt, lastReaderId
  ) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

const TOTAL = customerSeeds.reduce((s, c) => s + c.total, 0);
console.log(`Seeding ${TOTAL} items...`);

let epcCounter = 0x30340000;
let itemCounter = 0;

const zoneBuckets = [
  { zone: "WITH_CUSTOMER", status: "ACTIVE", w: 89240 },
  { zone: "RECEIVING", status: "IN_LAUNDRY", w: 2400 },
  { zone: "SORTING", status: "IN_LAUNDRY", w: 1900 },
  { zone: "WASHING", status: "IN_LAUNDRY", w: 1600 },
  { zone: "DRYING", status: "IN_LAUNDRY", w: 1200 },
  { zone: "FOLDING", status: "IN_LAUNDRY", w: 800 },
  { zone: "QUALITY_CHECK", status: "IN_LAUNDRY", w: 520 },
  { zone: "READY", status: "READY", w: 9320 },
  { zone: "DISPATCH", status: "READY", w: 5000 },
  { zone: "DISPATCH", status: "READY", w: 7663 }, // additional in-transit dispatch volume
  { zone: "CUSTOMER_RETURN", status: "MISSING", w: 327 },
  { zone: "DISPOSED", status: "DISPOSED", w: 450 },
];

const itemTypeMap = new Map(itemTypes.map((t) => [t.name, t]));

db.exec("BEGIN TRANSACTION");
try {
  for (const c of customers) {
    const custLocations = locations.filter((l) => l.customerId === c.id);
    const weights = typeWeights[c.type];

    for (let i = 0; i < c.total; i++) {
      itemCounter++;
      epcCounter += randInt(1, 5);
      const epc = `EPC-${epcCounter.toString(16).toUpperCase()}`;
      const itemCode = `${c.type === "HOSPITAL" ? "GWN" : c.type === "GYM" ? "TWL" : c.type === "HOTEL" ? "LIN" : "ROB"}-${String(itemCounter).padStart(7, "0")}`;

      const chosenType = itemTypeMap.get(weightedPick(weights).name)!;
      const loc = pick(custLocations);
      let dept: { id: string; name: string } | null = null;
      if (c.type === "HOSPITAL") {
        const depts = departmentsByLocation[loc.id];
        const wIdx = weightedPick(HOSPITAL_DEPTS.map((d, idx) => ({ name: d, w: HOSPITAL_DEPT_WEIGHTS[idx] })));
        dept = depts.find((d) => d.name === wIdx.name) || pick(depts);
      }

      const bucket = weightedPick(zoneBuckets);

      // lifecycle wear (independent axis)
      const r = Math.random();
      let washPct: number;
      if (r < 0.8993) washPct = randInt(0, 59);
      else if (r < 0.9893) washPct = randInt(60, 79);
      else if (r < 0.9993) washPct = randInt(80, 98);
      else washPct = randInt(100, 115);
      let lifecycleStatus =
        washPct >= 100 ? "DISPOSAL_REQUIRED" : washPct >= 80 ? "NEAR_END_OF_LIFE" : washPct >= 60 ? "MONITOR" : "ACTIVE";
      let washCycles = Math.round((chosenType.maxWashCycles * washPct) / 100);

      let currentZone = bucket.zone;
      let currentStatus = bucket.status;
      let missing = currentStatus === "MISSING" ? 1 : 0;
      let missingSince: string | null = null;
      if (missing) {
        const daysBack = weightedPick([
          { name: "recent", w: 40, d: randInt(0, 1) },
          { name: "week", w: 35, d: randInt(2, 7) },
          { name: "long", w: 25, d: randInt(8, 45) },
        ] as never) as unknown as { d: number };
        missingSince = isoDaysAgo((missing && (daysBack as { d: number }).d) || 1);
      }
      let disposed = currentStatus === "DISPOSED" ? 1 : 0;
      let disposedAt = disposed ? isoDaysAgo(randInt(1, 200)) : null;
      if (disposed) lifecycleStatus = "DISPOSAL_REQUIRED";

      const damaged = Math.random() < 0.0031 ? 1 : 0;

      const purchaseDate = isoDaysAgo(randInt(30, 1100), 0);
      const lastReadAt = missing
        ? missingSince!
        : disposed
        ? disposedAt!
        : isoDaysAgo(randInt(0, 3));

      let readerPool =
        currentZone === "WITH_CUSTOMER" || currentZone === "CUSTOMER_RETURN" || currentZone === "DISPOSED"
          ? readersByZone("Dispatch")
          : readersByZone(
              currentZone === "RECEIVING"
                ? "Receiving"
                : currentZone === "SORTING"
                ? "Sorting"
                : currentZone === "WASHING"
                ? "Washing Area"
                : currentZone === "DRYING"
                ? "Drying"
                : currentZone === "FOLDING"
                ? "Folding"
                : currentZone === "QUALITY_CHECK"
                ? "Quality Check"
                : "Dispatch"
            );
      const lastReader = readerPool.length ? pick(readerPool) : pick(readers);

      insItem.run(
        id(),
        epc,
        itemCode,
        chosenType.id,
        c.id,
        loc.id,
        dept?.id ?? null,
        currentZone,
        currentStatus,
        washCycles,
        lifecycleStatus,
        purchaseDate,
        chosenType.unitValue,
        missing,
        missingSince,
        damaged,
        disposed,
        disposedAt,
        lastReadAt,
        lastReader.id
      );
    }
  }
  db.exec("COMMIT");
} catch (e) {
  db.exec("ROLLBACK");
  throw e;
}
console.log(`Inserted ${itemCounter} items.`);

// ---------------------------------------------------------------------------
// 6. RFID Events (~2,200 realistic events across last 48h)
// ---------------------------------------------------------------------------
console.log("Generating RFID events...");
const insEvent = db.prepare(
  `INSERT INTO RfidEvent (id, itemId, readerId, zone, eventType, status, timestamp) VALUES (?,?,?,?,?,?,?)`
);
const sampleItems = db
  .prepare(`SELECT id, itemCode, currentZone, currentStatus, lastReaderId FROM Item ORDER BY RANDOM() LIMIT 2200`)
  .all() as { id: string; itemCode: string; currentZone: string; currentStatus: string; lastReaderId: string | null }[];

const eventTypeForZone: Record<string, string> = {
  RECEIVING: "RECEIVED",
  SORTING: "SORTED",
  WASHING: "WASHING",
  DRYING: "DRYING",
  FOLDING: "FOLDING",
  QUALITY_CHECK: "READY",
  READY: "READY",
  DISPATCH: "DISPATCHED",
  WITH_CUSTOMER: "RETURNED",
  CUSTOMER_RETURN: "MISSING",
  DISPOSED: "DISPOSED",
};

db.exec("BEGIN TRANSACTION");
for (const it of sampleItems) {
  const eventType = eventTypeForZone[it.currentZone] ?? "RECEIVED";
  const readerId = it.lastReaderId ?? pick(readers).id;
  const hoursBack = randInt(0, 48);
  const ts = new Date(now.getTime() - hoursBack * 3600 * 1000 - randInt(0, 3600) * 1000).toISOString();
  insEvent.run(
    id(),
    it.id,
    readerId,
    it.currentZone,
    eventType,
    it.currentStatus === "MISSING" ? "Missing" : "Active",
    ts
  );
}
db.exec("COMMIT");
console.log(`Inserted ${sampleItems.length} RFID events.`);

// ---------------------------------------------------------------------------
// 7. Settlements & Reconciliation
// ---------------------------------------------------------------------------
console.log("Generating settlements & reconciliation...");
const insSettlement = db.prepare(
  `INSERT INTO Settlement (id, customerId, periodLabel, status) VALUES (?,?,?, 'FINALIZED')`
);
const insSettlementLine = db.prepare(`
  INSERT INTO SettlementLine (id, settlementId, itemTypeId, sent, returned, missing, washCycles, pricePerCycle, amount)
  VALUES (?,?,?,?,?,?,?,?,?)
`);
const insReconciliation = db.prepare(`
  INSERT INTO Reconciliation (id, customerId, batchDate, expected, received, missingCount, expectedValue, missingValue)
  VALUES (?,?,?,?,?,?,?,?)
`);

for (const c of customers) {
  const settlementId = id();
  insSettlement.run(settlementId, c.id, "Jul 2026");

  const rows = db
    .prepare(
      `SELECT itemTypeId, COUNT(*) as total, SUM(missing) as missingCount, SUM(value) as totalValue
       FROM Item WHERE customerId = ? GROUP BY itemTypeId`
    )
    .all(c.id) as { itemTypeId: string; total: number; missingCount: number; totalValue: number }[];

  let expected = 0;
  let expectedValue = 0;
  let receivedTotal = 0;
  let missingValue = 0;

  for (const row of rows) {
    const type = itemTypes.find((t) => t.id === row.itemTypeId)!;
    const sent = row.total;
    const missingCount = row.missingCount || 0;
    const returned = sent - missingCount;
    const amount = returned * type.pricePerCycle;
    insSettlementLine.run(id(), settlementId, type.id, sent, returned, missingCount, returned, type.pricePerCycle, Math.round(amount * 100) / 100);

    expected += sent;
    expectedValue += row.totalValue || 0;
    receivedTotal += returned;
    missingValue += missingCount * type.unitValue;
  }

  insReconciliation.run(
    id(),
    c.id,
    now.toISOString(),
    expected,
    receivedTotal,
    expected - receivedTotal,
    Math.round(expectedValue * 100) / 100,
    Math.round(missingValue * 100) / 100
  );
}

// ---------------------------------------------------------------------------
// 8. Users
// ---------------------------------------------------------------------------
console.log("Creating users...");
const insUser = db.prepare(`INSERT INTO User (id, name, email, passwordHash, role) VALUES (?,?,?,?,?)`);
const roleSeeds = [
  { name: "Aneena Antony", email: "aneena.antony@ibtechintl.com", role: "SUPER_ADMIN", password: "Aneenaantony@123" },
];
for (const u of roleSeeds) {
  insUser.run(id(), u.name, u.email, bcrypt.hashSync(u.password, 8), u.role);
}

// ---------------------------------------------------------------------------
// 9. Alerts
// ---------------------------------------------------------------------------
console.log("Creating alerts...");
const insAlert = db.prepare(
  `INSERT INTO Alert (id, severity, message, category, relatedType, relatedId, createdAt, resolved) VALUES (?,?,?,?,?,?,?,0)`
);
const disposalCount = (db.prepare(`SELECT COUNT(*) as c FROM Item WHERE lifecycleStatus='DISPOSAL_REQUIRED' AND disposed=0`).get() as { c: number }).c;
const missing48h = (db.prepare(`SELECT COUNT(*) as c FROM Item WHERE missing=1 AND missingSince <= ?`).get(isoDaysAgo(2)) as { c: number }).c;

insAlert.run(id(), "CRITICAL", `${disposalCount} items exceeded wash limit and require disposal review.`, "WASH_LIMIT", null, null, isoDaysAgo(0));
insAlert.run(id(), "WARNING", `${missing48h} towels missing for more than 48 hours.`, "MISSING", null, null, isoDaysAgo(0));
insAlert.run(id(), "WARNING", "RDR-004 RFID reader offline.", "READER", "RfidReader", readers.find((r) => r.code === "RDR-004")!.id, isoDaysAgo(0));
insAlert.run(id(), "INFO", "Hospital A laundry batch completed.", "BATCH", "Customer", customers.find((c) => c.name === "Hospital A")!.id, isoDaysAgo(0));
const hospA = customers.find((c) => c.name === "Hospital A")!;
const reconA = db.prepare(`SELECT * FROM Reconciliation WHERE customerId = ?`).get(hospA.id) as { missingCount: number } | undefined;
insAlert.run(
  id(),
  "CRITICAL",
  `Customer reconciliation difference: ${reconA?.missingCount ?? 0} items (Hospital A).`,
  "RECONCILIATION",
  "Customer",
  hospA.id,
  isoDaysAgo(0)
);
insAlert.run(id(), "SUCCESS", "Gym A reconciliation completed with no discrepancies flagged for review.", "BATCH", "Customer", customers.find((c) => c.name === "Gym A")!.id, isoDaysAgo(1));
insAlert.run(id(), "WARNING", "RDR-011 reader showing reduced read rate — inspection recommended.", "READER", "RfidReader", readers.find((r) => r.code === "RDR-011")!.id, isoDaysAgo(0));

// ---------------------------------------------------------------------------
// 10. Daily snapshots (90 days) for trend charts
// ---------------------------------------------------------------------------
console.log("Generating daily snapshots...");
const insSnapshot = db.prepare(`
  INSERT INTO DailySnapshot (id, date, totalItems, withCustomers, inLaundry, ready, missing, nearEol, disposalRequired, inventoryValue, lossValue, laundryProcessed, readerReads)
  VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
`);

const todayTotals = db.prepare(`
  SELECT
    COUNT(*) as total,
    SUM(CASE WHEN currentStatus='ACTIVE' THEN 1 ELSE 0 END) as withCustomers,
    SUM(CASE WHEN currentStatus='IN_LAUNDRY' THEN 1 ELSE 0 END) as inLaundry,
    SUM(CASE WHEN currentStatus='READY' THEN 1 ELSE 0 END) as ready,
    SUM(CASE WHEN missing=1 THEN 1 ELSE 0 END) as missing,
    SUM(CASE WHEN lifecycleStatus='NEAR_END_OF_LIFE' THEN 1 ELSE 0 END) as nearEol,
    SUM(CASE WHEN lifecycleStatus='DISPOSAL_REQUIRED' AND disposed=0 THEN 1 ELSE 0 END) as disposalRequired,
    SUM(CASE WHEN disposed=0 THEN value ELSE 0 END) as inventoryValue,
    SUM(CASE WHEN missing=1 THEN value ELSE 0 END) as lossValue
  FROM Item
`).get() as {
  total: number; withCustomers: number; inLaundry: number; ready: number; missing: number;
  nearEol: number; disposalRequired: number; inventoryValue: number; lossValue: number;
};

db.exec("BEGIN TRANSACTION");
const DAYS = 90;
for (let i = DAYS; i >= 0; i--) {
  const date = daysAgo(i);
  const progress = (DAYS - i) / DAYS; // 0 -> 1 over the window, 1 = today
  const noise = () => 1 + (Math.random() - 0.5) * 0.06;

  const total = Math.round(todayTotals.total * (0.94 + 0.06 * progress) * noise());
  const withCustomers = Math.round(todayTotals.withCustomers * (0.93 + 0.07 * progress) * noise());
  const inLaundry = Math.round(todayTotals.inLaundry * (0.85 + 0.15 * progress) * noise());
  const ready = Math.round(todayTotals.ready * (0.85 + 0.15 * progress) * noise());
  const missing = Math.max(0, Math.round(todayTotals.missing * (1.35 - 0.35 * progress) * noise()));
  const nearEol = Math.round(todayTotals.nearEol * (0.7 + 0.3 * progress) * noise());
  const disposalRequired = Math.round(todayTotals.disposalRequired * (0.6 + 0.4 * progress) * noise());
  const inventoryValue = Math.round(todayTotals.inventoryValue * (0.92 + 0.08 * progress) * noise());
  const lossValue = Math.max(0, Math.round(todayTotals.lossValue * (1.3 - 0.3 * progress) * noise()));
  const laundryProcessed = Math.round(6800 + 2200 * Math.sin(i / 6) * 0.3 + 2200 * progress + (Math.random() - 0.5) * 800);
  const readerReads = Math.round(1650000 + 250000 * progress + (Math.random() - 0.5) * 120000);

  insSnapshot.run(
    id(),
    date.toISOString().slice(0, 10),
    i === 0 ? todayTotals.total : total,
    i === 0 ? todayTotals.withCustomers : withCustomers,
    i === 0 ? todayTotals.inLaundry : inLaundry,
    i === 0 ? todayTotals.ready : ready,
    i === 0 ? todayTotals.missing : missing,
    i === 0 ? todayTotals.nearEol : nearEol,
    i === 0 ? todayTotals.disposalRequired : disposalRequired,
    i === 0 ? todayTotals.inventoryValue : inventoryValue,
    i === 0 ? todayTotals.lossValue : lossValue,
    Math.max(0, laundryProcessed),
    Math.max(0, readerReads)
  ); 
}
db.exec("COMMIT");
console.log("Daily snapshots generated.");

console.log("Seed complete.");

