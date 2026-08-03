"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Pin, X, Package, Building2 } from "lucide-react";
import { Card, CardHeader } from "@/components/ui/Card";
import { readPins, writePins, type PinnedCustomer } from "@/lib/personalization";
import { fmtNumber } from "@/lib/format";

type CustomerStats = {
  id: string;
  name: string;
  type: string;
  totalItems: number;
  missing: number;
  inLaundry: number;
  ready: number;
};

export function PinnedCustomersWidget({ userId }: { userId: string }) {
  const [pins, setPins] = useState<PinnedCustomer[]>([]);
  const [stats, setStats] = useState<CustomerStats[]>([]);
  const [loading, setLoading] = useState(false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readPins(userId);
    setPins(stored);
    setReady(true);
    if (!stored.length) {
      setStats([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const ids = stored.map((p) => p.id).join(",");
    fetch(`/api/personalization/resolve?customers=${encodeURIComponent(ids)}`)
      .then((r) => r.json())
      .then((data: { customers: CustomerStats[] }) => {
        if (cancelled) return;
        setStats(data.customers ?? []);
      })
      .catch(() => {
        if (!cancelled) setStats([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  function unpin(id: string) {
    const next = pins.filter((p) => p.id !== id);
    writePins(userId, next);
    setPins(next);
    setStats((prev) => prev.filter((c) => c.id !== id));
  }

  // Avoid SSR/client empty loading card that leaves a large blank gap.
  if (!ready || !pins.length) return null;

  return (
    <Card className="mb-6">
      <CardHeader
        title="Pinned Customers"
        subtitle="Quick access from customer pages — pin stays on this device"
        action={
          <span className="inline-flex items-center gap-1 text-[11px] text-[var(--muted)]">
            <Pin size={12} /> {pins.length} pinned
          </span>
        }
      />
      <div className="px-5 pb-5">
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: Math.min(pins.length, 3) }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)] animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.map((c) => (
              <div
                key={c.id}
                className="relative rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] p-3.5 hover:border-[var(--muted-fg)] hover:shadow-sm transition-all"
              >
                <button
                  type="button"
                  onClick={() => unpin(c.id)}
                  className="absolute top-2.5 right-2.5 p-1 rounded-md text-[var(--muted-fg)] hover:text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
                  aria-label={`Unpin ${c.name}`}
                >
                  <X size={14} />
                </button>
                <Link href={`/customers/${c.id}`} className="block pr-6">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-[var(--status-blue-bg)] text-[var(--status-blue)] flex items-center justify-center">
                      <Building2 size={15} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-[var(--foreground)] truncate">{c.name}</p>
                      <p className="text-[11px] text-[var(--muted)] capitalize">{c.type.toLowerCase()}</p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[var(--muted)]">
                    <span className="inline-flex items-center gap-1">
                      <Package size={11} /> {fmtNumber(c.totalItems)} items
                    </span>
                    <span className="text-[var(--status-red)]">{fmtNumber(c.missing)} missing</span>
                    <span>{fmtNumber(c.inLaundry)} in laundry</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}
