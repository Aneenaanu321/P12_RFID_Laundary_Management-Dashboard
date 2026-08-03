import Link from "next/link";

export function Pagination({
  page, pageCount, buildHref,
}: { page: number; pageCount: number; buildHref: (page: number) => string }) {
  if (pageCount <= 1) return null;
  const pages: number[] = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, start + 4);
  for (let p = start; p <= end; p++) pages.push(p);

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-[var(--border-subtle)] text-sm">
      <span className="text-[var(--muted)]">Page {page} of {pageCount}</span>
      <div className="flex items-center gap-1">
        <Link
          href={buildHref(Math.max(1, page - 1))}
          className={`px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)] a11y-focus ${page === 1 ? "pointer-events-none opacity-40" : ""}`}
        >
          Prev
        </Link>
        {pages.map((p) => (
          <Link
            key={p}
            href={buildHref(p)}
            className={`px-2.5 py-1 rounded-md border text-sm a11y-focus ${
              p === page
                ? "bg-[var(--foreground)] text-[var(--card-bg)] border-[var(--foreground)]"
                : "border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)]"
            }`}
          >
            {p}
          </Link>
        ))}
        <Link
          href={buildHref(Math.min(pageCount, page + 1))}
          className={`px-2.5 py-1 rounded-md border border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)] a11y-focus ${page === pageCount ? "pointer-events-none opacity-40" : ""}`}
        >
          Next
        </Link>
      </div>
    </div>
  );
}
