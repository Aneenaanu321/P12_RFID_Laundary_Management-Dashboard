"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { CUSTOMER_TYPES, type RangePreset } from "@/lib/dashboard-filters";

const RANGE_OPTIONS: { value: RangePreset; label: string }[] = [
  { value: "7", label: "7d" },
  { value: "30", label: "30d" },
  { value: "90", label: "90d" },
  { value: "custom", label: "Custom" },
];

export function DashboardFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const range = (searchParams.get("range") as RangePreset | null) ?? "30";
  const type = searchParams.get("type") ?? "";
  const compare = searchParams.get("compare") === "1";
  const from = searchParams.get("from") ?? "";
  const to = searchParams.get("to") ?? "";

  function push(next: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [key, value] of Object.entries(next)) {
      if (value === null || value === "") params.delete(key);
      else params.set(key, value);
    }
    const qs = params.toString();
    startTransition(() => router.push(qs ? `${pathname}?${qs}` : pathname));
  }

  function setRange(value: RangePreset) {
    if (value === "custom") {
      const today = new Date().toISOString().slice(0, 10);
      const start = new Date();
      start.setUTCDate(start.getUTCDate() - 29);
      push({
        range: "custom",
        from: from || start.toISOString().slice(0, 10),
        to: to || today,
      });
      return;
    }
    push({ range: value === "30" ? null : value, from: null, to: null });
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-2 mb-6 ${pending ? "opacity-70" : ""}`}
    >
      <div className="inline-flex rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] p-0.5">
        {RANGE_OPTIONS.map((opt) => {
          const active = range === opt.value || (opt.value === "30" && !searchParams.get("range") && range === "30");
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                active
                  ? "bg-[var(--foreground)] text-[var(--card-bg)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-muted)]"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>

      {range === "custom" && (
        <div className="flex items-center gap-1.5">
          <input
            type="date"
            value={from}
            onChange={(e) => push({ range: "custom", from: e.target.value, to: to || e.target.value })}
            className="px-2 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--status-blue-bg)]"
          />
          <span className="text-xs text-[var(--muted-fg)]">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => push({ range: "custom", from: from || e.target.value, to: e.target.value })}
            className="px-2 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--status-blue-bg)]"
          />
        </div>
      )}

      <select
        value={type}
        onChange={(e) => push({ type: e.target.value || null })}
        className="px-2.5 py-1.5 text-xs rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-[var(--status-blue-bg)]"
      >
        <option value="">All customer types</option>
        {CUSTOMER_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <label className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs text-[var(--muted)] rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] cursor-pointer select-none">
        <input
          type="checkbox"
          checked={compare}
          onChange={(e) => push({ compare: e.target.checked ? "1" : null })}
          className="rounded border-[var(--border-subtle)] text-[var(--status-blue)] focus:ring-[var(--status-blue-bg)]"
        />
        Compare to previous period
      </label>
    </div>
  );
}

export function FiltersSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2 mb-6 animate-pulse">
      <div className="h-9 w-44 rounded-lg bg-[var(--surface-muted)]" />
      <div className="h-9 w-36 rounded-lg bg-[var(--surface-muted)]" />
      <div className="h-9 w-48 rounded-lg bg-[var(--surface-muted)]" />
    </div>
  );
}
