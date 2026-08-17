"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_OPTIONS } from "@/lib/theme";
import { useTheme } from "./ThemeProvider";

/**
 * Kleine kleurthema-wisselaar (3 swatch-knoppen achter een klein
 * zwevend knopje), in de AppShell-header naast de streak-pil — dus
 * overal beschikbaar op de kind-gerichte schermen (hfst. 30), zonder de
 * bestaande navigatie/structuur te wijzigen. Zelfde interactiepatroon als
 * JourneySettingsMenu.tsx (klik-buiten en Escape sluiten het paneel).
 */
export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Kleurthema kiezen"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-white text-lg shadow-sm transition-transform hover:scale-105
          focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
      >
        <span aria-hidden="true">🎨</span>
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl2 border border-border-subtle bg-white p-3 text-left shadow-soft">
          <p className="mb-2 text-sm font-bold text-ink">Kleurthema</p>
          <div className="flex flex-col gap-2">
            {THEME_OPTIONS.map((option) => {
              const isActive = option.id === theme;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTheme(option.id);
                    setOpen(false);
                  }}
                  aria-pressed={isActive}
                  className={`flex items-center gap-3 rounded-xl2 border px-3 py-2 text-sm font-semibold transition-colors ${
                    isActive
                      ? "border-primary-500 bg-primary-50 text-ink"
                      : "border-border-subtle text-ink-muted hover:bg-cream"
                  }`}
                >
                  <span className="flex h-6 w-10 shrink-0 overflow-hidden rounded-full border border-border-subtle" aria-hidden="true">
                    <span className="flex-1" style={{ backgroundColor: option.swatch.primary }} />
                    <span className="flex-1" style={{ backgroundColor: option.swatch.secondary }} />
                    <span className="flex-1" style={{ backgroundColor: option.swatch.accent }} />
                  </span>
                  {option.label}
                  {isActive && (
                    <span className="ml-auto" aria-hidden="true">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
