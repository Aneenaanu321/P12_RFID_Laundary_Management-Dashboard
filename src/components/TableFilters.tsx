"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useState, useEffect, useRef, useTransition, Suspense } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { TableExportButtons } from "@/components/TableExportButtons";

export type FilterOption = { value: string; label: string };
export type FilterDef = { key: string; label: string; options: FilterOption[] };

function TableFiltersInner({
  filters,
  searchPlaceholder = "Search...",
  exportResource,
  exportFilename,
  exportParams,
}: {
  filters: FilterDef[];
  searchPlaceholder?: string;
  exportResource?: string;
  exportFilename?: string;
  exportParams?: Record<string, string | undefined>;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [search, setSearch] = useState(searchParams.get("q") ?? "");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const searchParamsRef = useRef(searchParams);
  searchParamsRef.current = searchParams;

  useEffect(() => {
    setSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  function writeParam(key: string, value: string) {
    const params = new URLSearchParams(searchParamsRef.current.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    const qs = params.toString();
    startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname));
  }

  function onSearchChange(value: string) {
    setSearch(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => writeParam("q", value.trim()), 120);
  }

  function update(key: string, value: string) {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    writeParam(key, value);
  }

  const hasFilters = filters.some((f) => searchParams.get(f.key)) || searchParams.get("q");

  return (
    <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]/60">
      <Input
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        placeholder={searchPlaceholder}
        className="w-56"
        aria-label={searchPlaceholder}
        autoComplete="off"
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
          onClick={() => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            setSearch("");
            startTransition(() => router.replace(pathname));
          }}
          iconLeft={<X size={13} aria-hidden />}
          className="text-[var(--muted)] hover:text-[var(--status-red)]"
        >
          Clear
        </Button>
      )}
      {exportResource && exportFilename && (
        <TableExportButtons
          resource={exportResource}
          filename={exportFilename}
          extraParams={exportParams}
        />
      )}
    </div>
  );
}

export function TableFilters(props: {
  filters: FilterDef[];
  searchPlaceholder?: string;
  exportResource?: string;
  exportFilename?: string;
  exportParams?: Record<string, string | undefined>;
}) {
  return (
    <Suspense
      fallback={
        <div className="h-12 border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 animate-pulse" />
      }
    >
      <TableFiltersInner {...props} />
    </Suspense>
  );
}
