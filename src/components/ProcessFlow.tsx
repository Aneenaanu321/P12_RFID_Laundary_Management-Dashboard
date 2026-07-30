import Link from "next/link";
import { fmtNumber } from "@/lib/format";

const STAGE_HREF: Record<string, string> = {
  Receiving: "/operations/receiving",
  Sorting: "/operations",
  Washing: "/operations/washing",
  Drying: "/operations/drying",
  Folding: "/operations/folding",
  "Quality Check": "/operations",
  Ready: "/operations",
  Dispatch: "/operations/dispatch",
};

export function ProcessFlow({ stages }: { stages: { key: string; label: string; count: number }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {stages.map((s, i) => (
        <Link
          key={s.key}
          href={STAGE_HREF[s.label] ?? "/operations"}
          className="group relative rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3.5 hover:border-blue-300 hover:bg-white hover:shadow-sm transition-all"
        >
          <div className="flex items-start justify-between gap-2">
            <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-blue-50 text-[11px] font-semibold text-blue-700 ring-1 ring-blue-100">
              {i + 1}
            </span>
            <span className="text-[10px] font-medium uppercase tracking-wider text-slate-400 group-hover:text-blue-500">
              Stage
            </span>
          </div>
          <p className="mt-2.5 text-sm font-medium text-slate-600 group-hover:text-slate-800">{s.label}</p>
          <p className="mt-0.5 text-xl font-semibold tabular-nums text-slate-900">{fmtNumber(s.count)}</p>
        </Link>
      ))}
    </div>
  );
}
