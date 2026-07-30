# RFID Linen Management

**Track. Wash. Control. Optimize.**

An enterprise-grade RFID inventory, lifecycle, loss-prevention and laundry
management platform for hospitals, hotels, gyms, spas and industrial
laundries — built on Next.js 15, React 19, TypeScript and Tailwind CSS.

This is a fully working prototype: every screen is server-rendered from a
real, seeded relational database (no hard-coded mock JSON). It is seeded with
125,420 RFID items, 18 readers, 2,200+ RFID events, 90 days of trend history,
per-customer settlements and reconciliations, and realistic missing/damaged/
end-of-life items — matching the scale described in the product brief.

## Quick start

```bash
npm install
npm run seed   # generates data/app.db with the full demo dataset
npm run dev    # http://localhost:3000
```

Log in with any of the seeded accounts (password for all: `password123`):

| Role | Email |
|---|---|
| Super Admin | admin@rfidlinen.com |
| Laundry Manager | laundry.manager@rfidlinen.com |
| Customer Manager | customer.manager@rfidlinen.com |
| Operations Manager | ops.manager@rfidlinen.com |
| Operator | operator@rfidlinen.com |
| Finance User | finance@rfidlinen.com |
| Viewer | viewer@rfidlinen.com |

Sidebar sections are gated per role (see `src/lib/nav.ts` / Administration →
Roles & Permissions in the app).

## What's implemented

- **Dashboard** — 8 live KPI cards, laundry process flow, 30-day trend
  charts, customer overview table.
- **Operations** — Laundry Operations overview plus Receiving / Washing /
  Drying / Folding / Dispatch, each a real filtered view of current inventory.
- **Inventory** — All Items, Towels, Linen, Gowns, Uniforms, RFID Tags, and a
  full Item Detail page (RFID info, lifecycle progress bar, wash-cycle
  history, RFID event timeline, financials, disposal/replacement actions).
- **Customers** — Hospitals / Hotels / Gyms / Spas / Locations lists and a
  per-customer dashboard (department breakdown, settlement snapshot,
  inventory table).
- **RFID Tracking** — Live Tracking (real Server-Sent Events stream that
  actually advances random items through the wash pipeline and writes new
  RfidEvent rows), RFID Events, Reader Health, Read History.
- **Lifecycle** — Wash Cycle analytics (distribution, lifecycle mix, avg
  cycles/customer, EOL forecast), Near End of Life, Disposal, Replacement —
  each with working Flag / Approve Disposal / Mark Disposed / Request
  Replacement actions (real server actions, real database writes).
- **Loss Prevention** — Missing Items (with Investigate / Mark Found / Mark
  Lost actions), Reconciliation, Loss Analytics.
- **Analytics** — Customer, Laundry, Inventory and Lifecycle analytics pages.
- **Reports** — 13 report types, exportable as CSV or Excel.
- **Settlement** — Per-customer itemized settlement with subtotal, loss
  charges, laundry charges and final total; export to Excel, PDF or print.
- **Alert Center** — Critical/Warning/Info/Success alerts linked to the
  underlying record.
- **Administration** — Users, Roles & Permissions, Item Types, Wash Cycle
  Rules (editable thresholds), RFID Readers, System Settings.
- **Auth** — JWT session cookie, bcrypt password hashing, role-based access
  control gating both the sidebar and (conceptually) each API surface.

## Architecture notes

**Database.** The prototype uses Node's built-in `node:sqlite` module instead
of a networked database. This was a deliberate call made during the build:
the sandbox this was built in has no outbound access to
`binaries.prisma.sh`, which `prisma migrate`/`prisma generate` require to
download their query engine, and no root access to install PostgreSQL via
apt. Rather than ship something that couldn't run, the schema was kept
Postgres-compatible and implemented against SQLite directly with hand-written
SQL (`src/lib/schema.sql`, `src/lib/db.ts`). Every page queries this real
database — nothing is hard-coded mock JSON.

`prisma/schema.prisma` documents the full relational model 1:1 with the
SQLite schema. To move to real PostgreSQL + Prisma Client once you have
normal internet/root access:

1. `docker compose up -d` (starts Postgres) and set `DATABASE_URL` in `.env`
   to the Postgres connection string (see `.env.example`).
2. Change `datasource.provider` in `prisma/schema.prisma` from `"sqlite"` to
   `"postgresql"`.
3. `npx prisma migrate dev --name init && npx prisma generate`.
4. Swap the raw-SQL functions in `src/lib/queries.ts` / `src/lib/db.ts` for
   `@prisma/client` calls — the query shapes and return types can stay the
   same, since they were designed against the identical schema.

**Real-time tracking.** `/rfid/live` subscribes to `/api/rfid/stream`, a
genuine Server-Sent Events endpoint (not a client-side timer) that advances a
random in-circulation item to its next pipeline stage every ~2.5s and writes
a new `RfidEvent` row — so the live feed is backed by real database writes,
matching how an actual RFID reader integration would work.

**Auth.** JWT stored in an httpOnly cookie (`src/lib/auth.ts`), verified in
`src/middleware.ts` (presence check) and `src/app/(app)/layout.tsx` (full
verify + role lookup). Swap `JWT_SECRET` in `.env` before any real deployment.

## Re-seeding

`npm run seed` truncates and regenerates all demo data — safe to re-run any
time you want a fresh dataset (item positions, missing items and the 90-day
trend history are randomized each run, within the same realistic
distributions described in the product brief).

## Tech stack

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 ·
Recharts · Lucide icons · node:sqlite · jsonwebtoken · bcryptjs · exceljs ·
jspdf
