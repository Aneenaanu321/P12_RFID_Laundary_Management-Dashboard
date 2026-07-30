-- RFID Linen Management — SQLite schema (mirrors prisma/schema.prisma)
-- Runs with Node's built-in node:sqlite driver — zero native deps, zero network.

CREATE TABLE IF NOT EXISTS Customer (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL,
  contactEmail TEXT,
  contactPhone TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_customer_type ON Customer(type);

CREATE TABLE IF NOT EXISTS Location (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL REFERENCES Customer(id),
  name TEXT NOT NULL,
  city TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_location_customer ON Location(customerId);

CREATE TABLE IF NOT EXISTS Department (
  id TEXT PRIMARY KEY,
  locationId TEXT NOT NULL REFERENCES Location(id),
  name TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_department_location ON Department(locationId);

CREATE TABLE IF NOT EXISTS ItemType (
  id TEXT PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL,
  unitValue REAL NOT NULL,
  pricePerCycle REAL NOT NULL,
  maxWashCycles INTEGER NOT NULL,
  monitorThresholdPct INTEGER NOT NULL DEFAULT 60,
  nearEolThresholdPct INTEGER NOT NULL DEFAULT 80
);

CREATE TABLE IF NOT EXISTS RfidReader (
  id TEXT PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  zone TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ONLINE',
  firmware TEXT NOT NULL,
  readsToday INTEGER NOT NULL DEFAULT 0,
  readsPerMin INTEGER NOT NULL DEFAULT 0,
  lastCommAt TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_reader_status ON RfidReader(status);

CREATE TABLE IF NOT EXISTS Item (
  id TEXT PRIMARY KEY,
  epc TEXT UNIQUE NOT NULL,
  itemCode TEXT UNIQUE NOT NULL,
  itemTypeId TEXT NOT NULL REFERENCES ItemType(id),
  customerId TEXT NOT NULL REFERENCES Customer(id),
  locationId TEXT REFERENCES Location(id),
  departmentId TEXT REFERENCES Department(id),
  currentZone TEXT NOT NULL,
  currentStatus TEXT NOT NULL,
  washCycles INTEGER NOT NULL DEFAULT 0,
  lifecycleStatus TEXT NOT NULL DEFAULT 'ACTIVE',
  purchaseDate TEXT NOT NULL,
  value REAL NOT NULL,
  missing INTEGER NOT NULL DEFAULT 0,
  missingSince TEXT,
  damaged INTEGER NOT NULL DEFAULT 0,
  disposed INTEGER NOT NULL DEFAULT 0,
  disposedAt TEXT,
  lastReadAt TEXT NOT NULL DEFAULT (datetime('now')),
  lastReaderId TEXT REFERENCES RfidReader(id)
);
CREATE INDEX IF NOT EXISTS idx_item_customer ON Item(customerId);
CREATE INDEX IF NOT EXISTS idx_item_type ON Item(itemTypeId);
CREATE INDEX IF NOT EXISTS idx_item_status ON Item(currentStatus);
CREATE INDEX IF NOT EXISTS idx_item_lifecycle ON Item(lifecycleStatus);
CREATE INDEX IF NOT EXISTS idx_item_missing ON Item(missing);
CREATE INDEX IF NOT EXISTS idx_item_disposed ON Item(disposed);
CREATE INDEX IF NOT EXISTS idx_item_zone ON Item(currentZone);

CREATE TABLE IF NOT EXISTS RfidEvent (
  id TEXT PRIMARY KEY,
  itemId TEXT NOT NULL REFERENCES Item(id),
  readerId TEXT NOT NULL REFERENCES RfidReader(id),
  zone TEXT NOT NULL,
  eventType TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  timestamp TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS idx_event_item ON RfidEvent(itemId);
CREATE INDEX IF NOT EXISTS idx_event_reader ON RfidEvent(readerId);
CREATE INDEX IF NOT EXISTS idx_event_timestamp ON RfidEvent(timestamp);
CREATE INDEX IF NOT EXISTS idx_event_type ON RfidEvent(eventType);

CREATE TABLE IF NOT EXISTS Settlement (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL REFERENCES Customer(id),
  periodLabel TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  status TEXT NOT NULL DEFAULT 'DRAFT'
);

CREATE TABLE IF NOT EXISTS SettlementLine (
  id TEXT PRIMARY KEY,
  settlementId TEXT NOT NULL REFERENCES Settlement(id),
  itemTypeId TEXT NOT NULL REFERENCES ItemType(id),
  sent INTEGER NOT NULL,
  returned INTEGER NOT NULL,
  missing INTEGER NOT NULL,
  washCycles INTEGER NOT NULL,
  pricePerCycle REAL NOT NULL,
  amount REAL NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_settlementline_settlement ON SettlementLine(settlementId);

CREATE TABLE IF NOT EXISTS Reconciliation (
  id TEXT PRIMARY KEY,
  customerId TEXT NOT NULL REFERENCES Customer(id),
  batchDate TEXT NOT NULL DEFAULT (datetime('now')),
  expected INTEGER NOT NULL,
  received INTEGER NOT NULL,
  missingCount INTEGER NOT NULL,
  expectedValue REAL NOT NULL,
  missingValue REAL NOT NULL
);

CREATE TABLE IF NOT EXISTS User (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  role TEXT NOT NULL,
  createdAt TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS PasswordResetToken (
  id TEXT PRIMARY KEY,
  userId TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expiresAt TEXT NOT NULL,
  used INTEGER NOT NULL DEFAULT 0,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  FOREIGN KEY (userId) REFERENCES User(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_reset_token ON PasswordResetToken(token);

CREATE TABLE IF NOT EXISTS Alert (
  id TEXT PRIMARY KEY,
  severity TEXT NOT NULL,
  message TEXT NOT NULL,
  category TEXT NOT NULL,
  relatedType TEXT,
  relatedId TEXT,
  createdAt TEXT NOT NULL DEFAULT (datetime('now')),
  resolved INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS idx_alert_severity ON Alert(severity);
CREATE INDEX IF NOT EXISTS idx_alert_resolved ON Alert(resolved);

CREATE TABLE IF NOT EXISTS DailySnapshot (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL,
  totalItems INTEGER NOT NULL,
  withCustomers INTEGER NOT NULL,
  inLaundry INTEGER NOT NULL,
  ready INTEGER NOT NULL,
  missing INTEGER NOT NULL,
  nearEol INTEGER NOT NULL,
  disposalRequired INTEGER NOT NULL,
  inventoryValue REAL NOT NULL,
  lossValue REAL NOT NULL,
  laundryProcessed INTEGER NOT NULL,
  readerReads INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_snapshot_date ON DailySnapshot(date);
