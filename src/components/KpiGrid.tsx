"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Package, Users, WashingMachine, CheckCircle2, AlertTriangle, Clock3, XOctagon, Coins,
  Eye, EyeOff, RotateCcw, type LucideIcon,
} from "lucide-react";
import { KpiCard } from "@/components/KpiCard";
import { KpiModal } from "@/components/KpiModal";
import {
  DEFAULT_KPI_ORDER,
  type KpiCardData,
  type KpiMetricKey,
} from "@/lib/kpi";

const ICONS: Record<string, LucideIcon> = {
  Package,
  Users,
  WashingMachine,
  CheckCircle2,
  AlertTriangle,
  Clock3,
  XOctagon,
  Coins,
};

const STORAGE_KEY = "rfid-dashboard-kpi-layout";

type LayoutState = {
  order: KpiMetricKey[];
  hidden: KpiMetricKey[];
};

function loadLayout(): LayoutState {
  if (typeof window === "undefined") {
    return { order: DEFAULT_KPI_ORDER, hidden: [] };
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { order: DEFAULT_KPI_ORDER, hidden: [] };
    const parsed = JSON.parse(raw) as LayoutState;
    const order = parsed.order?.filter((id) => DEFAULT_KPI_ORDER.includes(id)) ?? [];
    const missing = DEFAULT_KPI_ORDER.filter((id) => !order.includes(id));
    return {
      order: [...order, ...missing],
      hidden: (parsed.hidden ?? []).filter((id) => DEFAULT_KPI_ORDER.includes(id)),
    };
  } catch {
    return { order: DEFAULT_KPI_ORDER, hidden: [] };
  }
}

export function KpiGrid({ items }: { items: KpiCardData[] }) {
  const byId = useMemo(() => new Map(items.map((k) => [k.id, k])), [items]);
  const [layout, setLayout] = useState<LayoutState>({ order: DEFAULT_KPI_ORDER, hidden: [] });
  const [expanded, setExpanded] = useState<KpiMetricKey | null>(null);
  const [customize, setCustomize] = useState(false);
  const [dragId, setDragId] = useState<KpiMetricKey | null>(null);

  useEffect(() => {
    setLayout(loadLayout());
  }, []);

  const persist = useCallback((next: LayoutState) => {
    setLayout(next);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      /* ignore quota */
    }
  }, []);

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
    persist({ order: DEFAULT_KPI_ORDER, hidden: [] });
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-end gap-2 mb-2">
        <button
          type="button"
          onClick={() => setCustomize((v) => !v)}
          className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1 rounded-md hover:bg-[var(--surface-muted)]"
        >
          {customize ? "Done" : "Customize KPIs"}
        </button>
        {customize && (
          <button
            type="button"
            onClick={resetLayout}
            className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-800 px-2 py-1 rounded-md hover:bg-slate-100"
          >
            <RotateCcw size={12} /> Reset
          </button>
        )}
      </div>

      {customize && (
        <div className="mb-3 flex flex-wrap gap-2 p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface-muted)]">
          {layout.order.map((id) => {
            const kpi = byId.get(id);
            if (!kpi) return null;
            const hidden = layout.hidden.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => toggleHidden(id)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs border ${
                  hidden
                    ? "bg-[var(--card-bg)] text-[var(--muted-fg)] border-[var(--border-subtle)]"
                    : "bg-[var(--card-bg)] text-[var(--foreground)] border-[var(--muted-fg)]"
                }`}
              >
                {hidden ? <EyeOff size={12} /> : <Eye size={12} />}
                {kpi.label}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {visible.map((id, index) => {
          const kpi = byId.get(id)!;
          const Icon = ICONS[kpi.icon] ?? Package;
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
                icon={Icon}
                label={kpi.label}
                value={kpi.value}
                sub={kpi.sub}
                trend={kpi.trend}
                tone={kpi.tone}
                sparkline={kpi.sparkline}
                sparkColor={kpi.sparkColor}
                sparkKey={kpi.id}
                target={kpi.target}
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
