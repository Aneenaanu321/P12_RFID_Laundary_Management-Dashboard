"use client";

import { Button } from "@/components/ui/Button";

/** Shared page size for list tables across the app. */
export const TABLE_PAGE_SIZE = 15;

export function ClientPagination({
  page,
  pageCount,
  onPageChange,
  total,
  pageSize = TABLE_PAGE_SIZE,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
  total?: number;
  pageSize?: number;
}) {
  if (pageCount <= 1) return null;

  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, start + 4);
  const pages: number[] = [];
  for (let p = start; p <= end; p++) pages.push(p);

  const from = total !== undefined ? (page - 1) * pageSize + 1 : null;
  const to = total !== undefined ? Math.min(page * pageSize, total) : null;

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 px-5 py-3 border-t border-[var(--border-subtle)] text-sm">
      <span className="text-[var(--muted)]">
        {from !== null && to !== null && total !== undefined
          ? `Showing ${from}–${to} of ${total}`
          : `Page ${page} of ${pageCount}`}
      </span>
      <div className="flex items-center gap-1">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        >
          Prev
        </Button>
        {pages.map((p) => (
          <Button
            key={p}
            type="button"
            variant={p === page ? "primary" : "secondary"}
            size="sm"
            onClick={() => onPageChange(p)}
            className={p === page ? "bg-[var(--foreground)] text-[var(--card-bg)] hover:bg-[var(--foreground)] hover:opacity-90" : undefined}
          >
            {p}
          </Button>
        ))}
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={page >= pageCount}
          onClick={() => onPageChange(page + 1)}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
