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

export type ThemePreference = "light" | "dark";

const STORAGE_KEY = "rfid-theme";

type ThemeContextValue = {
  preference: ThemePreference;
  resolved: ThemePreference;
  setPreference: (value: ThemePreference) => void;
  cycle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function applyThemeClass(preference: ThemePreference) {
  const root = document.documentElement;
  root.classList.toggle("dark", preference === "dark");
  root.classList.toggle("light", preference === "light");
  root.style.colorScheme = preference;
  return preference;
}

function readStoredTheme(): ThemePreference {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === "dark") return "dark";
    if (raw === "light") return "light";
    // Migrate legacy "system" (or anything else) to an explicit light/dark choice.
    if (raw === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
  } catch {
    /* ignore */
  }
  return "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>("light");

  useEffect(() => {
    const stored = readStoredTheme();
    setPreferenceState(stored);
    applyThemeClass(stored);
    try {
      localStorage.setItem(STORAGE_KEY, stored);
    } catch {
      /* ignore */
    }
  }, []);

  const setPreference = useCallback((value: ThemePreference) => {
    setPreferenceState(value);
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    applyThemeClass(value);
  }, []);

  const cycle = useCallback(() => {
    setPreferenceState((current) => {
      const next: ThemePreference = current === "light" ? "dark" : "light";
      try {
        localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      applyThemeClass(next);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ preference, resolved: preference, setPreference, cycle }),
    [preference, setPreference, cycle]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
