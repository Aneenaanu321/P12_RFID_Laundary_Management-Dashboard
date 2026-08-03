"use client";

import { ReactNode, useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { ClientTableExportButtons } from "@/components/TableExportButtons";
import { ClientPagination, TABLE_PAGE_SIZE } from "@/components/ui/ClientPagination";

export type ClientFilterDef<T> = {
  key: string;
  label: string;
  getValue: (row: T) => string;
  options: { value: string; label: string }[];
};

export function ClientTableSearch<T extends object>({
  rows,
  getSearchText,
  filters = [],
  searchPlaceholder = "Search…",
  emptyMessage = "No rows match your search.",
  exportFilename,
  pageSize = TABLE_PAGE_SIZE,
  children,
}: {
  rows: T[];
  getSearchText: (row: T) => string;
  filters?: ClientFilterDef<T>[];
  searchPlaceholder?: string;
  emptyMessage?: string;
  /** When set, shows CSV/Excel download for the filtered rows. */
  exportFilename?: string;
  pageSize?: number;
  children: (filtered: T[]) => ReactNode;
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Record<string, string>>({});
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return rows.filter((row) => {
      if (q) {
        const hay = getSearchText(row).toLowerCase();
        if (!hay.includes(q)) return false;
      }
      for (const f of filters) {
        const v = selected[f.key];
        if (v && f.getValue(row) !== v) return false;
      }
      return true;
    });
  }, [rows, search, selected, filters, getSearchText]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, pageCount);

  useEffect(() => {
    setPage(1);
  }, [search, selected, rows]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const pageRows = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, safePage, pageSize]);

  const hasFilters = Boolean(search.trim()) || filters.some((f) => selected[f.key]);
  const exportRows = useMemo(
    () => filtered.map((r) => r as unknown as Record<string, unknown>),
    [filtered]
  );

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 px-5 py-3 border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]/60">
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-56"
          aria-label={searchPlaceholder}
        />
        {filters.map((f) => (
          <Select
            key={f.key}
            value={selected[f.key] ?? ""}
            onChange={(e) =>
              setSelected((prev) => ({ ...prev, [f.key]: e.target.value }))
            }
            aria-label={f.label}
          >
            <option value="">{f.label}</option>
            {f.options.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </Select>
        ))}
        {hasFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setSearch("");
              setSelected({});
            }}
            iconLeft={<X size={13} aria-hidden />}
            className="text-[var(--muted)] hover:text-[var(--status-red)]"
          >
            Clear
          </Button>
        )}
        {hasFilters && (
          <span className="text-xs text-[var(--muted)] tabular-nums">
            {filtered.length} of {rows.length}
          </span>
        )}
        {exportFilename && (
          <ClientTableExportButtons rows={exportRows} filename={exportFilename} />
        )}
      </div>
      {filtered.length === 0 ? (
        <p className="px-5 py-8 text-sm text-[var(--muted)] text-center">{emptyMessage}</p>
      ) : (
        <>
          {children(pageRows)}
          <ClientPagination
            page={safePage}
            pageCount={pageCount}
            onPageChange={setPage}
            total={filtered.length}
            pageSize={pageSize}
          />
        </>
      )}
    </>
  );
}
