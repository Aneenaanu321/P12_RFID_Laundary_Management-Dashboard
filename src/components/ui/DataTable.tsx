"use client";

import {
  ReactNode,
  createContext,
  useContext,
  useMemo,
  useState,
  useCallback,
} from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/cn";

type TableContextValue = {
  sortKey: string | null;
  sortDir: "asc" | "desc";
  setSort: (key: string) => void;
};

const TableContext = createContext<TableContextValue>({
  sortKey: null,
  sortDir: "asc",
  setSort: () => {},
});

export function useDataTable() {
  return useContext(TableContext);
}

export function DataTable({
  children,
  className,
  toolbar,
}: {
  children: ReactNode;
  className?: string;
  toolbar?: ReactNode;
}) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");

  const setSort = useCallback((key: string) => {
    setSortKey((prev) => {
      if (prev === key) {
        setSortDir((d) => (d === "asc" ? "desc" : "asc"));
        return key;
      }
      setSortDir("asc");
      return key;
    });
  }, []);

  const value = useMemo(
    () => ({ sortKey, sortDir, setSort }),
    [sortKey, sortDir, setSort]
  );

  return (
    <TableContext.Provider value={value}>
      {toolbar && (
        <div className="flex items-center justify-end gap-2 px-3 py-2 border-b border-[var(--border-subtle)] no-print">
          {toolbar}
        </div>
      )}
      <div className={cn("overflow-x-auto max-h-[70vh]", className)}>
        <table className="w-full text-[var(--text-sm)] [&_th]:py-2 [&_td]:py-1.5">
          {children}
        </table>
      </div>
    </TableContext.Provider>
  );
}

export function DataTableHead({ children }: { children: ReactNode }) {
  return (
    <thead className="sticky top-0 z-10 bg-[var(--card-bg)] shadow-[0_1px_0_0_var(--border-subtle)]">
      {children}
    </thead>
  );
}

export function DataTableHeaderRow({ children }: { children: ReactNode }) {
  return (
    <tr className="border-b border-[var(--border-subtle)] text-left text-xs text-[var(--muted)] uppercase tracking-wider">
      {children}
    </tr>
  );
}

export function DataTableSortHeader({
  sortKey,
  children,
  className,
  align = "left",
}: {
  sortKey: string;
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  const { sortKey: active, sortDir, setSort } = useDataTable();
  const activeHere = active === sortKey;
  const Icon = !activeHere ? ArrowUpDown : sortDir === "asc" ? ArrowUp : ArrowDown;

  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 font-medium first:px-5",
        align === "right" && "text-right",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setSort(sortKey)}
        className={cn(
          "inline-flex items-center gap-1 rounded-sm a11y-focus hover:text-[var(--foreground)]",
          align === "right" && "flex-row-reverse",
          activeHere && "text-[var(--foreground)]"
        )}
        aria-sort={activeHere ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
      >
        {children}
        <Icon size={12} aria-hidden className="opacity-70" />
      </button>
    </th>
  );
}

export function DataTableHeader({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 font-medium first:px-5",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </th>
  );
}

export function DataTableBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-[var(--border-subtle)]">{children}</tbody>;
}

export function DataTableRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <tr
      className={cn(
        "a11y-row hover:bg-[var(--surface-hover)] odd:bg-[var(--surface-muted)]/30 interactive-row",
        className
      )}
    >
      {children}
    </tr>
  );
}

export function DataTableCell({
  children,
  className,
  align = "left",
}: {
  children: ReactNode;
  className?: string;
  align?: "left" | "right";
}) {
  return (
    <td
      className={cn(
        "px-3 py-1.5 first:px-5",
        align === "right" && "text-right",
        className
      )}
    >
      {children}
    </td>
  );
}

export function TableSkeleton({ rows = 6, cols = 5 }: { rows?: number; cols?: number }) {
  return (
    <div className="bg-[var(--card-bg)] rounded-[var(--radius-lg)] border border-[var(--border-subtle)] overflow-hidden animate-pulse">
      <div className="border-b border-[var(--border-subtle)] px-5 py-2 flex gap-4">
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} className="h-3 flex-1 rounded bg-[var(--surface-muted)]" />
        ))}
      </div>
      <div className="divide-y divide-[var(--border-subtle)]">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="px-5 py-1.5 flex gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <div key={c} className="h-4 flex-1 rounded bg-[var(--surface-muted)]" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Client-side sort helper for row arrays. */
export function sortByKey<T>(
  rows: T[],
  key: string | null,
  dir: "asc" | "desc",
  getters: Record<string, (row: T) => string | number | null | undefined>
): T[] {
  if (!key || !getters[key]) return rows;
  const get = getters[key];
  const sorted = [...rows].sort((a, b) => {
    const av = get(a);
    const bv = get(b);
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === "number" && typeof bv === "number") return av - bv;
    return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" });
  });
  return dir === "desc" ? sorted.reverse() : sorted;
}
