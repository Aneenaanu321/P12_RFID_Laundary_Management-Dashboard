"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, Package, Building2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { readRecent, type RecentView } from "@/lib/personalization";
import { timeAgo } from "@/lib/format";

export function RecentlyViewedWidget({ userId }: { userId: string }) {
  const [recent, setRecent] = useState<RecentView[]>([]);

  useEffect(() => {
    setRecent(readRecent(userId));
  }, [userId]);

  if (!recent.length) return null;

  return (
    <Card className="mb-6">
      <CardHeader
        title="Recently Viewed"
        subtitle="Items and customers you opened in this browser"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <Clock3 size={12} /> {recent.length}
          </span>
        }
      />
      <div className="divide-y divide-[var(--border-subtle)]">
        {recent.map((v) => (
          <Link
            key={`${v.kind}-${v.id}`}
            href={v.href}
            className="flex items-center gap-3 px-5 py-3 hover:bg-[var(--surface-muted)] transition-colors"
          >
            <div
              className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${
                v.kind === "customer"
                  ? "bg-[var(--status-blue-bg)] text-[var(--status-blue)]"
                  : "bg-[var(--status-green-bg)] text-[var(--status-green)]"
              }`}
            >
              {v.kind === "customer" ? <Building2 size={14} /> : <Package size={14} />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-[var(--foreground)] truncate">{v.label}</p>
              <p className="text-[11px] text-[var(--muted)] truncate">
                {v.kind === "customer" ? "Customer" : "Item"}
                {"sub" in v && v.sub ? ` · ${v.sub}` : ""}
                {" · "}
                {timeAgo(v.viewedAt)}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </Card>
  );
}
