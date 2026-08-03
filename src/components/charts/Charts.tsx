"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceDot,
} from "recharts";
import { Download } from "lucide-react";
import type { ChartMarker } from "@/lib/chart-utils";

export type { ChartMarker };

type ChartTheme = {
  palette: string[];
  grid: string;
  tick: string;
  axis: string;
  tooltipBg: string;
  tooltipBorder: string;
  tooltipFg: string;
  cursor: string;
  marker: string;
};

const FALLBACK_THEME: ChartTheme = {
  palette: ["#2563eb", "#0ea5a4", "#b45309", "#b91c1c", "#7c3aed", "#15803d", "#475569", "#0891b2", "#be185d"],
  grid: "#f1f5f9",
  tick: "#94a3b8",
  axis: "#475569",
  tooltipBg: "#ffffff",
  tooltipBorder: "#e2e8f0",
  tooltipFg: "#0f172a",
  cursor: "#f8fafc",
  marker: "#b91c1c",
};

function cssVar(name: string, fallback: string) {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return value || fallback;
}

function resolveColorToken(raw: string | undefined, fallback: string) {
  if (!raw) return fallback;
  if (raw.startsWith("var(")) {
    const name = raw.slice(4, -1).trim();
    return cssVar(name, fallback);
  }
  return raw;
}

function readChartTheme(): ChartTheme {
  return {
    palette: [
      cssVar("--chart-1", FALLBACK_THEME.palette[0]),
      cssVar("--chart-2", FALLBACK_THEME.palette[1]),
      cssVar("--chart-3", FALLBACK_THEME.palette[2]),
      cssVar("--chart-4", FALLBACK_THEME.palette[3]),
      cssVar("--chart-5", FALLBACK_THEME.palette[4]),
      cssVar("--chart-6", FALLBACK_THEME.palette[5]),
      cssVar("--chart-7", FALLBACK_THEME.palette[6]),
      cssVar("--chart-8", FALLBACK_THEME.palette[7]),
      cssVar("--chart-9", FALLBACK_THEME.palette[8]),
    ],
    grid: cssVar("--chart-grid", FALLBACK_THEME.grid),
    tick: cssVar("--chart-tick", FALLBACK_THEME.tick),
    axis: cssVar("--chart-axis", FALLBACK_THEME.axis),
    tooltipBg: cssVar("--chart-tooltip-bg", FALLBACK_THEME.tooltipBg),
    tooltipBorder: cssVar("--chart-tooltip-border", FALLBACK_THEME.tooltipBorder),
    tooltipFg: cssVar("--chart-tooltip-fg", FALLBACK_THEME.tooltipFg),
    cursor: cssVar("--chart-cursor", FALLBACK_THEME.cursor),
    marker: cssVar("--chart-marker", FALLBACK_THEME.marker),
  };
}

function useChartTheme() {
  const [theme, setTheme] = useState<ChartTheme>(FALLBACK_THEME);

  useEffect(() => {
    const apply = () => setTheme(readChartTheme());
    apply();
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    mq.addEventListener("change", apply);
    const obs = new MutationObserver(apply);
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => {
      mq.removeEventListener("change", apply);
      obs.disconnect();
    };
  }, []);

  return theme;
}

function useTooltipStyle(theme: ChartTheme) {
  return {
    fontSize: 12,
    borderRadius: 8,
    border: `1px solid ${theme.tooltipBorder}`,
    background: theme.tooltipBg,
    color: theme.tooltipFg,
    boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
  };
}

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const escape = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [keys.join(","), ...rows.map((r) => keys.map((k) => escape(r[k])).join(","))].join("\n");
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function exportCsv(data: Record<string, unknown>[], filename: string) {
  downloadBlob(new Blob([toCsv(data)], { type: "text/csv;charset=utf-8" }), `${filename}.csv`);
}

async function exportPng(container: HTMLElement | null, filename: string) {
  const svg = container?.querySelector("svg");
  if (!svg) return;

  const clone = svg.cloneNode(true) as SVGSVGElement;
  if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");

  const bbox = svg.getBoundingClientRect();
  const width = Math.max(1, Math.round(bbox.width || Number(svg.getAttribute("width")) || 600));
  const height = Math.max(1, Math.round(bbox.height || Number(svg.getAttribute("height")) || 240));
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));

  const svgStr = new XMLSerializer().serializeToString(clone);
  const svgUrl = URL.createObjectURL(new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" }));

  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = reject;
      image.src = svgUrl;
    });
    const canvas = document.createElement("canvas");
    canvas.width = width * 2;
    canvas.height = height * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--card-bg").trim() || "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(2, 2);
    ctx.drawImage(img, 0, 0, width, height);
    await new Promise<void>((resolve) => {
      canvas.toBlob((blob) => {
        if (blob) downloadBlob(blob, `${filename}.png`);
        resolve();
      }, "image/png");
    });
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

/** Hover-revealed CSV/PNG export controls, matching Reports Center styling. */
export function ChartShell({
  data,
  filename,
  ariaLabel,
  children,
}: {
  data: Record<string, unknown>[];
  filename: string;
  ariaLabel?: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const label = ariaLabel ?? `${filename.replace(/[-_]/g, " ")} chart`;

  return (
    <div
      ref={ref}
      className="group/chart relative"
      role="img"
      aria-label={label}
    >
      <div className="absolute right-1 top-0 z-10 flex gap-1 opacity-0 transition-opacity group-hover/chart:opacity-100 focus-within:opacity-100">
        <button
          type="button"
          onClick={() => exportCsv(data, filename)}
          aria-label={`Export ${label} as CSV`}
          className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] shadow-sm hover:bg-[var(--surface-muted)] a11y-focus"
        >
          <Download size={11} aria-hidden /> CSV
        </button>
        <button
          type="button"
          onClick={() => exportPng(ref.current, filename)}
          aria-label={`Export ${label} as PNG`}
          className="flex items-center gap-1 rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] px-2 py-1 text-[11px] font-medium text-[var(--muted)] shadow-sm hover:bg-[var(--surface-muted)] a11y-focus"
        >
          <Download size={11} aria-hidden /> PNG
        </button>
      </div>
      <div aria-hidden>{children}</div>
    </div>
  );
}

function ChartFrame({
  ariaLabel,
  children,
}: {
  ariaLabel?: string;
  children: ReactNode;
}) {
  if (!ariaLabel) return <>{children}</>;
  return (
    <div role="img" aria-label={ariaLabel}>
      <div aria-hidden>{children}</div>
    </div>
  );
}

function MarkerDots({ markers, color }: { markers?: ChartMarker[]; color: string }) {
  const router = useRouter();
  if (!markers?.length) return null;

  return (
    <>
      {markers.map((m) => (
        <ReferenceDot
          key={`${m.x}-${m.y}-${m.label ?? ""}`}
          x={m.x}
          y={m.y}
          r={5}
          fill={color}
          stroke="#fff"
          strokeWidth={2}
          ifOverflow="extendDomain"
          style={{ cursor: m.href ? "pointer" : "default" }}
          onClick={m.href ? () => router.push(m.href!) : undefined}
          label={
            m.label
              ? {
                  value: m.label,
                  position: "top",
                  fontSize: 10,
                  fill: color,
                  offset: 8,
                }
              : false
          }
        />
      ))}
    </>
  );
}

export function TrendAreaChart({
  data, dataKey, xKey = "date", color, height = 220,
  compareKey, compareName = "Previous period", markers, filename,
  tone = "primary",
  forecastKey, forecastName = "Forecast",
  ariaLabel,
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  xKey?: string;
  color?: string;
  height?: number;
  compareKey?: string;
  compareName?: string;
  markers?: ChartMarker[];
  filename?: string;
  /** Theme palette slot when `color` is omitted. */
  tone?: "primary" | "teal" | "amber" | "danger" | "purple" | "green";
  forecastKey?: string;
  forecastName?: string;
  ariaLabel?: string;
}) {
  const theme = useChartTheme();
  const toneIndex = { primary: 0, teal: 1, amber: 2, danger: 3, purple: 4, green: 5 }[tone];
  const stroke = resolveColorToken(color, theme.palette[toneIndex]);
  const tooltipStyle = useTooltipStyle(theme);
  const label = ariaLabel ?? `${dataKey} trend chart`;
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: markers?.length ? 18 : 5, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={stroke} stopOpacity={0.25} />
            <stop offset="95%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: theme.tick }} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={{ fontSize: 11, fill: theme.tick }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        {compareKey && (
          <Area
            type="monotone"
            dataKey={compareKey}
            name={compareName}
            stroke={stroke}
            strokeWidth={1.5}
            strokeOpacity={0.35}
            fill="transparent"
            strokeDasharray="4 4"
            dot={false}
            connectNulls
          />
        )}
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={stroke}
          strokeWidth={2}
          fill={`url(#grad-${dataKey})`}
          connectNulls={false}
        />
        {forecastKey && (
          <Area
            type="monotone"
            dataKey={forecastKey}
            name={forecastName}
            stroke={stroke}
            strokeWidth={2}
            strokeOpacity={0.7}
            fill="transparent"
            strokeDasharray="6 4"
            dot={false}
            connectNulls
          />
        )}
        <MarkerDots markers={markers} color={theme.marker} />
      </AreaChart>
    </ResponsiveContainer>
  );

  return filename ? (
    <ChartShell data={data} filename={filename} ariaLabel={label}>{chart}</ChartShell>
  ) : (
    <ChartFrame ariaLabel={label}>{chart}</ChartFrame>
  );
}

export function MultiLineChart({ data, lines, xKey = "date", height = 240, filename, ariaLabel }: {
  data: Record<string, unknown>[];
  lines: { key: string; color?: string; name?: string }[];
  xKey?: string;
  height?: number;
  filename?: string;
  ariaLabel?: string;
}) {
  const theme = useChartTheme();
  const tooltipStyle = useTooltipStyle(theme);
  const label = ariaLabel ?? "Multi-series line chart";
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey={xKey} tick={{ fontSize: 11, fill: theme.tick }} axisLine={false} tickLine={false} minTickGap={30} />
        <YAxis tick={{ fontSize: 11, fill: theme.tick }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {lines.map((l, i) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            name={l.name ?? l.key}
            stroke={resolveColorToken(l.color, theme.palette[i % theme.palette.length])}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );

  return filename ? (
    <ChartShell data={data} filename={filename} ariaLabel={label}>{chart}</ChartShell>
  ) : (
    <ChartFrame ariaLabel={label}>{chart}</ChartFrame>
  );
}

export function BarHorizontal({ data, dataKey, nameKey, color, height = 260, filename, tone = "primary", ariaLabel }: {
  data: Record<string, unknown>[];
  dataKey: string;
  nameKey: string;
  color?: string;
  height?: number;
  filename?: string;
  tone?: "primary" | "teal" | "amber" | "danger" | "purple" | "green";
  ariaLabel?: string;
}) {
  const theme = useChartTheme();
  const toneIndex = { primary: 0, teal: 1, amber: 2, danger: 3, purple: 4, green: 5 }[tone];
  const fill = resolveColorToken(color, theme.palette[toneIndex]);
  const tooltipStyle = useTooltipStyle(theme);
  const label = ariaLabel ?? `${dataKey} by ${nameKey} bar chart`;
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: theme.tick }} axisLine={false} tickLine={false} />
        <YAxis type="category" dataKey={nameKey} tick={{ fontSize: 11, fill: theme.axis }} axisLine={false} tickLine={false} width={110} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.cursor }} />
        <Bar dataKey={dataKey} fill={fill} radius={[0, 4, 4, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );

  return filename ? (
    <ChartShell data={data} filename={filename} ariaLabel={label}>{chart}</ChartShell>
  ) : (
    <ChartFrame ariaLabel={label}>{chart}</ChartFrame>
  );
}

export function BarVertical({ data, dataKey, nameKey, color, height = 260, filename, ariaLabel }: {
  data: Record<string, unknown>[]; dataKey: string; nameKey: string; color?: string; height?: number; filename?: string; ariaLabel?: string;
}) {
  const theme = useChartTheme();
  const fill = resolveColorToken(color, theme.palette[0]);
  const tooltipStyle = useTooltipStyle(theme);
  const label = ariaLabel ?? `${dataKey} by ${nameKey} bar chart`;
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} vertical={false} />
        <XAxis dataKey={nameKey} tick={{ fontSize: 11, fill: theme.tick }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: theme.tick }} axisLine={false} tickLine={false} width={40} />
        <Tooltip contentStyle={tooltipStyle} cursor={{ fill: theme.cursor }} />
        <Bar dataKey={dataKey} fill={fill} radius={[4, 4, 0, 0]} barSize={28} />
      </BarChart>
    </ResponsiveContainer>
  );

  return filename ? (
    <ChartShell data={data} filename={filename} ariaLabel={label}>{chart}</ChartShell>
  ) : (
    <ChartFrame ariaLabel={label}>{chart}</ChartFrame>
  );
}

export function DonutChart({ data, dataKey, nameKey, height = 240, filename, ariaLabel }: {
  data: Record<string, unknown>[]; dataKey: string; nameKey: string; height?: number; filename?: string; ariaLabel?: string;
}) {
  const theme = useChartTheme();
  const tooltipStyle = useTooltipStyle(theme);
  const label = ariaLabel ?? `${dataKey} distribution chart`;
  const resolveColor = (raw: unknown, i: number) => {
    if (typeof raw !== "string" || !raw) return theme.palette[i % theme.palette.length];
    if (raw.startsWith("var(")) {
      const name = raw.slice(4, -1).trim();
      return cssVar(name, theme.palette[i % theme.palette.length]);
    }
    return raw;
  };
  const chart = (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie data={data} dataKey={dataKey} nameKey={nameKey} innerRadius={55} outerRadius={85} paddingAngle={2}>
          {data.map((row, i) => (
            <Cell key={i} fill={resolveColor(row.color, i)} />
          ))}
        </Pie>
        <Tooltip contentStyle={tooltipStyle} />
        <Legend wrapperStyle={{ fontSize: 11 }} />
      </PieChart>
    </ResponsiveContainer>
  );

  return filename ? (
    <ChartShell data={data} filename={filename} ariaLabel={label}>{chart}</ChartShell>
  ) : (
    <ChartFrame ariaLabel={label}>{chart}</ChartFrame>
  );
}

export function Sparkline({
  data,
  dataKey,
  color,
  height = 40,
  id = "spark",
}: {
  data: Record<string, unknown>[];
  dataKey: string;
  color?: string;
  height?: number;
  id?: string;
}) {
  const theme = useChartTheme();
  const stroke = resolveColorToken(color, theme.palette[0]);
  if (!data.length) return <div style={{ height }} className="w-full" aria-hidden />;
  const gradId = `grad-${id}`;
  return (
    <div aria-hidden>
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={stroke} stopOpacity={0.3} />
              <stop offset="95%" stopColor={stroke} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={stroke}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
