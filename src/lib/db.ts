import { DatabaseSync } from "node:sqlite";
import fs from "node:fs";
import path from "node:path";

// Node's built-in SQLite driver -- no native compilation, no network required.
// This keeps the prototype runnable anywhere Node 22+ runs. The relational
// model is identical to prisma/schema.prisma; swapping to real PostgreSQL +
// Prisma Client in a networked environment is a drop-in change (see README).

declare global {
  // eslint-disable-next-line no-var
  var __rfidDb: DatabaseSync | undefined;
}

const DB_PATH = path.join(process.cwd(), "data", "app.db");

function createConnection(): DatabaseSync {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new DatabaseSync(DB_PATH);
  db.exec("PRAGMA journal_mode = WAL;");
  db.exec("PRAGMA foreign_keys = ON;");

  const schemaPath = path.join(process.cwd(), "src", "lib", "schema.sql");
  const schema = fs.readFileSync(schemaPath, "utf-8");
  db.exec(schema);

  return db;
}

export function getDb(): DatabaseSync {
  if (!global.__rfidDb) {
    global.__rfidDb = createConnection();
  }
  return global.__rfidDb;
}

export function isSeeded(): boolean {
  const db = getDb();
  const row = db.prepare("SELECT COUNT(*) as c FROM Item").get() as { c: number };
  return row.c > 0;
}

// node:sqlite returns rows as null-prototype objects, which React Server
// Components refuses to serialize across the client boundary. Normalize to
// plain objects at the query boundary so callers never have to think about it.
function toPlain<T>(row: unknown): T {
  return { ...(row as object) } as T;
}

export function all<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T[] {
  const rows = getDb().prepare(sql).all(...(params as never[]));
  return rows.map((r) => toPlain<T>(r));
}

export function get<T = Record<string, unknown>>(sql: string, params: unknown[] = []): T | undefined {
  const row = getDb().prepare(sql).get(...(params as never[]));
  return row === undefined ? undefined : toPlain<T>(row);
}

export function run(sql: string, params: unknown[] = []) {
  return getDb().prepare(sql).run(...(params as never[]));
}
