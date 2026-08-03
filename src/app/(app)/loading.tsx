import { TableSkeleton } from "@/components/ui/DataTable";

export default function AppLoading() {
  return (
    <div>
      <div className="mb-6 animate-pulse">
        <div className="h-3 w-28 rounded bg-[var(--surface-muted)] mb-2" />
        <div className="h-7 w-56 rounded bg-[var(--surface-muted)]" />
        <div className="h-4 w-80 max-w-full rounded bg-[var(--surface-muted)] mt-2" />
      </div>
      <div className="mb-4 flex gap-2 animate-pulse">
        <div className="h-9 w-40 rounded-lg bg-[var(--surface-muted)]" />
        <div className="h-9 w-32 rounded-lg bg-[var(--surface-muted)]" />
      </div>
      <TableSkeleton rows={8} cols={6} />
    </div>
  );
}
