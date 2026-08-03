"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";
import { NavigationProgress } from "./NavigationProgress";
import { ToastProvider } from "@/components/ui/Toast";
import { ROLE_LABELS } from "@/lib/nav";

const SIDEBAR_OPEN_KEY = "sidebar-open";

function readPersistedOpen(): boolean | null {
  try {
    const v = localStorage.getItem(SIDEBAR_OPEN_KEY);
    if (v === "1") return true;
    if (v === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function AppShell({
  role,
  name,
  alertCount,
  children,
}: {
  role: string;
  name: string;
  alertCount: number;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(true);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const apply = () => {
      if (mq.matches) {
        const persisted = readPersistedOpen();
        setOpen(persisted ?? true);
      } else {
        setOpen(false);
      }
      setHydrated(true);
    };
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  const toggle = useCallback(() => {
    setOpen((v) => {
      const next = !v;
      if (window.matchMedia("(min-width: 1024px)").matches) {
        localStorage.setItem(SIDEBAR_OPEN_KEY, next ? "1" : "0");
      }
      return next;
    });
  }, []);

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open || !hydrated) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && window.matchMedia("(max-width: 1023px)").matches) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, hydrated]);

  return (
    <ToastProvider>
      <div className="min-h-screen bg-[var(--background)]">
        {/* Mobile backdrop — overlay drawer only below lg */}
        <div
          className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden no-print ${
            open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
          }`}
          onClick={close}
          aria-hidden={!open}
        />

        <div className="flex min-h-screen">
          {/* Desktop: in-flow sidebar pushes content. Mobile: fixed overlay drawer. */}
          <div className="no-print shrink-0">
            <Sidebar role={role} name={name} open={open} onToggle={toggle} />
          </div>

          <div
            className={`flex min-h-screen min-w-0 flex-1 flex-col transition-[padding] duration-300 ${
              open ? "max-lg:pl-0" : "max-lg:pl-14"
            }`}
          >
            <div className="no-print">
              <Suspense fallback={null}>
                <NavigationProgress />
              </Suspense>
              <Suspense
                fallback={
                  <div className="h-14 sm:h-16 border-b border-[var(--border-subtle)] bg-[var(--header-bg)]" />
                }
              >
                <AppHeader
                  alertCount={alertCount}
                  userName={name}
                  userRole={ROLE_LABELS[role] ?? role}
                />
              </Suspense>
            </div>
            <main className="flex-1 p-4 sm:p-6 max-w-[1600px] w-full mx-auto print:max-w-none print:p-0">
              {children}
            </main>
            <footer className="px-4 sm:px-6 py-4 text-center text-xs text-[var(--muted-fg)] border-t border-[var(--border-subtle)] no-print">
              © {new Date().getFullYear()} ibTech. All rights reserved.
            </footer>
          </div>
        </div>
      </div>
    </ToastProvider>
  );
}
