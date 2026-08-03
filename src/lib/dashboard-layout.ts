import { ROLE_LABELS } from "@/lib/nav";
import type { KpiMetricKey } from "@/lib/kpi";

/** Ordered dashboard blocks. Rendered top → bottom per role. */
export type DashboardSectionId =
  | "settlement"
  | "processFlow"
  | "systemHealth"
  | "kpis"
  | "charts"
  | "pinned"
  | "recent"
  | "customers";

const ALL_SECTIONS: DashboardSectionId[] = [
  "settlement",
  "processFlow",
  "systemHealth",
  "kpis",
  "charts",
  "pinned",
  "recent",
  "customers",
];

/** Finance: settlement & loss-oriented KPIs first. */
const FINANCE_SECTIONS: DashboardSectionId[] = [
  "settlement",
  "kpis",
  "charts",
  "pinned",
  "recent",
  "customers",
  "systemHealth",
];

/** Operators: laundry process flow first. */
const OPERATOR_SECTIONS: DashboardSectionId[] = [
  "processFlow",
  "kpis",
  "systemHealth",
  "charts",
  "pinned",
  "recent",
];

/** Admins: KPI overview first, then system health. */
const ADMIN_SECTIONS: DashboardSectionId[] = [
  "kpis",
  "systemHealth",
  "processFlow",
  "charts",
  "pinned",
  "recent",
  "customers",
];

const DEFAULT_SECTIONS: DashboardSectionId[] = [
  "kpis",
  "systemHealth",
  "processFlow",
  "charts",
  "pinned",
  "recent",
  "customers",
];

const FINANCE_KPIS: KpiMetricKey[] = [
  "lossValue",
  "costPerItem",
  "missing",
  "utilizationRate",
  "totalItems",
  "withCustomers",
  "inLaundry",
  "ready",
  "nearEol",
  "disposalRequired",
  "avgTurnaround",
];

const OPERATOR_KPIS: KpiMetricKey[] = [
  "inLaundry",
  "ready",
  "avgTurnaround",
  "utilizationRate",
  "withCustomers",
  "totalItems",
  "missing",
  "nearEol",
  "disposalRequired",
  "lossValue",
  "costPerItem",
];

const ADMIN_KPIS: KpiMetricKey[] = [
  "totalItems",
  "missing",
  "disposalRequired",
  "nearEol",
  "inLaundry",
  "ready",
  "lossValue",
  "avgTurnaround",
  "utilizationRate",
  "costPerItem",
  "withCustomers",
];

function fillMissingSections(preferred: DashboardSectionId[]): DashboardSectionId[] {
  const seen = new Set(preferred);
  return [...preferred, ...ALL_SECTIONS.filter((s) => !seen.has(s))];
}

export function getDashboardSections(role: string): DashboardSectionId[] {
  switch (role) {
    case "FINANCE_USER":
      return fillMissingSections(FINANCE_SECTIONS);
    case "OPERATOR":
    case "OPERATIONS_MANAGER":
    case "LAUNDRY_MANAGER":
      return fillMissingSections(OPERATOR_SECTIONS);
    case "SUPER_ADMIN":
      return fillMissingSections(ADMIN_SECTIONS);
    default:
      return fillMissingSections(DEFAULT_SECTIONS);
  }
}

export function getPreferredKpiOrder(role: string): KpiMetricKey[] {
  switch (role) {
    case "FINANCE_USER":
      return FINANCE_KPIS;
    case "OPERATOR":
    case "OPERATIONS_MANAGER":
    case "LAUNDRY_MANAGER":
      return OPERATOR_KPIS;
    case "SUPER_ADMIN":
      return ADMIN_KPIS;
    default:
      return [];
  }
}

export function getDashboardVariantLabel(role: string): string {
  const label = ROLE_LABELS[role] ?? role;
  switch (role) {
    case "FINANCE_USER":
      return `${label} view — settlement & loss first`;
    case "OPERATOR":
    case "OPERATIONS_MANAGER":
    case "LAUNDRY_MANAGER":
      return `${label} view — process flow first`;
    case "SUPER_ADMIN":
      return `${label} view — KPIs first`;
    default:
      return `${label} overview`;
  }
}
