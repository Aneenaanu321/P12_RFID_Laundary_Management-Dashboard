export type ChartMarker = {
  x: string | number;
  y: number;
  label?: string;
  href?: string;
};

/** Detect day-over-day spikes for trend chart event markers. */
export function detectSeriesSpikes(
  series: Record<string, unknown>[],
  valueKey: string,
  xKey = "dateLabel",
  opts?: { minDelta?: number; minPct?: number; limit?: number; href?: string }
): ChartMarker[] {
  const minDelta = opts?.minDelta ?? 5;
  const minPct = opts?.minPct ?? 0.08;
  const limit = opts?.limit ?? 3;
  const href = opts?.href ?? "/loss/analytics";

  const candidates: (ChartMarker & { delta: number })[] = [];
  for (let i = 1; i < series.length; i++) {
    const prev = Number(series[i - 1][valueKey] ?? 0);
    const curr = Number(series[i][valueKey] ?? 0);
    const delta = curr - prev;
    if (delta < minDelta) continue;
    if (prev > 0 && delta / prev < minPct) continue;
    candidates.push({
      x: series[i][xKey] as string | number,
      y: curr,
      label: `+${delta}`,
      href,
      delta,
    });
  }

  return candidates
    .sort((a, b) => b.delta - a.delta)
    .slice(0, limit)
    .map(({ delta: _d, ...m }) => m);
}
