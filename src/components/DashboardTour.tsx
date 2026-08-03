"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";
import { TOUR_EVENT } from "@/components/DashboardToolbar";

const STORAGE_KEY = "rfid-dashboard-tour-v1";

type TourStep = {
  target: string;
  title: string;
  body: string;
};

const STEPS: TourStep[] = [
  {
    target: "#tour-kpis",
    title: "KPI cards",
    body: "Live counts for inventory, laundry, missing items, and loss value. Click a card for a deeper breakdown, or Customize to reorder.",
  },
  {
    target: "#tour-process-flow",
    title: "Laundry process flow",
    body: "See how many items sit in each stage. Wider bars and amber/red highlights flag bottlenecks worth checking in Operations.",
  },
  {
    target: "#tour-customers",
    title: "Customer overview",
    body: "Organization health at a glance. Open any row for that customer’s inventory and settlement detail.",
  },
];

type Rect = { top: number; left: number; width: number; height: number };

function measure(selector: string): Rect | null {
  const el = document.querySelector(selector);
  if (!el) return null;
  const r = el.getBoundingClientRect();
  if (r.width < 8 || r.height < 8) return null;
  return { top: r.top, left: r.left, width: r.width, height: r.height };
}

export function DashboardTour() {
  const [active, setActive] = useState(false);
  const [index, setIndex] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);
  const [available, setAvailable] = useState<TourStep[]>([]);

  const resolveSteps = useCallback(() => STEPS.filter((s) => measure(s.target)), []);

  const finish = useCallback(() => {
    setActive(false);
    setIndex(0);
    setRect(null);
    try {
      localStorage.setItem(STORAGE_KEY, "1");
    } catch {
      /* ignore */
    }
  }, []);

  const start = useCallback(() => {
    const tryStart = (attempt: number) => {
      const steps = resolveSteps();
      if (steps.length > 0) {
        setAvailable(steps);
        setIndex(0);
        setActive(true);
        return;
      }
      if (attempt < 5) {
        window.setTimeout(() => tryStart(attempt + 1), 400);
      }
    };
    tryStart(0);
  }, [resolveSteps]);

  useEffect(() => {
    const onStart = () => start();
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [start]);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      if (cancelled) return;
      try {
        if (localStorage.getItem(STORAGE_KEY)) return;
      } catch {
        return;
      }
      start();
    }, 900);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [start]);

  useLayoutEffect(() => {
    if (!active || !available[index]) return;

    const step = available[index];
    const update = () => {
      const next = measure(step.target);
      setRect(next);
      if (next) {
        document.querySelector(step.target)?.scrollIntoView({
          behavior: "smooth",
          block: "center",
          inline: "nearest",
        });
      }
    };
    update();
    // Remeasure after scroll settles
    const t = window.setTimeout(update, 350);
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update, true);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update, true);
    };
  }, [active, available, index]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") finish();
      if (e.key === "ArrowRight" || e.key === "Enter") {
        e.preventDefault();
        if (index >= available.length - 1) finish();
        else setIndex((i) => i + 1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIndex((i) => Math.max(0, i - 1));
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active, available.length, finish, index]);

  if (!active || !available[index]) return null;

  const step = available[index];
  const pad = 8;
  const tipBelow = rect ? rect.top + rect.height + pad + 12 : 80;
  const tipAbove = rect ? rect.top - pad - 160 : 80;
  const tipTop = rect && tipBelow + 170 > window.innerHeight && tipAbove > 16
    ? tipAbove
    : Math.min(window.innerHeight - 180, Math.max(16, tipBelow));
  const tipLeft = rect
    ? Math.min(Math.max(16, rect.left), window.innerWidth - 336)
    : 16;

  return (
    <div className="fixed inset-0 z-[200] no-print" role="dialog" aria-modal="true" aria-labelledby="tour-title">
      {/* Dim layers around the spotlight */}
      {rect ? (
        <>
          <div className="fixed bg-black/50" style={{ top: 0, left: 0, right: 0, height: Math.max(0, rect.top - pad) }} onClick={finish} />
          <div className="fixed bg-black/50" style={{ top: rect.top + rect.height + pad, left: 0, right: 0, bottom: 0 }} onClick={finish} />
          <div className="fixed bg-black/50" style={{ top: rect.top - pad, left: 0, width: Math.max(0, rect.left - pad), height: rect.height + pad * 2 }} onClick={finish} />
          <div className="fixed bg-black/50" style={{ top: rect.top - pad, left: rect.left + rect.width + pad, right: 0, height: rect.height + pad * 2 }} onClick={finish} />
          <div
            className="fixed rounded-xl ring-2 ring-[var(--status-blue)] pointer-events-none"
            style={{
              top: rect.top - pad,
              left: rect.left - pad,
              width: rect.width + pad * 2,
              height: rect.height + pad * 2,
            }}
          />
        </>
      ) : (
        <div className="absolute inset-0 bg-black/50" onClick={finish} />
      )}

      <div
        className="fixed w-[min(320px,calc(100vw-2rem))] rounded-xl border border-[var(--border-subtle)] bg-[var(--card-bg)] shadow-xl p-4 z-10"
        style={{ top: tipTop, left: tipLeft }}
      >
        <p className="text-[10px] font-semibold uppercase tracking-wider text-[var(--muted-fg)] mb-1">
          Step {index + 1} of {available.length}
        </p>
        <h2 id="tour-title" className="text-sm font-semibold text-[var(--foreground)]">
          {step.title}
        </h2>
        <p className="text-xs text-[var(--muted)] mt-1.5 leading-relaxed">{step.body}</p>
        <div className="flex items-center justify-between gap-2 mt-4">
          <button
            type="button"
            onClick={finish}
            className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)] px-2 py-1.5 a11y-focus rounded-md"
          >
            Skip
          </button>
          <div className="flex gap-2">
            {index > 0 && (
              <button
                type="button"
                onClick={() => setIndex((i) => i - 1)}
                className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-[var(--border-subtle)] text-[var(--muted)] hover:bg-[var(--surface-muted)] a11y-focus"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (index >= available.length - 1) finish();
                else setIndex((i) => i + 1);
              }}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-[var(--status-blue)] text-white hover:opacity-90 a11y-focus"
            >
              {index >= available.length - 1 ? "Done" : "Next"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
