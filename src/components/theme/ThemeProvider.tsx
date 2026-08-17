"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { DEFAULT_THEME_ID, THEME_STORAGE_KEY, isThemeId, type ThemeId } from "@/lib/theme";

interface ThemeContextValue {
  theme: ThemeId;
  setTheme: (theme: ThemeId) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

/**
 * Beheert het actieve kleurthema (data-theme op <html>, zie
 * src/app/globals.css voor de bijbehorende CSS-variabelen per thema).
 * Zelfde opzet als AppStoreProvider in lib/store.tsx: localStorage,
 * client-only. Het anti-flits-script in layout.tsx zet data-theme al vóór
 * hydratie op basis van dezelfde localStorage-key — deze provider neemt
 * het daarna over en houdt React-state en het DOM-attribuut synchroon.
 */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeId>(DEFAULT_THEME_ID);

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && isThemeId(stored)) {
      setThemeState(stored);
    }
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const setTheme = useCallback((next: ThemeId) => {
    setThemeState(next);
    window.localStorage.setItem(THEME_STORAGE_KEY, next);
  }, []);

  const value = useMemo<ThemeContextValue>(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme moet binnen ThemeProvider gebruikt worden");
  return ctx;
}
