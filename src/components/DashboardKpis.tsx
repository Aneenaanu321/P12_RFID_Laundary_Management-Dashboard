import { KpiGrid } from "@/components/KpiGrid";
import {
  getKpis,
  getSnapshotSeries,
  getKpiBreakdownByCustomerType,
  getKpiBreakdownByItemType,
} from "@/lib/queries";
import { KPI_DEFINITIONS, resolveKpiTarget, type KpiCardData, type KpiMetricKey } from "@/lib/kpi";
import { fmtAED, fmtNumber, fmtPct } from "@/lib/format";

function formatValue(id: KpiMetricKey, raw: number) {
  if (id === "lossValue") return fmtAED(raw);
  return fmtNumber(raw);
}

export async function DashboardKpis({ customerType }: { customerType?: string }) {
  // Soft delay is unnecessary — Suspense wraps the async boundary from the parent.
  const { today, delta } = getKpis(customerType);
  const sparkSeries = getSnapshotSeries(7);
  const series30 = getSnapshotSeries(30);

  const totalItems = Number(today?.totalItems ?? 0);
  const inventoryValue = Number(today?.inventoryValue ?? totalItems * 25);
  const withCustomerPct = totalItems ? (Number(today?.withCustomers ?? 0) / totalItems) * 100 : 0;
  const inLaundryPct = totalItems ? (Number(today?.inLaundry ?? 0) / totalItems) * 100 : 0;

  const items: KpiCardData[] = KPI_DEFINITIONS.map((def) => {
    const raw = Number(today?.[def.id] ?? 0);
    const sparkline = sparkSeries.map((s) => ({
      date: String(s.date),
      value: Number(s[def.id] ?? 0),
    }));
    const series = series30.map((s) => ({
      date: String(s.date),
      dateLabel: String(s.date).slice(5),
      value: Number(s[def.id] ?? 0),
    }));

    let sub: string | undefined;
    if (def.id === "withCustomers") sub = fmtPct(withCustomerPct);
    if (def.id === "inLaundry") sub = fmtPct(inLaundryPct);

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
      sparkline,
      series30: series,
      target: resolveKpiTarget(def.id, raw, { totalItems, inventoryValue }),
      byCustomerType: getKpiBreakdownByCustomerType(def.id, customerType),
      byItemType: getKpiBreakdownByItemType(def.id, customerType),
    };
  });

  return <KpiGrid items={items} />;
}
