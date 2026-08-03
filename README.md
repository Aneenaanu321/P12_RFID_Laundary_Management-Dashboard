# RFID Linen Management

**Track. Wash. Control. Optimize.**

An enterprise-grade RFID inventory, lifecycle, loss-prevention and laundry
management platform for hospitals, hotels, gyms, spas and industrial
laundries.

This is a fully working **prototype**: every screen is server-rendered from a
**local seeded SQLite** database (not a live ibTech cloud feed). It ships with
~125k RFID items, 18 readers, 2,200+ events, 90 days of trends, settlements,
and realistic missing / EOL scenarios.

## Quick start

```bash
npm install
npm run seed        # generates data/app.db
npm run ensure-demo-user   # optional: demo admin only
npm run dev         # http://localhost:3000
```

**Demo login:** `aneena.antony@ibtechintl.com` / `Aneenaantony@123`

## Technology stack

| Layer | Stack |
|-------|--------|
| Framework | **Next.js 15** (App Router), **React 19**, **TypeScript** |
| Styling | **Tailwind CSS 4**, CSS design tokens (light/dark), Lucide icons |
| UI kit | CVA buttons, cards, modals, toasts, DataTable, ConfirmDialog |
| Charts | **Recharts** (lazy-loaded on the dashboard) |
| Tables | **TanStack Table** (sort/filter where used) |
| Database | **Node.js `node:sqlite`** → `data/app.db` (runtime) |
| ORM (future) | **Prisma** + schema for Postgres migration (not used at runtime) |
| Auth | **bcryptjs** passwords, **jsonwebtoken** session cookie, middleware gate |
| Validation | **Zod** |
| Exports | **ExcelJS**, **jsPDF** (+ autotable) |
| Realtime | Server-Sent Events (`/api/rfid/stream`) |
| Tooling | **ESLint**, **Playwright** e2e, **Node test** unit tests, Lighthouse script |
| Runtime | **Node ≥ 22.5** (required for `node:sqlite`) |
| Hosting | **Render** (recommended); Vercel needs remote DB first |

## Docs

- [User guide (every page)](docs/USER_GUIDE.md)
- [Deploy](docs/DEPLOY.md)
- [Lighthouse checklist](docs/LIGHTHOUSE_CHECKLIST.md)
- [Page suggestions / rating roadmap](docs/PAGE_SUGGESTIONS.md)

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Local development |
| `npm run build` / `start` | Production build / serve (start bootstraps demo user) |
| `npm run seed` | Full demo dataset |
| `npm run test:unit` | Unit tests (`src/**/*.test.ts`) |
| `npm run test:e2e` | Playwright smoke tests |
| `npm run lighthouse` | Performance audit helper |

## Deploy

- **Render (recommended for SQLite):** [`docs/DEPLOY.md`](docs/DEPLOY.md), [`render.yaml`](render.yaml)
- **Vercel:** not supported with local SQLite — migrate to Turso/Postgres first
