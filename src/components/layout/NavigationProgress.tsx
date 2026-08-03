"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";

/** Thin top-of-viewport progress bar during App Router navigations. */
export function NavigationProgress() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [active, setActive] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setActive(true);
    setVisible(true);
    const done = window.setTimeout(() => setActive(false), 350);
    const hide = window.setTimeout(() => setVisible(false), 550);
    return () => {
      window.clearTimeout(done);
      window.clearTimeout(hide);
    };
  }, [pathname, searchParams]);

  if (!visible) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-[200] h-0.5 pointer-events-none no-print"
      role="progressbar"
      aria-hidden={!active}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={active ? 70 : 100}
    >
      <div
        className={`h-full bg-[var(--accent-600)] origin-left transition-transform duration-300 ease-out ${
          active ? "animate-nav-progress" : ""
        }`}
        style={{ transform: active ? undefined : "scaleX(1)", transformOrigin: "left" }}
      />
    </div>
  );
}
