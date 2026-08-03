"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Eye, EyeOff, RotateCcw } from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { KpiModal } from "@/components/KpiModal";
import { useDashboardLive } from "@/components/DashboardLiveProvider";
import {
  DEFAULT_KPI_ORDER,
  resolveKpiTarget,
  type KpiCardData,
  type KpiMetricKey,
} from "@/lib/kpi";
import { fmtNumber, fmtPct } from "@/lib/format";

type LayoutState = {
  order: KpiMetricKey[];
  hidden: KpiMetricKey[];
};

function mergeOrder(preferred: KpiMetricKey[]): KpiMetricKey[] {
  const base = preferred.length ? preferred : DEFAULT_KPI_ORDER;
  const missing = DEFAULT_KPI_ORDER.filter((id) => !base.includes(id));
  return [...base.filter((id) => DEFAULT_KPI_ORDER.includes(id)), ...missing];
}

function storageKey(role?: string) {
  return role ? `rfid-dashboard-kpi-layout:${role}` : "rfid-dashboard-kpi-layout";
}

function loadLayout(role?: string, preferredOrder: KpiMetricKey[] = []): LayoutState {
  const fallback = { order: mergeOrder(preferredOrder), hidden: [] as KpiMetricKey[] };
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(storageKey(role));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as LayoutState;
    const order = parsed.order?.filter((id) => DEFAULT_KPI_ORDER.includes(id)) ?? [];
    const missing = DEFAULT_KPI_ORDER.filter((id) => !order.includes(id));
    return {
      order: [...order, ...missing],
      hidden: (parsed.hidden ?? []).filter((id) => DEFAULT_KPI_ORDER.includes(id)),
    };
  } catch {
    return fallback;
  }
}

function withLiveOps(
  items: KpiCardData[],
  live: { inLaundry: number; ready: number; totalItems: number } | null
): KpiCardData[] {
  if (!live) return items;
  const totalItems = live.totalItems || items.find((i) => i.id === "totalItems")?.rawValue || 1;

  return items.map((kpi) => {
    if (kpi.id !== "inLaundry" && kpi.id !== "ready") return kpi;

    const rawValue = kpi.id === "inLaundry" ? live.inLaundry : live.ready;
    const pct = totalItems ? (rawValue / totalItems) * 100 : 0;
    return {
      ...kpi,
      rawValue,
      value: fmtNumber(rawValue),
      sub: fmtPct(pct),
      target: resolveKpiTarget(kpi.id, rawValue, {
        totalItems,
        inventoryValue: totalItems * 25,
      }),
    };
  });
}

export function KpiGrid({
  items,
  role,
  preferredOrder = [],
}: {
  items: KpiCardData[];
  role?: string;
  preferredOrder?: KpiMetricKey[];
}) {
  const { liveKpis, connected } = useDashboardLive();
  const liveItems = useMemo(() => withLiveOps(items, liveKpis), [items, liveKpis]);
  const byId = useMemo(() => new Map(liveItems.map((k) => [k.id, k])), [liveItems]);
  const [layout, setLayout] = useState<LayoutState>(() => ({
    order: mergeOrder(preferredOrder),
    hidden: [],
  }));
  const [expanded, setExpanded] = useState<KpiMetricKey | null>(null);
  const [customize, setCustomize] = useState(false);
  const [dragId, setDragId] = useState<KpiMetricKey | null>(null);

  useEffect(() => {
    setLayout(loadLayout(role, preferredOrder));
    // preferredOrder is role-derived; role is the stable dependency
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [role]);

  const persist = useCallback(
    (next: LayoutState) => {
      setLayout(next);
      try {
        localStorage.setItem(storageKey(role), JSON.stringify(next));
      } catch {
        /* ignore quota */
      }
    },
    [role]
  );

  const visible = layout.order.filter((id) => !layout.hidden.includes(id) && byId.has(id));
  const expandedKpi = expanded ? byId.get(expanded) : undefined;

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  function onDragStart(id: KpiMetricKey) {
    setDragId(id);
  }

  function onDragOver(e: React.DragEvent, overId: KpiMetricKey) {
    e.preventDefault();
    if (!dragId || dragId === overId) return;
    const order = [...layout.order];
    const from = order.indexOf(dragId);
    const to = order.indexOf(overId);
    if (from < 0 || to < 0) return;
    order.splice(from, 1);
    order.splice(to, 0, dragId);
    setLayout({ ...layout, order });
  }

  function onDragEnd() {
    if (dragId) persist(layout);
    setDragId(null);
  }

  function toggleHidden(id: KpiMetricKey) {
    const hidden = layout.hidden.includes(id)
      ? layout.hidden.filter((h) => h !== id)
      : [...layout.hidden, id];
    persist({ ...layout, hidden });
  }

  function resetLayout() {
    persist({ order: mergeOrder(preferredOrder), hidden: [] });
  }

  return (
    <div id="tour-kpis" className="mb-6">
      <div className="flex items-center justify-end gap-2 mb-2 no-print">
        {connected && liveKpis && (
          <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-[var(--muted)] mr-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--status-green)] live-dot" />
            Live ops updating
          </span>
        )}
        <button
          type="button"
          onClick={() => setCustomize((v) => !v)}
          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded-md hover:bg-[var(--surface-muted)] a11y-focus"
          aria-expanded={customize}
          aria-controls="kpi-customize-panel"
        >
          {customize ? "Done" : "Customize KPIs"}
        </button>
        {customize && (
          <button
            type="button"
            onClick={resetLayout}
            className="inline-flex items-center gap-1 text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded-md hover:bg-[var(--surface-muted)] a11y-focus"
          >
            <RotateCcw size={12} aria-hidden /> Reset
          </button>
        )}
      </div>

      {customize && (
        <div id="kpi-customize-panel" className="mb-3 flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
          {layout.order.map((id) => {
            const kpi = byId.get(id);
            if (!kpi) return null;
            const hidden = layout.hidden.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleHidden(id)}
                aria-pressed={!hidden}
                aria-label={`${hidden ? "Show" : "Hide"} ${kpi.label}`}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border a11y-focus ${
                  hidden
                    ? "bg-[var(--card-bg)] text-[var(--muted-fg)] border-[var(--border-subtle)]"
                    : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--muted-fg)]"
                }`}
              >
                {hidden ? <EyeOff size={12} aria-hidden /> : <Eye size={12} aria-hidden />}
                {kpi.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 min-[380px]:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
        {visible.map((id, index) => {
          const kpi = byId.get(id)!;
          const isLive = Boolean(liveKpis && (id === "inLaundry" || id === "ready"));
          return (
            <div
              key={id}
              draggable={customize}
              onDragStart={() => onDragStart(id)}
              onDragOver={(e) => onDragOver(e, id)}
              onDragEnd={onDragEnd}
              className={dragId === id ? "opacity-60" : undefined}
            >
              <KpiCard
                icon={kpi.icon}
                label={kpi.label}
                value={kpi.value}
                sub={
                  isLive
                    ? `${kpi.sub ? `${kpi.sub} · ` : ""}live`
                    : kpi.sub
                }
                trend={kpi.trend}
                tone={kpi.tone}
                sparkline={kpi.sparkline}
                sparkColor={kpi.sparkColor}
                sparkKey={kpi.id}
                target={kpi.target}
                href={kpi.href}
                enterDelay={index * 40}
                onExpand={() => setExpanded(id)}
                dragHandleProps={
                  customize
                    ? {
                        draggable: true,
                        onDragStart: (e) => {
                          e.stopPropagation();
                          onDragStart(id);
                        },
                      }
                    : undefined
                }
              />
            </div>
          );
        })}
      </div>

      {visible.length === 0 && (
        <p className="text-sm text-[var(--muted)] text-center py-8 border border-dashed border-[var(--border-subtle)] rounded-xl">
          All KPI cards are hidden. Use Customize KPIs to show some again.
        </p>
      )}

      {expandedKpi && <KpiModal kpi={expandedKpi} onClose={() => setExpanded(null)} />}
    </div>
  );
}
