# Dashboard Improvement To-Do

Ideas to take the main dashboard (`src/app/(app)/page.tsx`) and its supporting
components from "functional prototype" to a polished, high-rating product
dashboard. Grouped by category, roughly ordered by impact within each group.

## 1. Filtering & date range control
- [ ] Global date range picker (7d / 30d / 90d / custom) that drives both
      trend charts instead of the hardcoded `getSnapshotSeries(30)`.
- [ ] Customer-type filter (Hospital / Hotel / Gym / Spa) that scopes the KPI
      cards and customer table to a segment.
- [ ] "Compare to previous period" toggle on trend charts (show prior-30-days
      as a faint second line).
- [ ] Persist selected filters in the URL query string so dashboard views are
      shareable/bookmarkable.

## 2. KPI cards (`KpiCard.tsx`)
- [ ] Add sparkline mini-charts inside each card (7-day micro trend) —
      Recharts `ResponsiveContainer` at ~40px height.
- [ ] Add target/goal indicators (e.g. "Missing Items" vs. an acceptable
      threshold) with a progress ring or colored bar.
- [ ] Make card grid user-reorderable / hideable (drag to reorder, persisted
      per-user — ties into role-based dashboard below).
- [ ] Click-to-expand a card into a modal with a longer trend + breakdown by
      customer/item-type.
- [ ] Loading skeleton state for KPI cards (currently renders straight from
      server data with no suspense boundary/fallback).

## 3. Charts & visualization
- [ ] Add a "Loss Value Trend" chart (currently only shown as a static KPI,
      no historical view) using `TrendAreaChart`.
- [ ] Add a donut chart for item-status mix (With Customer / In Laundry /
      Ready / Missing / EOL) — `DonutChart` component already exists but
      isn't used on the main dashboard.
- [ ] Add a `BarHorizontal` "Top 5 customers by missing items" widget.
- [ ] Annotate trend charts with event markers (e.g. spike in missing items
      on a given day, linkable to `/loss/analytics`).
- [ ] Add chart export (PNG/CSV) buttons on hover, matching the existing
      Reports export pattern (`exceljs`/`jspdf` already in the stack).
- [ ] Dark-mode-aware chart colors (`Charts.tsx` colors are hardcoded hex,
      won't adapt if dark mode is added — see #5).

## 4. Process flow (`ProcessFlow.tsx`)
- [ ] Show percentage of total alongside each stage count, not just raw
      number.
- [ ] Add a visual "flow width" (proportional bar/funnel) so bottleneck
      stages are visually obvious, not just numeric.
- [ ] Highlight stages with anomalous counts (e.g. items stuck > expected
      time) in amber/red.

## 5. Visual polish / theming
- [ ] Dark mode support (CSS vars already used for status colors in
      `globals.css` / `KpiCard.tsx` — extend that pattern site-wide with a
      `prefers-color-scheme` + manual toggle).
- [ ] Skeleton loaders / suspense fallbacks for all async server data instead
      of blank-until-loaded.
- [ ] Empty states for zero-data scenarios (e.g. brand-new tenant with no
      items yet) — `EmptyState.tsx` exists but isn't wired into the
      dashboard page.
- [ ] Subtle entrance animations for KPI cards / chart mount (Framer Motion
      or CSS transitions) — currently no motion at all.
- [ ] Consistent icon-in-tone treatment audit (tone colors are already good;
      make sure new widgets reuse the `--status-*` CSS vars, not new hex
      values).

## 6. Real-time & alerts
- [ ] Surface a compact "Live Alerts" widget on the dashboard itself (today
      alerts only live on `/alerts`) — top 3 critical alerts with a link to
      the full center.
- [ ] Wire the dashboard KPIs to the existing SSE stream (`/api/rfid/stream`)
      so "Currently In Laundry" / "Clean & Ready" update live instead of only
      on page load, same pattern already proven on `/rfid/live`.
- [ ] Toast/notification on new critical alert while dashboard is open.

## 7. Personalization / role awareness
- [ ] Role-specific dashboard variants — Finance sees settlement/loss value
      first, Operator sees process flow first, Admin sees system health
      first (roles already exist in `src/lib/nav.ts`).
- [ ] "Pin to dashboard" action from other pages (e.g. pin a specific
      customer's card to the overview).
- [ ] Recently viewed items/customers widget.

## 8. Data depth
- [ ] Add average turnaround time (receiving → dispatch) as a KPI — strong
      signal for laundry-ops "goodness" that isn't currently surfaced.
- [ ] Add a reader-health mini-widget (X/18 readers online) since RFID
      reader status is tracked elsewhere (`/rfid/readers`) but invisible from
      the main dashboard.
- [ ] Add cost-per-item or utilization-rate KPI for a more "executive
      summary" feel.
- [ ] Forecast line on the inventory/loss trend chart (simple linear
      projection) to show where trend is heading.

## 9. Accessibility
- [ ] Audit color contrast for status tones (amber/red on light backgrounds)
      against WCAG AA.
- [ ] Keyboard navigation + focus states for KPI cards and table rows
      (currently rely on default browser focus ring only).
- [ ] `aria-label`s on icon-only elements and chart containers for
      screen-reader users.

## 10. Performance & correctness
- [ ] Cache/memoize `getKpis()`, `getSnapshotSeries()`, `getProcessFlow()`,
      `getCustomers()` per request or with revalidation, so the dashboard
      isn't re-querying SQLite on every navigation.
- [ ] Paginate/virtualize the customer overview table once tenant count
      grows beyond a page or two (currently renders all rows unbounded).
- [ ] Add error boundaries around each dashboard section so one failed query
      doesn't blank the whole page.

## 11. Mobile / responsive
- [ ] Verify KPI grid collapse behavior below `md` breakpoint with real
      content (currently `grid-cols-2 md:grid-cols-4`, worth checking on
      narrow phones with 8 cards).
- [ ] Convert `CustomerOverviewTable` to stacked cards on mobile instead of
      horizontal-scroll table.
- [ ] Sticky/condensed header on scroll for long dashboard on mobile.

## 12. Testing & quality (raises "rating" independent of visuals)
- [ ] Add at least smoke tests (e.g. Playwright) that load the dashboard and
      assert KPI cards + charts render with seeded data.
- [ ] Add a loading/error state test for the SSE-driven pages.
- [ ] Lighthouse pass (perf/accessibility/best-practices/SEO scores) as a
      checklist item before calling the UI "done."

## 13. Nice-to-have polish
- [ ] Print-friendly dashboard view (like the existing settlement print
      support) for management reporting.
- [ ] "Last updated" timestamp + manual refresh button on the dashboard.
- [ ] Onboarding tooltip tour for first-time users pointing at KPI cards,
      process flow, and customer table.

## 14. App-wide UI improvements (beyond the dashboard page)

### Shared component library
There's currently no `Button`, `Input`, `Select`, `Modal`/`Dialog`, `Toast`,
`Dropdown`, or `Tooltip` primitive — buttons are hand-rolled `<button
className="...">` in `AppHeader.tsx`, `Sidebar.tsx`, and every action page,
which means spacing/hover/focus states already drift slightly between them.
- [ ] Build a shared `<Button>` (primary/secondary/ghost/danger variants,
      loading state, icon-left/right) and swap into `AppHeader.tsx`,
      `Sidebar.tsx`, and action pages (disposal/replacement approve, etc.).
- [ ] Build a shared `<Input>`/`<Select>` with consistent border, focus ring
      (`focus:ring-2 focus:ring-blue-100` pattern already used in the header
      search — standardize it).
- [ ] Build a `<Modal>`/`<Dialog>` primitive for confirmations (currently
      actions like "Mark Disposed" / "Mark Lost" presumably act immediately
      with no confirm step — a modal is both a UX and a safety improvement).
- [ ] Build a `<Toast>`/notification system for action feedback ("Item
      marked as found", "Export complete") instead of silent server actions.
- [ ] Build a `<Dropdown>` menu primitive — the header's "All Customers /
      All Locations / Last 30 Days" buttons (`AppHeader.tsx:103-111`) render
      a chevron but have no `onClick`/menu wired up yet.

### Header (`AppHeader.tsx`)
- [ ] Wire up the "All Customers", "All Locations", "Last 30 Days" filter
      buttons — currently static, non-functional decoration.
- [ ] Keyboard navigation (arrow keys + Enter) through the search results
      dropdown; currently mouse-only.
- [ ] Loading spinner in the search box while the debounced fetch is in
      flight, and an explicit "no results" state (currently just renders
      nothing).
- [ ] Recent/trending searches shown on focus before a query is typed.
- [ ] User avatar/menu in the header (currently only in the sidebar footer —
      not reachable when the sidebar is collapsed to the icon rail).

### Sidebar (`Sidebar.tsx`)
- [ ] True collapsed "icon-only" rail state for desktop (currently the
      collapsed rail only shows a hamburger — clicking any nav item requires
      fully expanding first; a hover-to-expand icon rail is the more common
      pattern).
- [ ] Active-section auto-expand + scroll-into-view so the current page's
      nav item is visible without manual scrolling in a long list.
- [ ] Collapsible section groups (Operations, Inventory, etc.) so power
      users can hide sections they don't use.
- [ ] Persist sidebar open/collapsed state (e.g. localStorage) — currently
      resets on reload.

### Typography & design tokens
- [ ] Define a real type scale (currently font sizes are ad hoc Tailwind
      classes like `text-[13px]`, `text-[11px]`, `text-xs` mixed throughout —
      consolidate into a documented scale).
- [ ] Extend `globals.css` CSS variables to cover spacing/radius/shadow
      tokens, not just color, so components stop hardcoding `rounded-xl`,
      `shadow-sm`, `border-slate-200` ad hoc in every file.
- [ ] Add dark-mode variants for all `--status-*`, `--navy-*`, `--card-bg`,
      `--border-subtle` tokens in `globals.css` (currently light-only; ties
      into #5 above).

### Tables (site-wide: `CustomerOverviewTable`, `EventsTable`, `ItemsTable`, etc.)
- [ ] Sortable column headers (click to sort) — none of the table components
      currently support sorting.
- [ ] Sticky header row on scroll for long tables.
- [ ] Row density toggle (comfortable/compact) for power users scanning
      large inventories.
- [ ] Consistent zebra/hover treatment and column alignment rules extracted
      into a shared `<Table>` wrapper instead of each table redefining
      `text-sm`, `divide-y divide-slate-100`, etc.

### Feedback & states (site-wide)
- [ ] Wire `EmptyState.tsx` into every list/table page for the zero-results
      case (exists but not confirmed used everywhere, e.g. filtered searches
      with no matches).
- [ ] Consistent loading skeletons for all server-rendered tables/cards, not
      just the dashboard.
- [ ] Inline form validation states (error text, red border) — no evidence
      of a shared pattern for this in `ui/`.
- [ ] Confirmation step before destructive actions (disposal, mark lost,
      delete user) via the new `<Modal>` primitive above.

### Motion & interaction
- [ ] Page transition / route-change progress bar (e.g. top-of-page loading
      bar) since this is a server-rendered app with real navigation loads.
- [ ] Hover/press micro-interactions on interactive rows and cards beyond
      the current `hover:shadow-md` (e.g. subtle scale or border-accent on
      focus-visible for keyboard users).
- [ ] Reduced-motion support (`prefers-reduced-motion`) for any animation
      added above.

### Branding polish
- [ ] Favicon/app icon check — confirm `icon.png`/`favicon.ico` are
      up to date with the `ibtech-logo-dark.png` brand mark used in the
      sidebar.
- [ ] Custom 404 / error page styled to match the app shell instead of the
      Next.js default.
