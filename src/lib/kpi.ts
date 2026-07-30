export type KpiTone = "slate" | "green" | "amber" | "red" | "blue";
export type KpiMetricKey =
  | "totalItems"
  | "withCustomers"
  | "inLaundry"
  | "ready"
  | "missing"
  | "nearEol"
  | "disposalRequired"
  | "lossValue";

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
