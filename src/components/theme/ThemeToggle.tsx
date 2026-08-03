"use client";

import { Monitor, Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
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
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={cycle}
      title={`Theme: ${LABELS[preference]} (click to cycle)`}
      aria-label={`Theme ${LABELS[preference]}. Click to cycle light, dark, system.`}
    >
      <Icon size={16} aria-hidden />
    </Button>
  );
}
