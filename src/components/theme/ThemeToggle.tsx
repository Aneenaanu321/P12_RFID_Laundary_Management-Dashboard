"use client";

import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { preference, cycle } = useTheme();
  const isDark = preference === "dark";

  return (
    <Button
      type="button"
      variant="secondary"
      size="icon"
      onClick={cycle}
      title={isDark ? "Switch to light theme" : "Switch to dark theme"}
      aria-label={isDark ? "Dark theme. Click for light." : "Light theme. Click for dark."}
    >
      {isDark ? <Moon size={16} aria-hidden /> : <Sun size={16} aria-hidden />}
    </Button>
  );
}
