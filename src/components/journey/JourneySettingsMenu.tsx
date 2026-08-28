"use client";

import { useEffect, useRef, useState } from "react";
import { Toggle } from "@/components/ui/Toggle";
import { PERSONA_LABELS, RECORDING_PERSONAS } from "@/lib/recordableItems";
import type { RecordingPersona } from "@/lib/recordableItems";
import { EXPERIENCE_LEVELS } from "@/lib/experienceLevels";
import { useHideBottomBarWhile } from "@/components/layout/BottomBarVisibilityContext";
import type { ChildProfileData, ExperienceLevel } from "@/types/domain";

interface JourneySettingsMenuProps {
  child: ChildProfileData;
  onMicrophoneOptInChange: (enabled: boolean) => void;
  onSpeakFirstModeChange: (enabled: boolean) => void;
  onLenientPronunciationModeChange: (enabled: boolean) => void;
  onPreferredVoicePersonaChange: (persona: RecordingPersona | null) => void;
  onExperienceLevelChange: (level: ExperienceLevel) => void;
}

/**
 * Instellingen voor spraakoefeningen (microfoon, zelfstandig spreken).
 * Stonden eerst als twee permanent zichtbare kaarten bovenaan het reispad —
 * op verzoek nu ingeklapt achter een klein zwevend knopje, zodat ze
 * beschikbaar blijven zonder de hoofdervaring (het reispad zelf) te
 * verdringen (hfst. 30: ouderinstellingen mogen niet in de weg zitten).
 */
export function JourneySettingsMenu({
  child,
  onMicrophoneOptInChange,
  onSpeakFirstModeChange,
  onLenientPronunciationModeChange,
  onPreferredVoicePersonaChange,
  onExperienceLevelChange,
}: JourneySettingsMenuProps) {
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

          <div className="flex flex-col gap-3 overflow-y-auto p-4 sm:p-0">
            <Toggle
              checked={child.microphoneOptIn}
              onChange={onMicrophoneOptInChange}
              label="Microfoon gebruiken"
              description={
                child.microphoneOptIn
                  ? "Aan: spraakoefeningen nemen echt op en worden vergeleken/beoordeeld."
                  : "Uit: spraakoefeningen worden overgeslagen met een 'ik heb het gezegd'-knop, ook als de microfoon van dit toestel aanstaat."
              }
            />
            <Toggle
              checked={child.speakFirstMode}
              onChange={onSpeakFirstModeChange}
              label="Zelfstandig spreken"
              description={
                child.speakFirstMode
                  ? "Aan: plaatje zien en zelf inspreken, zonder het woord eerst te horen."
                  : "Uit: eerst het woord horen, dan nazeggen. Geldt vanaf de volgende les."
              }
            />
            <Toggle
              checked={child.lenientPronunciationMode}
              onChange={onLenientPronunciationModeChange}
              label="3x inspreken is genoeg"
              description={
                child.lenientPronunciationMode
                  ? "Aan: een spreekoefening is klaar zodra het woord 3x is ingesproken, ongeacht of de uitspraak precies matcht."
                  : "Uit: het kind moet net zo vaak proberen tot de uitspraak echt herkend wordt (onbeperkt proberen)."
              }
            />

            <div className="flex flex-col gap-1.5 border-t border-border-subtle pt-3">
              <span className="text-sm font-semibold text-ink">Niveau</span>
              <p className="text-xs text-ink-muted">
                Geen leeftijdsindeling — puur waar dit kind qua taal staat. Altijd aan te passen, ook achteraf.
              </p>
              <div className="flex flex-col gap-1.5 pt-1">
                {EXPERIENCE_LEVELS.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => onExperienceLevelChange(option.value)}
                    aria-pressed={child.level === option.value}
                    className={`flex flex-col rounded-xl border px-3 py-1.5 text-left transition-colors ${
                      child.level === option.value
                        ? "border-forest-500 bg-forest-100"
                        : "border-border-subtle bg-white hover:bg-cream"
                    }`}
                  >
                    <span
                      className={`text-sm font-semibold ${child.level === option.value ? "text-forest-600" : "text-ink"}`}
                    >
                      {option.label}
                    </span>
                    <span className="text-xs text-ink-muted">{option.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-1.5 border-t border-border-subtle pt-3">
              <span className="text-sm font-semibold text-ink">Stem</span>
              <p className="text-xs text-ink-muted">
                Welke stem wil je horen bij het luisteren? Als die stem een woord niet heeft ingesproken, wordt
                automatisch een andere stem gebruikt.
              </p>
              <div className="flex flex-wrap gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => onPreferredVoicePersonaChange(null)}
                  aria-pressed={child.preferredVoicePersona === null}
                  className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                    child.preferredVoicePersona === null
                      ? "border-forest-500 bg-forest-100 text-forest-600"
                      : "border-border-subtle bg-white text-ink-muted hover:bg-cream"
                  }`}
                >
                  Automatisch
                </button>
                {RECORDING_PERSONAS.map((persona) => (
                  <button
                    key={persona}
                    type="button"
                    onClick={() => onPreferredVoicePersonaChange(persona)}
                    aria-pressed={child.preferredVoicePersona === persona}
                    className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                      child.preferredVoicePersona === persona
                        ? "border-forest-500 bg-forest-100 text-forest-600"
                        : "border-border-subtle bg-white text-ink-muted hover:bg-cream"
                    }`}
                  >
                    {PERSONA_LABELS[persona]}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
