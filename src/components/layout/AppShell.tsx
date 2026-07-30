"use client";

import { useCallback, useEffect, useState } from "react";
import { Sidebar } from "./Sidebar";
import { AppHeader } from "./AppHeader";

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

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setOpen(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <div
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden={!open}
      />

      <Sidebar role={role} name={name} open={open} onToggle={toggle} />

      <div
        className={`min-h-screen flex flex-col transition-[padding] duration-300 ${
          open ? "pl-64" : "pl-14"
        }`}
      >
        <AppHeader alertCount={alertCount} />
        <main className="flex-1 p-6 max-w-[1600px] w-full mx-auto">{children}</main>
        <footer className="px-6 py-4 text-center text-xs text-slate-400 border-t border-slate-200/80">
          © {new Date().getFullYear()} ibTech. All rights reserved.
        </footer>
      </div>
    </div>
  );
}
