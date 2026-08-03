"use client";

import dynamic from "next/dynamic";

function ChartFallback({ height = 220 }: { height?: number }) {
  return (
    <div
      className="w-full rounded-lg bg-[var(--surface-muted)] animate-pulse"
      style={{ height }}
      aria-hidden
    />
  );
}

export const TrendAreaChart = dynamic(
  () => import("@/components/charts/Charts").then((m) => m.TrendAreaChart),
  { ssr: false, loading: () => <ChartFallback height={260} /> }
);

export const DonutChart = dynamic(
  () => import("@/components/charts/Charts").then((m) => m.DonutChart),
  { ssr: false, loading: () => <ChartFallback /> }
);

export const BarHorizontal = dynamic(
  () => import("@/components/charts/Charts").then((m) => m.BarHorizontal),
  { ssr: false, loading: () => <ChartFallback /> }
);
