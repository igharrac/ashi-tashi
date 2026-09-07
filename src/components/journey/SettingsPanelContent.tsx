"use client";

import { Toggle } from "@/components/ui/Toggle";
import { PERSONA_LABELS, RECORDING_PERSONAS } from "@/lib/recordableItems";
import type { RecordingPersona } from "@/lib/recordableItems";
import { EXPERIENCE_LEVELS } from "@/lib/experienceLevels";
import type { ChildProfileData, ExperienceLevel } from "@/types/domain";

export interface SettingsPanelContentProps {
  child: ChildProfileData;
  onMicrophoneOptInChange: (enabled: boolean) => void;
  onSpeakFirstModeChange: (enabled: boolean) => void;
  onLenientPronunciationModeChange: (enabled: boolean) => void;
  onAutoplayAudioChange: (enabled: boolean) => void;
  onPreferredVoicePersonaChange: (persona: RecordingPersona | null) => void;
  onExperienceLevelChange: (level: ExperienceLevel) => void;
}

/**
 * De daadwerkelijke instellingen-velden (niveau, stem, microfoon, zelfstandig
 * spreken, ...) — losgetrokken uit JourneySettingsMenu zodat dezelfde inhoud
 * op twee plekken kan verschijnen: achter het tandwiel-knopje (overlay, zie
 * SettingsMenu.tsx), én altijd zichtbaar/inline op de Profiel-pagina (zie
 * app/kind/[childId]/profiel).
 *
 * Niveau en Stem staan bewust bovenaan en met meer visueel gewicht (bredere
 * rand, eigen kop) dan de vier aan/uit-schakelaars eronder — op verzoek:
 * "Niveau en stem zijn belangrijker dan de toggle instellingen." Dit is ook
 * de vaste plek om ze later te wijzigen (zie ook profiel/nieuw, waar bij het
 * aanmaken al staat dat dit hier altijd opnieuw kan).
 */
export function SettingsPanelContent({
  child,
  onMicrophoneOptInChange,
  onSpeakFirstModeChange,
  onLenientPronunciationModeChange,
  onAutoplayAudioChange,
  onPreferredVoicePersonaChange,
  onExperienceLevelChange,
}: SettingsPanelContentProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold uppercase tracking-wide text-forest-600">Belangrijkste instellingen</span>
      </div>

      <div className="flex flex-col gap-1.5">
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
              className={`flex flex-col rounded-xl border-2 px-3 py-2 text-left transition-colors ${
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

      <div className="flex flex-col gap-1.5 pt-1">
        <span className="text-sm font-semibold text-ink">Stem</span>
        <p className="text-xs text-ink-muted">
          Welke stem wil je horen bij het luisteren? Als die stem een woord niet heeft (goedgekeurd) ingesproken,
          wordt automatisch een andere stem gebruikt.
        </p>
        <div className="flex flex-wrap gap-2 pt-1">
          <button
            type="button"
            onClick={() => onPreferredVoicePersonaChange(null)}
            aria-pressed={child.preferredVoicePersona === null}
            className={`rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors ${
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
              className={`rounded-full border-2 px-3 py-1 text-sm font-medium transition-colors ${
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

      <div className="flex flex-col gap-3 border-t border-border-subtle pt-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Meer instellingen</span>
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
        <Toggle
          checked={child.autoplayAudio}
          onChange={onAutoplayAudioChange}
          label="Geluid speelt automatisch af"
          description={
            child.autoplayAudio
              ? "Aan: het woord/de zin klinkt vanzelf zodra een nieuwe oefening verschijnt. Nog een keer horen kan altijd via het luidsprekertje bovenin de oefening."
              : "Uit: geen geluid vanzelf — tik op het luidsprekertje bovenin de oefening om het te horen."
          }
        />
      </div>
    </div>
  );
}
