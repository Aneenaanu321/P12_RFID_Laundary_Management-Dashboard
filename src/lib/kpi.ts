export type KpiTone = "slate" | "green" | "amber" | "red" | "blue";
export type KpiMetricKey =
  | "totalItems"
  | "withCustomers"
  | "inLaundry"
  | "ready"
  | "missing"
  | "nearEol"
  | "disposalRequired"
  | "lossValue"
  | "avgTurnaround"
  | "utilizationRate"
  | "costPerItem";

export type KpiDefinition = {
  id: KpiMetricKey;
  label: string;
  href: string;
  tone: KpiTone;
  icon: string;
  /** lower = staying under target is good; higher = reaching target is good */
  goalDirection: "lower" | "higher" | "none";
  sparkColor: string;
};

export const KPI_DEFINITIONS: KpiDefinition[] = [
  { id: "totalItems", label: "Total RFID Items", href: "/inventory", tone: "blue", icon: "Package", goalDirection: "none", sparkColor: "var(--status-blue)" },
  { id: "withCustomers", label: "With Customers", href: "/inventory?status=ACTIVE", tone: "green", icon: "Users", goalDirection: "higher", sparkColor: "var(--status-green)" },
  { id: "inLaundry", label: "Currently In Laundry", href: "/operations", tone: "blue", icon: "WashingMachine", goalDirection: "higher", sparkColor: "var(--status-blue)" },
  { id: "ready", label: "Clean & Ready", href: "/operations/dispatch", tone: "green", icon: "CheckCircle2", goalDirection: "higher", sparkColor: "var(--status-green)" },
  { id: "missing", label: "Missing Items", href: "/loss/missing", tone: "red", icon: "AlertTriangle", goalDirection: "lower", sparkColor: "var(--status-red)" },
  { id: "nearEol", label: "Near End of Life", href: "/lifecycle/near-eol", tone: "amber", icon: "Clock3", goalDirection: "lower", sparkColor: "var(--status-amber)" },
  { id: "disposalRequired", label: "Exceeded Wash Limit", href: "/lifecycle/disposal", tone: "red", icon: "XOctagon", goalDirection: "lower", sparkColor: "var(--status-red)" },
  { id: "lossValue", label: "Inventory Loss Value", href: "/loss/analytics", tone: "amber", icon: "Coins", goalDirection: "lower", sparkColor: "var(--status-amber)" },
  { id: "avgTurnaround", label: "Avg Turnaround", href: "/operations", tone: "blue", icon: "Timer", goalDirection: "lower", sparkColor: "var(--status-blue)" },
  { id: "utilizationRate", label: "Utilization Rate", href: "/analytics/inventory", tone: "green", icon: "Gauge", goalDirection: "higher", sparkColor: "var(--status-green)" },
  { id: "costPerItem", label: "Avg Cost / Item", href: "/settlement", tone: "slate", icon: "BadgeDollarSign", goalDirection: "none", sparkColor: "var(--status-gray)" },
];

export const DEFAULT_KPI_ORDER = KPI_DEFINITIONS.map((k) => k.id);

export type KpiTarget = {
  target: number;
  label: string;
  pct: number; // 0–100+ how far toward/over target
  status: "ok" | "warn" | "bad" | "none";
};

/** Compute a sensible target from current totals. */
export function resolveKpiTarget(
  id: KpiMetricKey,
  value: number,
  totals: { totalItems: number; inventoryValue?: number }
): KpiTarget {
  const total = Math.max(1, totals.totalItems);

  switch (id) {
    case "missing": {
      const target = Math.max(25, Math.round(total * 0.015));
      const pct = (value / target) * 100;
      return {
        target,
        label: `Target ≤ ${target.toLocaleString()}`,
        pct,
        status: pct <= 100 ? "ok" : pct <= 150 ? "warn" : "bad",
      };
    }
    case "nearEol": {
      const target = Math.max(50, Math.round(total * 0.05));
      const pct = (value / target) * 100;
      return {
        target,
        label: `Target ≤ ${target.toLocaleString()}`,
        pct,
        status: pct <= 100 ? "ok" : pct <= 140 ? "warn" : "bad",
      };
    }
    case "disposalRequired": {
      const target = Math.max(20, Math.round(total * 0.02));
      const pct = (value / target) * 100;
      return {
        target,
        label: `Target ≤ ${target.toLocaleString()}`,
        pct,
        status: pct <= 100 ? "ok" : pct <= 150 ? "warn" : "bad",
      };
    }
    case "lossValue": {
      const inventory = totals.inventoryValue ?? total * 25;
      const target = Math.max(1000, inventory * 0.02);
      const pct = (value / target) * 100;
      return {
        target,
        label: `Target ≤ ${target.toLocaleString(undefined, { maximumFractionDigits: 0 })} AED`,
        pct,
        status: pct <= 100 ? "ok" : pct <= 150 ? "warn" : "bad",
      };
    }
    case "withCustomers": {
      const target = Math.round(total * 0.4);
      const pct = (value / target) * 100;
      return {
        target,
        label: `Goal ≥ ${target.toLocaleString()}`,
        pct: Math.min(pct, 100),
        status: pct >= 90 ? "ok" : pct >= 60 ? "warn" : "bad",
      };
    }
    case "inLaundry": {
      const target = Math.round(total * 0.2);
      const pct = (value / Math.max(1, target)) * 100;
      return {
        target,
        label: `Goal ≥ ${target.toLocaleString()}`,
        pct: Math.min(pct, 100),
        status: pct >= 70 ? "ok" : pct >= 40 ? "warn" : "bad",
      };
    }
    case "ready": {
      const target = Math.round(total * 0.15);
      const pct = (value / Math.max(1, target)) * 100;
      return {
        target,
        label: `Goal ≥ ${target.toLocaleString()}`,
        pct: Math.min(pct, 100),
        status: pct >= 80 ? "ok" : pct >= 50 ? "warn" : "bad",
      };
    }
    case "avgTurnaround": {
      const target = 24; // hours
      const pct = (value / target) * 100;
      return {
        target,
        label: "Target ≤ 24h",
        pct,
        status: pct <= 100 ? "ok" : pct <= 140 ? "warn" : "bad",
      };
    }
    case "utilizationRate": {
      const target = 75;
      const pct = (value / target) * 100;
      return {
        target,
        label: "Goal ≥ 75%",
        pct: Math.min(pct, 100),
        status: pct >= 90 ? "ok" : pct >= 70 ? "warn" : "bad",
      };
    }
    default:
      return { target: 0, label: "", pct: 0, status: "none" };
  }
}

export type KpiCardData = {
  id: KpiMetricKey;
  label: string;
  value: string;
  rawValue: number;
  sub?: string;
  trend?: number;
  href: string;
  tone: KpiTone;
  icon: string;
  sparkColor: string;
  sparkline: { date: string; value: number }[];
  series30: { date: string; dateLabel: string; value: number }[];
  target: KpiTarget;
  byCustomerType: { name: string; value: number }[];
  byItemType: { name: string; value: number }[];
};

/** Append a simple linear least-squares forecast beyond the last point. */
export function appendLinearForecast(
  series: Record<string, unknown>[],
  dataKey: string,
  xKey: string,
  forecastDays = 7,
  forecastKey = `${dataKey}Forecast`
): Record<string, unknown>[] {
  if (series.length < 3) return series.map((s) => ({ ...s, [forecastKey]: null }));

  const n = series.length;
  const ys = series.map((s) => Number(s[dataKey] ?? 0));
  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += ys[i];
    sumXY += i * ys[i];
    sumXX += i * i;
  }
  const denom = n * sumXX - sumX * sumX;
  const slope = denom === 0 ? 0 : (n * sumXY - sumX * sumY) / denom;
  const intercept = (sumY - slope * sumX) / n;

  const predict = (i: number) => Math.max(0, intercept + slope * i);

  const withHist = series.map((s, i) => ({
    ...s,
    [forecastKey]: i >= n - 1 ? predict(i) : null,
  }));

  // Bridge: set forecast equal to actual on last historical point
  const last = withHist[n - 1];
  last[forecastKey] = Number(last[dataKey] ?? predict(n - 1));

  const lastLabel = String(last[xKey] ?? "");
  const out = [...withHist];
  for (let d = 1; d <= forecastDays; d++) {
    const i = n - 1 + d;
    out.push({
      [xKey]: `+${d}d`,
      dateLabel: `+${d}d`,
      date: lastLabel,
      [dataKey]: null,
      [forecastKey]: predict(i),
    });
  }
  return out;
}
