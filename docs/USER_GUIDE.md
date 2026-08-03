# End-to-end user guide — RFID Linen Management

This guide explains how the app works page by page. Data comes from a **local
seeded SQLite database** (`data/app.db`), not a live ibTech cloud API. Branding
is ibTech; RFID “live” views stream from the local DB over SSE.

**Demo login:** `aneena.antony@ibtechintl.com` / `Aneenaantony@123`

---

## Auth

| Page | What it does |
|------|----------------|
| `/login` | Sign in with email/password. JWT session cookie. Optional “Remember me” (30 days). |
| `/signup` | Create a VIEWER account and auto-sign-in. |
| `/forgot-password` | Demo reset: shows an in-app reset link (no email). |
| `/reset-password` | Set a new password with the token from forgot-password. |

Unauthenticated visits to app routes redirect to `/login?from=…`.

---

## Dashboard (`/`)

Operations overview for the signed-in role:

- **KPIs** — total items, in laundry, ready, missing, near EOL, loss value.
- **Filters** — customer type, date range, compare previous period.
- **Charts** — inventory / missing / loss trends, status mix, top missing customers (lazy-loaded).
- **Process flow** — wash pipeline stage counts.
- **System health** — reader health + live alerts.
- **Settlement summary** — open / overdue settlement snapshot.
- **Pinned / recently viewed** — per-user personalization in browser storage.
- **Customer overview** — orgs with inventory and missing counts.

Light/dark theme toggle is in the header.

---

## Operations

| Route | Purpose |
|-------|---------|
| `/operations` | All items currently in laundry + process flow. |
| `/operations/receiving` | Receiving zone queue. |
| `/operations/washing` | Wash stage. |
| `/operations/drying` | Dry stage. |
| `/operations/folding` | Fold stage. |
| `/operations/dispatch` | Dispatch / outbound. |

---

## Inventory

| Route | Purpose |
|-------|---------|
| `/inventory` | All RFID items (filterable / paginated). |
| `/inventory/towels|linen|gowns|uniforms|tags` | Filtered by item type. |
| `/inventory/[itemCode]` | Item detail, wash progress, event timeline. Actions: Flag, Mark Found, Mark Lost, Request Replacement (with confirm dialogs). |

---

## Customers

| Route | Purpose |
|-------|---------|
| `/customers/hospitals|hotels|gyms|spas` | Customers by vertical. |
| `/customers/locations` | Locations list. |
| `/customers/[customerId]` | Customer detail + inventory summary. Pin from here for the dashboard widget. |

---

## RFID

| Route | Purpose |
|-------|---------|
| `/rfid/live` | Live feed (SSE from `/api/rfid/stream`). |
| `/rfid/events` | Historical RFID events. |
| `/rfid/readers` | Reader list and status. |
| `/rfid/history` | Longer history / movement trail. |

---

## Lifecycle

| Route | Purpose |
|-------|---------|
| `/lifecycle/wash-cycles` | Items by wash-cycle usage. |
| `/lifecycle/near-eol` | Approaching wash limit. |
| `/lifecycle/disposal` | Disposal workflow (approve / mark disposed). |
| `/lifecycle/replacement` | Replacement requests. |

Destructive actions use confirmation dialogs.

---

## Loss prevention

| Route | Purpose |
|-------|---------|
| `/loss/missing` | Missing items — Investigate, Mark Found, Mark Lost. |
| `/loss/reconciliation` | Reconciliation batches. |
| `/loss/analytics` | Loss trends and value at risk. |

---

## Analytics & finance

| Route | Purpose |
|-------|---------|
| `/analytics/customers` | Customer analytics. |
| `/analytics/laundry` | Laundry throughput analytics. |
| `/analytics/inventory` | Inventory analytics. |
| `/analytics/lifecycle` | Lifecycle analytics. |
| `/reports` | Report downloads / exports. |
| `/settlement` | Settlements and export. |
| `/alerts` | Alert inbox. |

---

## Admin

| Route | Purpose |
|-------|---------|
| `/admin/users` | User directory. |
| `/admin/roles` | Role / permission reference. |
| `/admin/item-types` | Item type catalog. |
| `/admin/wash-rules` | Wash-cycle limits by type. |
| `/admin/readers` | Reader admin. |
| `/admin/settings` | App settings. |

---

## APIs (used by the UI)

- `GET /api/search` — header search.
- `GET /api/rfid/stream` — SSE live events.
- `GET /api/personalization/resolve` — pinned customer stats.
- `GET /api/reports`, `/api/settlement/export` — exports.
- `POST /api/auth/logout` — clear session.

---

## Data model (prototype)

SQLite via Node `node:sqlite` → `src/lib/db.ts` / `src/lib/queries.ts`.  
Seed with `npm run seed`. Prisma schema exists for a future Postgres migration and is **not** the runtime store.
