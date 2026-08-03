/* eslint-disable no-console */
/**
 * Fast bootstrap: create the demo admin if the User table is empty.
 * Safe to run on every boot (seconds). Full inventory seed stays in `npm run seed`.
 */
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { getDb } from "../src/lib/db";

const DEMO = {
  name: "Aneena Antony",
  email: "aneena.antony@ibtechintl.com",
  password: "Aneenaantony@123",
  role: "SUPER_ADMIN",
};

const db = getDb();
const row = db.prepare("SELECT COUNT(*) as c FROM User").get() as { c: number };

if (row.c > 0) {
  console.log(`[ensure-demo-user] ${row.c} user(s) present — skipping.`);
  process.exit(0);
}

const hash = bcrypt.hashSync(DEMO.password, 8);
db.prepare(
  `INSERT INTO User (id, name, email, passwordHash, role) VALUES (?,?,?,?,?)`
).run(crypto.randomUUID(), DEMO.name, DEMO.email, hash, DEMO.role);

console.log(`[ensure-demo-user] Created demo admin: ${DEMO.email}`);
process.exit(0);
