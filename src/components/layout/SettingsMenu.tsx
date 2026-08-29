"use client";

import { useEffect, useRef, useState } from "react";
import { THEME_OPTIONS } from "@/lib/theme";
import { useTheme } from "@/components/theme/ThemeProvider";
import { SettingsPanelContent } from "@/components/journey/SettingsPanelContent";
import type { SettingsPanelContentProps } from "@/components/journey/SettingsPanelContent";
import { useHideBottomBarWhile } from "@/components/layout/BottomBarVisibilityContext";

type SettingsMenuProps = SettingsPanelContentProps;

/**
 * Eén tandwiel-knop in de AppShell-header (overal beschikbaar, niet meer
 * alleen op "Jouw Reis") die kleurthema + de spraakinstellingen samen
 * opent — op verzoek samengevoegd, ze stonden eerder als twee losse
 * knopjes (🎨 ThemeSwitcher + ⚙️ JourneySettingsMenu) verspreid over de
 * header en de pagina zelf, wat rommelig oogde op mobiel. Vervangt beide.
 *
 * Zelfde responsive vorm als de oude JourneySettingsMenu: schermvullend
 * met terugknop op mobiel (de Stem-sectie viel anders buiten beeld),
 * gewone zwevende dropdown vanaf sm.
 */
export function SettingsMenu(props: SettingsMenuProps) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useHideBottomBarWhile(open);

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
        aria-label="Instellingen: kleurthema en spraakoefeningen"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-white text-lg shadow-sm transition-transform hover:scale-105
          focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
      >
        <span aria-hidden="true">⚙️</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white text-left sm:absolute sm:inset-auto sm:right-0 sm:z-20 sm:mt-2 sm:w-80 sm:flex-none sm:rounded-xl2 sm:border sm:border-border-subtle sm:p-3 sm:shadow-soft"
        >
          {/* Alleen op mobiel: schermvullend met een terug-pijltje — zelfde
              reden als voorheen, de Stem-sectie valt anders buiten beeld. */}
          <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 sm:hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Sluiten"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-cream"
            >
              <span aria-hidden="true">←</span>
            </button>
            <span className="text-base font-semibold text-ink">Instellingen</span>
          </div>

          <div className="overflow-y-auto p-4 sm:p-0">
            <div className="flex flex-col gap-1.5 pb-3">
              <span className="text-sm font-semibold text-ink">Kleurthema</span>
              <div className="flex flex-col gap-2 pt-1">
                {THEME_OPTIONS.map((option) => {
                  const isActive = option.id === theme;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setTheme(option.id)}
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

            <div className="border-t border-border-subtle pt-3">
              <SettingsPanelContent {...props} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
