"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme, type ThemePreference } from "./ThemeProvider";

const LABELS: Record<ThemePreference, string> = {
  light: "Light",
  dark: "Dark",
  system: "System",
};

export function ThemeToggle() {
  const { preference, cycle } = useTheme();
  const Icon = preference === "dark" ? Moon : preference === "light" ? Sun : Monitor;

  return (
    <button
      type="button"
      onClick={cycle}
      title={`Theme: ${LABELS[preference]} (click to cycle)`}
      aria-label={`Theme ${LABELS[preference]}. Click to cycle light, dark, system.`}
      className="h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--border-subtle)] bg-[var(--card-bg)] text-[var(--muted)] hover:bg-[var(--surface-muted)] hover:text-[var(--foreground)] transition-colors"
    >
      <Icon size={16} />
    </button>
  );
}
