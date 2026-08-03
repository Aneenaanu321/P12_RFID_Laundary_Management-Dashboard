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

## Deploy

- **Render (recommended for this SQLite prototype):** see [`docs/DEPLOY.md`](docs/DEPLOY.md) and [`render.yaml`](render.yaml).
- **Vercel:** not supported with local SQLite — needs Turso/Postgres first (details in the deploy doc).

