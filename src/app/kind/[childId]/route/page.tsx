"use client";

import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { AppShell } from "@/components/layout/AppShell";
import { StepGrid } from "@/components/journey/StepGrid";
import { JourneySettingsMenu } from "@/components/journey/JourneySettingsMenu";

/**
 * Leerroute-overzicht (hfst. 10, 55 stap 5-6): responsive grid met één stap
 * per categorie, i.p.v. het eerdere kronkelende S-pad met een aparte
 * "level"-laag ertussen — op verzoek vervangen voor meer overzicht en
 * ruimte voor veel meer (kleinere, steeds moeilijkere) stappen.
 */
export default function LearningRoutePage() {
  const params = useParams<{ childId: string }>();
  const {
    getChild,
    setSpeakFirstMode,
    setLenientPronunciationMode,
    setMicrophoneOptIn,
    setPreferredVoicePersona,
    ready,
  } = useAppStore();

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;

  const child = getChild(params.childId);
  if (!child) return notFound();

  return (
    <AppShell child={child}>
      <div className="relative mx-auto max-w-md text-center">
        <JourneySettingsMenu
          child={child}
          onMicrophoneOptInChange={(enabled) => setMicrophoneOptIn(child.id, enabled)}
          onSpeakFirstModeChange={(enabled) => setSpeakFirstMode(child.id, enabled)}
          onLenientPronunciationModeChange={(enabled) => setLenientPronunciationMode(child.id, enabled)}
          onPreferredVoicePersonaChange={(persona) => setPreferredVoicePersona(child.id, persona)}
        />
        <h1 className="text-2xl font-bold text-forest-500">Jouw Reis</h1>
        <p className="mt-1 text-ink-muted">{child.points} punten verdiend</p>
      </div>

      <StepGrid childId={child.id} child={child} />
    </AppShell>
  );
}
