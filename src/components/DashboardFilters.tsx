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
      <div className="inline-flex rounded-lg border border-slate-200 bg-white p-0.5">
        {RANGE_OPTIONS.map((opt) => {
          const active = range === opt.value || (opt.value === "30" && !searchParams.get("range") && range === "30");
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => setRange(opt.value)}
              className={`px-2.5 py-1.5 text-xs font-medium rounded-md transition-colors ${
                active
                  ? "bg-slate-900 text-white"
                  : "text-slate-600 hover:bg-slate-50"
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
            className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
          <span className="text-xs text-slate-400">to</span>
          <input
            type="date"
            value={to}
            onChange={(e) => push({ range: "custom", from: from || e.target.value, to: e.target.value })}
            className="px-2 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-100"
          />
        </div>
      )}

      <select
        value={type}
        onChange={(e) => push({ type: e.target.value || null })}
        className="px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
      >
        <option value="">All customer types</option>
        {CUSTOMER_TYPES.map((t) => (
          <option key={t.value} value={t.value}>{t.label}</option>
        ))}
      </select>

      <label className="inline-flex items-center gap-2 px-2.5 py-1.5 text-xs text-slate-600 rounded-lg border border-slate-200 bg-white cursor-pointer select-none">
        <input
          type="checkbox"
          checked={compare}
          onChange={(e) => push({ compare: e.target.checked ? "1" : null })}
          className="rounded border-slate-300 text-blue-600 focus:ring-blue-100"
        />
        Compare to previous period
      </label>
    </div>
  );
}
