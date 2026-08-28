"use client";

import { useEffect, useRef, useState } from "react";
import { SettingsPanelContent, type SettingsPanelContentProps } from "./SettingsPanelContent";
import { useHideBottomBarWhile } from "@/components/layout/BottomBarVisibilityContext";

type JourneySettingsMenuProps = SettingsPanelContentProps;

/**
 * Instellingen voor spraakoefeningen (microfoon, zelfstandig spreken).
 * Stonden eerst als twee permanent zichtbare kaarten bovenaan het reispad —
 * op verzoek nu ingeklapt achter een klein zwevend knopje, zodat ze
 * beschikbaar blijven zonder de hoofdervaring (het reispad zelf) te
 * verdringen (hfst. 30: ouderinstellingen mogen niet in de weg zitten).
 *
 * Dezelfde velden staan ook (altijd zichtbaar, geen tandwiel nodig) op de
 * Profiel-pagina — zie SettingsPanelContent.tsx voor de gedeelde inhoud.
 */
export function JourneySettingsMenu(props: JourneySettingsMenuProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Onderste navigatiebalk verbergen zolang deze schermvullende (mobiele)
  // overlay open is, anders is de laatste sectie (Stem) niet scrollbaar/
  // bereikbaar — komt vanzelf terug zodra je teruggaat.
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
    <div ref={containerRef} className="absolute right-0 top-0 z-10">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Instellingen voor spraakoefeningen"
        className="flex h-11 w-11 items-center justify-center rounded-full border border-border-subtle bg-white text-lg shadow-sm transition-transform hover:scale-105"
      >
        <span aria-hidden="true">⚙️</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-white text-left sm:absolute sm:inset-auto sm:right-0 sm:z-20 sm:mt-2 sm:w-72 sm:flex-none sm:rounded-xl2 sm:border sm:border-border-subtle sm:p-3 sm:shadow-soft sm:w-80"
        >
          {/* Alleen op mobiel: schermvullend met een terug-pijltje, want de
              uitklap-dropdown was op kleine schermen niet goed bereikbaar
              (o.a. de Stem-sectie viel buiten beeld). Vanaf sm: gewoon de
              bestaande zwevende dropdown. */}
          <div className="flex items-center gap-2 border-b border-border-subtle px-4 py-3 sm:hidden">
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Terug naar het reispad"
              className="flex h-9 w-9 items-center justify-center rounded-full text-xl hover:bg-cream"
            >
              <span aria-hidden="true">←</span>
            </button>
            <span className="text-base font-semibold text-ink">Instellingen</span>
          </div>

          <div className="overflow-y-auto p-4 sm:p-0">
            <SettingsPanelContent {...props} />
          </div>
        </div>
      )}
    </div>
  );
}
