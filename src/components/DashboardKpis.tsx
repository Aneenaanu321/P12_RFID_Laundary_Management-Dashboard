import { KpiGrid } from "@/components/KpiGrid";
import {
  getKpis,
  getSnapshotSeries,
  getKpiBreakdownByCustomerType,
  getKpiBreakdownByItemType,
  getAvgTurnaroundHours,
  getTurnaroundSeries,
  getExecutiveMetrics,
} from "@/lib/queries";
import { KPI_DEFINITIONS, resolveKpiTarget, type KpiCardData, type KpiMetricKey } from "@/lib/kpi";
import { getPreferredKpiOrder } from "@/lib/dashboard-layout";
import { fmtAED, fmtNumber, fmtPct } from "@/lib/format";

function formatValue(id: KpiMetricKey, raw: number) {
  if (id === "lossValue" || id === "costPerItem") return fmtAED(raw);
  if (id === "utilizationRate") return fmtPct(raw, 0);
  if (id === "avgTurnaround") {
    if (raw < 1) return `${Math.round(raw * 60)}m`;
    return `${raw.toFixed(1)}h`;
  }
  return fmtNumber(raw);
}

export async function DashboardKpis({
  customerType,
  role,
}: {
  customerType?: string;
  role?: string;
}) {
  const { today, delta } = getKpis(customerType);
  const sparkSeries = getSnapshotSeries(7);
  const series30 = getSnapshotSeries(30);
  const turnaround = getAvgTurnaroundHours();
  const turnaroundSeries = getTurnaroundSeries(30);
  const exec = getExecutiveMetrics(customerType);

  const totalItems = Number(today?.totalItems ?? exec.totalItems ?? 0);
  const inventoryValue = Number(today?.inventoryValue ?? exec.inventoryValue ?? totalItems * 25);
  const withCustomerPct = totalItems ? (Number(today?.withCustomers ?? 0) / totalItems) * 100 : 0;
  const inLaundryPct = totalItems ? (Number(today?.inLaundry ?? 0) / totalItems) * 100 : 0;

  const metricValue = (id: KpiMetricKey): number => {
    if (id === "avgTurnaround") return turnaround.hours;
    if (id === "utilizationRate") return exec.utilizationRate;
    if (id === "costPerItem") return exec.costPerItem;
    return Number(today?.[id] ?? 0);
  };

  const seriesFor = (id: KpiMetricKey) => {
    if (id === "avgTurnaround") {
      return turnaroundSeries.map((s) => ({
        date: s.date,
        dateLabel: String(s.date).slice(5),
        value: Number(s.value),
      }));
    }
    if (id === "utilizationRate") {
      return series30.map((s) => {
        const total = Number(s.totalItems ?? 0) || 1;
        const active =
          Number(s.withCustomers ?? 0) + Number(s.inLaundry ?? 0) + Number(s.ready ?? 0);
        return {
          date: String(s.date),
          dateLabel: String(s.date).slice(5),
          value: (active / total) * 100,
        };
      });
    }
    if (id === "costPerItem") {
      return series30.map((s) => {
        const total = Number(s.totalItems ?? 0) || 1;
        return {
          date: String(s.date),
          dateLabel: String(s.date).slice(5),
          value: Number(s.inventoryValue ?? 0) / total,
        };
      });
    }
    return series30.map((s) => ({
      date: String(s.date),
      dateLabel: String(s.date).slice(5),
      value: Number(s[id] ?? 0),
    }));
  };

  const sparkFor = (id: KpiMetricKey) => {
    const full = seriesFor(id);
    return full.slice(-7).map((s) => ({ date: s.date, value: s.value }));
  };

  const items: KpiCardData[] = KPI_DEFINITIONS.map((def) => {
    const raw = metricValue(def.id);
    const series = seriesFor(def.id);
    const sparkline = sparkFor(def.id);

    let sub: string | undefined;
    if (def.id === "withCustomers") sub = fmtPct(withCustomerPct);
    if (def.id === "inLaundry") sub = fmtPct(inLaundryPct);
    if (def.id === "avgTurnaround" && turnaround.samples > 0) {
      sub = `Based on ${fmtNumber(turnaround.samples)} cycles`;
    }
    if (def.id === "costPerItem" && exec.avgCyclePrice > 0) {
      sub = `${fmtAED(exec.avgCyclePrice)} / wash cycle`;
    }

    const trendKey = def.id === "totalItems" || def.id === "missing" ? def.id : undefined;

    return {
      id: def.id,
      label: def.label,
      value: formatValue(def.id, raw),
      rawValue: raw,
      sub,
      trend: trendKey ? delta(trendKey) : undefined,
      href: def.href,
      tone: def.tone,
      icon: def.icon,
      sparkColor: def.sparkColor,
      sparkline: sparkline.length ? sparkline : sparkSeries.map((s) => ({
        date: String(s.date),
        value: Number(s[def.id] ?? 0),
      })),
      series30: series,
      target: resolveKpiTarget(def.id, raw, { totalItems, inventoryValue }),
      byCustomerType: ["avgTurnaround", "utilizationRate", "costPerItem"].includes(def.id)
        ? []
        : getKpiBreakdownByCustomerType(def.id, customerType),
      byItemType: ["avgTurnaround", "utilizationRate", "costPerItem"].includes(def.id)
        ? []
        : getKpiBreakdownByItemType(def.id, customerType),
    };
  });

  const preferredOrder = role ? getPreferredKpiOrder(role) : [];
  return <KpiGrid items={items} role={role} preferredOrder={preferredOrder} />;
}
