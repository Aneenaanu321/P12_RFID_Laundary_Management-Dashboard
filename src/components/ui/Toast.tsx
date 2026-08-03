"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { CheckCircle2, AlertTriangle, Info, X, Bell } from "lucide-react";
import { cn } from "@/lib/cn";

export type ToastTone = "default" | "success" | "error" | "warning" | "critical";

export type ToastItem = {
  id: string;
  title: string;
  message?: string;
  href?: string;
  hrefLabel?: string;
  tone?: ToastTone;
};

type ToastContextValue = {
  toast: (item: Omit<ToastItem, "id"> & { id?: string }) => void;
  dismiss: (id: string) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

/** Safe optional toast — no-ops outside provider. */
export function useToastOptional() {
  return useContext(ToastContext);
}

const TONE_STYLES: Record<ToastTone, { border: string; iconBg: string; icon: typeof Info; title: string }> = {
  default: {
    border: "border-[var(--border-subtle)]",
    iconBg: "bg-[var(--surface-muted)] text-[var(--muted)]",
    icon: Info,
    title: "text-[var(--foreground)]",
  },
  success: {
    border: "border-[var(--status-green)]/30",
    iconBg: "bg-[var(--status-green-bg)] text-[var(--status-green)]",
    icon: CheckCircle2,
    title: "text-[var(--status-green)]",
  },
  error: {
    border: "border-[var(--status-red)]/30",
    iconBg: "bg-[var(--status-red-bg)] text-[var(--status-red)]",
    icon: AlertTriangle,
    title: "text-[var(--status-red)]",
  },
  warning: {
    border: "border-[var(--status-amber)]/30",
    iconBg: "bg-[var(--status-amber-bg)] text-[var(--status-amber)]",
    icon: AlertTriangle,
    title: "text-[var(--status-amber)]",
  },
  critical: {
    border: "border-[var(--status-red)]/30",
    iconBg: "bg-[var(--status-red-bg)] text-[var(--status-red)]",
    icon: Bell,
    title: "text-[var(--status-red)]",
  },
};

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-[120] flex w-[min(100vw-2rem,360px)] flex-col gap-2 no-print"
      aria-live="polite"
      aria-relevant="additions"
    >
      {toasts.map((t) => {
        const tone = t.tone ?? "default";
        const style = TONE_STYLES[tone];
        const Icon = style.icon;
        return (
          <div
            key={t.id}
            className={cn(
              "rounded-xl border bg-[var(--card-bg)] shadow-lg p-3.5 dash-enter",
              style.border
            )}
            role="status"
          >
            <div className="flex items-start gap-3">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", style.iconBg)}>
                <Icon size={15} aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <p className={cn("text-xs font-semibold uppercase tracking-wide", style.title)}>
                  {t.title}
                </p>
                {t.message && (
                  <p className="text-sm text-[var(--foreground)] mt-0.5 leading-snug">{t.message}</p>
                )}
                {t.href && (
                  <Link
                    href={t.href}
                    className="inline-block mt-2 text-xs font-medium text-[var(--status-blue)] hover:underline"
                  >
                    {t.hrefLabel ?? "View"}
                  </Link>
                )}
              </div>
              <button
                type="button"
                onClick={() => onDismiss(t.id)}
                className="text-[var(--muted-fg)] hover:text-[var(--foreground)] p-0.5"
                aria-label="Dismiss notification"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id"> & { id?: string }) => {
    const id = item.id ?? `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [{ ...item, id }, ...prev].slice(0, 4));
  }, []);

  useEffect(() => {
    if (!toasts.length) return;
    const timers = toasts.map((t) => window.setTimeout(() => dismiss(t.id), 8_000));
    return () => timers.forEach(clearTimeout);
  }, [toasts, dismiss]);

  const value = useMemo(() => ({ toast, dismiss }), [toast, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}
