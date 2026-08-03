# Deploying RFID Linen Management

This app uses **Node 22+** and a local **SQLite** file (`data/app.db`) via
`node:sqlite`. That shapes which hosts work out of the box.

| Host | Fits this prototype? | Notes |
|------|----------------------|--------|
| **Render** | Yes (recommended) | Long-running Node process; seed DB during build |
| **Vercel** | Not without DB change | No persistent local SQLite; needs Turso/Neon/Postgres |
| Railway / Fly.io | Yes | Similar to Render (persistent disk optional) |

---

## Render (recommended)

### One-click / Blueprint

1. Push this repo to GitHub (include the latest commits).
2. Open [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
3. Connect the repo. Render reads [`render.yaml`](../render.yaml).
4. Apply the blueprint. First build runs `npm run seed` (several minutes) then `next build`.
5. Open the service URL → `/login`.

Demo login after seed:

- Email: `aneena.antony@ibtechintl.com`
- Password: `Aneenaantony@123`

### Manual Web Service

- **Runtime:** Node  
- **Build command:** `npm ci && npm run seed && npm run build`  
- **Start command:** `npm run start`  
- **Node version:** `22.14.0` (env `NODE_VERSION=22.14.0`)  
- **Env vars:**
  - `JWT_SECRET` — long random string (required in production)
  - `NODE_ENV=production`
  - Optional: `DATABASE_PATH=/var/data/app.db` if you attach a disk

### Persistent Disk (optional, paid)

Free instances lose filesystem writes on redeploy. Seed-at-build still gives a
full demo. For durable data:

1. Add a disk mounted at `/var/data`
2. Set `DATABASE_PATH=/var/data/app.db`
3. Prefer build without seed, and run `npm run ensure-seed` once on first boot
   (or keep seed in build pointing at the disk — only if the disk is available
   at build time, which it usually is not; seed on first start instead)

### Health check

`/login` is used so the check does not require an authenticated session.

---

## Vercel

**Do not deploy this SQLite prototype to Vercel as-is.** Serverless functions
cannot keep a writable `data/app.db` between invocations, and the ~80MB seed
DB is a poor fit for the function bundle.

To use Vercel later you must move storage to a remote DB, for example:

1. **Turso (libSQL)** — SQLite-compatible remote DB  
2. **Neon / Vercel Postgres** — port `src/lib/queries.ts` to Prisma/Postgres
   (see `docker-compose.yml` and `prisma/schema.prisma`)

Until then, use **Render**.

If you still connect the repo in Vercel for previews of UI-only work, set:

- Environment variable `JWT_SECRET`
- Node.js **22.x** in Project Settings → General

Expect runtime/DB failures until the database is migrated.

---

## Environment variables

Copy from `.env.example`:

```bash
JWT_SECRET="replace-with-a-long-random-string"
# Optional overrides:
# DATA_DIR="/var/data"
# DATABASE_PATH="/var/data/app.db"
```

Never commit real `.env` files.

---

## Local production smoke test

```bash
npm ci
npm run seed
npm run build
npm run start
# open http://localhost:3000
```
