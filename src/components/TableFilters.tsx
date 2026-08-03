"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useTransition } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

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
      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") update("q", search); }}
        onBlur={() => update("q", search)}
        placeholder={searchPlaceholder}
        className="w-56"
      />
      {filters.map((f) => (
        <Select
          key={f.key}
          value={searchParams.get(f.key) ?? ""}
          onChange={(e) => update(f.key, e.target.value)}
        >
          <option value="">{f.label}</option>
          {f.options.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </Select>
      ))}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
          iconLeft={<X size={13} aria-hidden />}
          className="text-[var(--muted)] hover:text-[var(--status-red)]"
        >
          Clear
        </Button>
      )}
    </div>
  );
}
