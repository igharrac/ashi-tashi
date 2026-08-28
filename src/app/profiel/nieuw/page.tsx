"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useAppStore } from "@/lib/store";
import { AVATARS } from "@/lib/demoData";
import { Button } from "@/components/ui/Button";
import { EXPERIENCE_LEVELS } from "@/lib/experienceLevels";
import { RECORDING_PERSONAS, PERSONA_LABELS, type RecordingPersona } from "@/lib/recordableItems";
import type { ExperienceLevel } from "@/types/domain";

/**
 * Emoji per stem-persona voor de stap "Stem" hieronder. Lichte huidskleur
 * (🏻) i.p.v. de standaard gele kleur, op verzoek. Donker haar is bij deze
 * emoji's al de standaard tekening (alleen rood/krullend/wit/kaal hebben
 * een aparte haar-variant in Unicode), dus daar is geen losse modifier voor.
 */
const PERSONA_EMOJI: Record<RecordingPersona, string> = {
  man: "👳🏻‍♂️",
  vrouw: "🧕🏻",
  jongen: "👦🏻",
  meisje: "👧🏻",
};

type Step = 1 | 2 | 3;
const STEP_LABELS: Record<Step, string> = { 1: "Naam & avatar", 2: "Niveau", 3: "Stem" };

/**
 * Kindprofiel aanmaken (hfst. 5.1, 11.1, 55) — als stappenflow (op verzoek):
 * naam/avatar, dan niveau, dan de stem-keuze als eigen, bewuste stap
 * (i.p.v. alles op één lang scrollend formulier), zodat de stemkeuze niet
 * per ongeluk overgeslagen wordt. Elke stap heeft een eigen "Volgende";
 * pas op de laatste stap kan het profiel echt aangemaakt worden.
 */
export default function NewChildProfilePage() {
  const router = useRouter();
  const { createChildProfile } = useAppStore();
  const [step, setStep] = useState<Step>(1);
  const [displayName, setDisplayName] = useState("");
  const [avatarId, setAvatarId] = useState(AVATARS[0]);
  const [level, setLevel] = useState<ExperienceLevel>("A_ONTDEKKEN");
  const [preferredVoicePersona, setPreferredVoicePersona] = useState<RecordingPersona | null>(null);

  const canProceedFromStep1 = displayName.trim().length > 0 && !!avatarId;

  function handleSubmit() {
    if (!preferredVoicePersona) return;
    const child = createChildProfile({
      displayName: displayName.trim(),
      avatarId: avatarId ?? "🦊",
      level,
      preferredVoicePersona,
    });
    router.push(`/kind/${child.id}/route`);
  }

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold text-forest-500">Nieuw kindprofiel</h1>
        <div className="mt-3 flex items-center gap-2 text-sm text-gray-500" aria-hidden="true">
          {([1, 2, 3] as Step[]).map((s, i) => (
            <span key={s} className="flex items-center gap-2">
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${
                  s === step
                    ? "bg-primary-500 text-white"
                    : s < step
                      ? "bg-primary-100 text-primary-600"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {s}
              </span>
              <span className={s === step ? "font-semibold text-gray-700" : ""}>{STEP_LABELS[s]}</span>
              {i < 2 && <span className="text-gray-300">→</span>}
            </span>
          ))}
        </div>
      </div>

      {step === 1 && (
        <div className="flex flex-col gap-8">
          <label className="flex flex-col gap-1 text-sm font-medium text-gray-700">
            Naam
            <input
              required
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="rounded-lg border-2 border-primary-100 px-4 py-3 text-base
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
            />
          </label>

          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">Kies een avatar</legend>
            <div className="grid grid-cols-6 gap-3" role="group">
              {AVATARS.map((avatar) => (
                <button
                  key={avatar}
                  type="button"
                  onClick={() => setAvatarId(avatar)}
                  aria-pressed={avatarId === avatar}
                  aria-label={`Avatar ${avatar}`}
                  className={`flex h-14 w-14 items-center justify-center rounded-xl2 border-4 text-3xl
                    focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                    ${avatarId === avatar ? "border-primary-500 bg-primary-50" : "border-transparent bg-primary-100/50"}`}
                >
                  {avatar}
                </button>
              ))}
            </div>
          </fieldset>

          <Button type="button" onClick={() => setStep(2)} disabled={!canProceedFromStep1}>
            Volgende
          </Button>
        </div>
      )}

      {step === 2 && (
        <div className="flex flex-col gap-8">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">Beginniveau (hfst. 5.1)</legend>
            <p className="mb-2 text-xs text-gray-500">Later gewoon aan te passen via het Profiel-scherm of de instellingen op het reispad.</p>
            <div className="flex flex-col gap-2">
              {EXPERIENCE_LEVELS.map((option) => (
                <label
                  key={option.value}
                  className={`flex cursor-pointer flex-col rounded-xl2 border-2 p-3
                    ${level === option.value ? "border-primary-500 bg-primary-50" : "border-primary-100"}`}
                >
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="level"
                      value={option.value}
                      checked={level === option.value}
                      onChange={() => setLevel(option.value)}
                    />
                    <span className="font-semibold">{option.label}</span>
                  </span>
                  <span className="pl-6 text-sm text-gray-500">{option.hint}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3">
            <Button type="button" onClick={() => setStep(1)} variant="secondary">
              Terug
            </Button>
            <Button type="button" onClick={() => setStep(3)}>
              Volgende
            </Button>
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex flex-col gap-8">
          <fieldset>
            <legend className="mb-2 text-sm font-medium text-gray-700">Welke stem hoort dit kind bij het luisteren?</legend>
            <p className="mb-3 text-xs text-gray-500">
              Een bewuste keuze — later nog aan te passen via het Profiel-scherm of de instellingen op het reispad.
            </p>
            <div className="grid grid-cols-2 gap-3" role="group">
              {RECORDING_PERSONAS.map((persona) => (
                <button
                  key={persona}
                  type="button"
                  onClick={() => setPreferredVoicePersona(persona)}
                  aria-pressed={preferredVoicePersona === persona}
                  className={`flex flex-col items-center gap-1 rounded-xl2 border-2 p-4
                    focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                    ${preferredVoicePersona === persona ? "border-primary-500 bg-primary-50" : "border-primary-100"}`}
                >
                  <span className="text-4xl" aria-hidden="true">
                    {PERSONA_EMOJI[persona]}
                  </span>
                  <span className="font-semibold text-gray-700">{PERSONA_LABELS[persona]}</span>
                </button>
              ))}
            </div>
          </fieldset>

          <div className="flex gap-3">
            <Button type="button" onClick={() => setStep(2)} variant="secondary">
              Terug
            </Button>
            <Button type="button" onClick={handleSubmit} disabled={!preferredVoicePersona}>
              Beginnen
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}
