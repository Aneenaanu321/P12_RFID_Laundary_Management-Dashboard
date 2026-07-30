export const CUSTOMER_TYPES = [
  { value: "HOSPITAL", label: "Hospital" },
  { value: "HOTEL", label: "Hotel" },
  { value: "GYM", label: "Gym" },
  { value: "SPA", label: "Spa" },
] as const;

export type RangePreset = "7" | "30" | "90" | "custom";

export type DashboardFilterState = {
  range: RangePreset;
  from?: string;
  to?: string;
  type?: string;
  compare: boolean;
};

const VALID_TYPES = new Set(CUSTOMER_TYPES.map((t) => t.value));

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function daysAgoIso(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export function parseDashboardFilters(
  sp: Record<string, string | string[] | undefined>
): DashboardFilterState {
  const get = (key: string) => {
    const v = sp[key];
    return Array.isArray(v) ? v[0] : v;
  };

  const rawRange = get("range");
  const range: RangePreset =
    rawRange === "7" || rawRange === "30" || rawRange === "90" || rawRange === "custom"
      ? rawRange
      : "30";

  const typeRaw = get("type");
  const type = typeRaw && VALID_TYPES.has(typeRaw as (typeof CUSTOMER_TYPES)[number]["value"])
    ? typeRaw
    : undefined;

  const compare = get("compare") === "1" || get("compare") === "true";

  let from = get("from");
  let to = get("to");

  if (range === "custom") {
    if (!to) to = todayIso();
    if (!from) from = daysAgoIso(29);
  } else {
    from = undefined;
    to = undefined;
  }

  return { range, from, to, type, compare };
}

export function resolveDateWindow(filters: DashboardFilterState): {
  from: string;
  to: string;
  days: number;
  label: string;
} {
  if (filters.range === "custom" && filters.from && filters.to) {
    const fromMs = new Date(`${filters.from}T12:00:00Z`).getTime();
    const toMs = new Date(`${filters.to}T12:00:00Z`).getTime();
    const days = Math.max(1, Math.round((toMs - fromMs) / 86_400_000) + 1);
    return {
      from: filters.from,
      to: filters.to,
      days,
      label: `${filters.from.slice(5)} – ${filters.to.slice(5)}`,
    };
  }

  const days = Number(filters.range === "custom" ? 30 : filters.range) || 30;
  const to = todayIso();
  const from = daysAgoIso(days - 1);
  const labels: Record<string, string> = {
    "7": "Last 7 days",
    "30": "Last 30 days",
    "90": "Last 90 days",
  };
  return { from, to, days, label: labels[String(days)] ?? `Last ${days} days` };
}
