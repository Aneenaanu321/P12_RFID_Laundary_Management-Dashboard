"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";

export type FilterOption = { value: string; label: string };
export type FilterDef = { key: string; label: string; options: FilterOption[] };

export function TableFilters({ filters, searchPlaceholder = "Search..." }: { filters: FilterDef[]; searchPlaceholder?: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");

  useEffect(() => setSearch(searchParams.get("q") ?? ""), [searchParams]);

  function update(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value); else params.delete(key);
    params.delete("page");
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  const hasFilters = filters.some((f) => searchParams.get(f.key)) || searchParams.get("q");

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-slate-200 bg-slate-50/60">
      <input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") update("q", search); }}
        onBlur={() => update("q", search)}
        placeholder={searchPlaceholder}
        className="px-3 py-1.5 text-sm rounded-lg border border-slate-200 bg-white w-56 focus:outline-none focus:ring-2 focus:ring-blue-100"
      />
      {filters.map((f) => (
        <select
          key={f.key}
          value={searchParams.get(f.key) ?? ""}
          onChange={(e) => update(f.key, e.target.value)}
          className="px-2.5 py-1.5 text-sm rounded-lg border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-100"
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      ))}
      {hasFilters && (
        <button
          onClick={() => router.push(pathname)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-sm text-slate-500 hover:text-red-600"
        >
          <X size={13} /> Clear
        </button>
      )}
    </div>
  );
}
