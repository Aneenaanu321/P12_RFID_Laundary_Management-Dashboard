"use client";

import { Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";

function buildHref(
  resource: string,
  format: "csv" | "xlsx",
  filename: string,
  extra: Record<string, string | undefined>,
  searchParams?: URLSearchParams | null
) {
  const params = new URLSearchParams();
  params.set("resource", resource);
  params.set("format", format);
  params.set("filename", filename);
  if (searchParams) {
    for (const key of ["q", "customerId", "status", "zone", "eventType", "readerId", "category", "lifecycleStatus", "disposed", "type"]) {
      const v = searchParams.get(key);
      if (v) params.set(key, v);
    }
  }
  for (const [k, v] of Object.entries(extra)) {
    if (v) params.set(k, v);
  }
  return `/api/export?${params.toString()}`;
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function toCsv(rows: Record<string, unknown>[]): string {
  if (rows.length === 0) return "No data available.\n";
  const headers = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = String(v ?? "");
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [headers.join(","), ...rows.map((r) => headers.map((h) => escape(r[h])).join(","))].join("\n");
}

/** Server-backed export (full matching dataset via /api/export). */
export function TableExportButtons({
  resource,
  filename,
  extraParams = {},
}: {
  resource: string;
  filename: string;
  extraParams?: Record<string, string | undefined>;
}) {
  const searchParams = useSearchParams();
  const csvHref = useMemo(
    () => buildHref(resource, "csv", filename, extraParams, searchParams),
    [resource, filename, extraParams, searchParams]
  );
  const xlsxHref = useMemo(
    () => buildHref(resource, "xlsx", filename, extraParams, searchParams),
    [resource, filename, extraParams, searchParams]
  );

  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <a
        href={csvHref}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] a11y-focus"
      >
        <Download size={13} aria-hidden />
        CSV
      </a>
      <a
        href={xlsxHref}
        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--surface-hover)] a11y-focus"
      >
        <Download size={13} aria-hidden />
        Excel
      </a>
    </div>
  );
}

/** Client-side export of the currently visible/filtered rows. */
export function ClientTableExportButtons({
  rows,
  filename,
}: {
  rows: Record<string, unknown>[];
  filename: string;
}) {
  const [loading, setLoading] = useState<"csv" | "xlsx" | null>(null);
  const stamp = new Date().toISOString().slice(0, 10);

  function downloadCsv() {
    setLoading("csv");
    try {
      const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
      downloadBlob(blob, `${filename}-${stamp}.csv`);
    } finally {
      setLoading(null);
    }
  }

  async function downloadXlsx() {
    setLoading("xlsx");
    try {
      const res = await fetch("/api/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows, filename, format: "xlsx" }),
      });
      if (!res.ok) throw new Error("Export failed");
      const blob = await res.blob();
      downloadBlob(blob, `${filename}-${stamp}.xlsx`);
    } catch {
      downloadCsv();
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="flex items-center gap-1.5 ml-auto">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={downloadCsv}
        loading={loading === "csv"}
        disabled={rows.length === 0 || loading !== null}
        iconLeft={<Download size={13} aria-hidden />}
        className="text-xs"
      >
        CSV
      </Button>
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={downloadXlsx}
        loading={loading === "xlsx"}
        disabled={rows.length === 0 || loading !== null}
        iconLeft={<Download size={13} aria-hidden />}
        className="text-xs"
      >
        Excel
      </Button>
    </div>
  );
}
