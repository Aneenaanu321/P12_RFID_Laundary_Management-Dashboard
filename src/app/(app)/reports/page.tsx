import { PageHeader } from "@/components/layout/PageHeader";
import { Card } from "@/components/ui/Card";
import { FileText, Download } from "lucide-react";
import { REPORT_DEFINITIONS } from "@/lib/reports";
import { DownloadAllReportsButton } from "@/components/DownloadAllReportsButton";

export default function Page() {
  return (
    <div>
      <PageHeader
        title="Reports Center"
        subtitle="Generate and export operational, financial and compliance reports."
        action={<DownloadAllReportsButton />}
      />
      <Card>
        <div className="divide-y divide-[var(--border-subtle)]">
          {REPORT_DEFINITIONS.map((r) => (
            <div key={r.key} className="flex items-center justify-between gap-3 px-5 py-3.5">
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-9 w-9 rounded-lg bg-[var(--status-blue-bg)] text-[var(--status-blue)] flex items-center justify-center shrink-0">
                  <FileText size={16} aria-hidden />
                </div>
                <p className="text-sm font-medium text-[var(--foreground)] truncate">{r.name}</p>
              </div>
              <div className="flex gap-2 shrink-0">
                <a
                  href={`/api/reports?type=${r.key}&format=csv`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] a11y-focus"
                >
                  <Download size={12} aria-hidden /> CSV
                </a>
                <a
                  href={`/api/reports?type=${r.key}&format=xlsx`}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] a11y-focus"
                >
                  <Download size={12} aria-hidden /> Excel
                </a>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
