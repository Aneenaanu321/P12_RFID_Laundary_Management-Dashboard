# Lighthouse gate (UI “done” checklist)

Run this audit against a **production** build before calling the dashboard UI done.
Dev mode scores are not representative.

## How to run

```bash
npm run seed          # if data/app.db is missing
npm run build
npm run start         # http://localhost:3000
# in another terminal:
npm run lighthouse
```

Or point at another URL:

```bash
LIGHTHOUSE_URL=http://127.0.0.1:3000 npm run lighthouse
```

## Pass thresholds

| Category         | Min score |
|------------------|-----------|
| Performance      | 70        |
| Accessibility    | 90        |
| Best Practices   | 90        |
| SEO              | 90        |

`npm run lighthouse` exits non-zero if any category is below its threshold.
JSON output lands in `lighthouse-report/report.json`.

## Manual checklist (before merge / release)

- [ ] Production build starts cleanly (`npm run build && npm run start`)
- [ ] Sign in with a seeded account and open `/` (dashboard)
- [ ] `npm run lighthouse` passes all four category thresholds above
- [ ] Spot-check Lighthouse “Accessibility” opportunities — no outstanding
      contrast / missing-name issues on KPI cards or charts
- [ ] Spot-check Performance opportunities — no unused blocking scripts on
      the dashboard first load
- [ ] Re-run after significant UI changes (new widgets, chart libraries, etc.)

## Notes

- Authenticated routes may redirect to `/login` when audited without a
  session. For a full dashboard audit, either:
  - audit `/login` for shell/SEO/a11y of the public surface, then
  - use a logged-in Chromium profile / cookie for `/`, **or**
  - rely on Playwright smoke tests (`npm run test:e2e`) for authenticated
    KPI/chart rendering and use Lighthouse on `/login` + public assets.
- Prefer auditing `/login` in CI (no session required) and keeping the
  authenticated dashboard covered by Playwright.
