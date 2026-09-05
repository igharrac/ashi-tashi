"use client";

import { useState } from "react";
import { playWordAudio } from "@/lib/playWordAudio";
import type { RecordingPersona } from "@/lib/recordableItems";

interface ReplayAudioButtonProps {
  itemId?: string;
  text: string;
  fallbackSpokenText?: string;
  preferredPersona?: RecordingPersona | null;
  className?: string;
}

/**
 * Klein "nog een keer afspelen"-icoon voor in de statusbalk boven een
 * oefening/gesprek (op verzoek losgetrokken van de mic-knop): altijd
 * beschikbaar, in elke status van de oefening — i.p.v. het oude
 * luidsprekertje (AutoplayToggle) naast de mic-knop, dat verdween zodra
 * het kind aan het luisteren was of feedback kreeg, precies het moment
 * waarop een kind het woord vaak nog een keer wil horen. De aan/uit-
 * instelling voor automatisch afspelen zelf staat voortaan in de
 * instellingen (SettingsPanelContent.tsx) i.p.v. hier — dit icoon speelt
 * altijd gewoon af, het is geen schakelaar.
 *
 * Zelfde visuele stijl als de terug-pijl in de statusbalk (h-9 w-9,
 * transparant, geen rand) — bewust kleiner en stiller dan de primaire
 * mic-knop in de oefening zelf, die groot en kleurrijk blijft.
 */
export function ReplayAudioButton({ itemId, text, fallbackSpokenText, preferredPersona, className = "" }: ReplayAudioButtonProps) {
  const [playing, setPlaying] = useState(false);

  async function handleClick() {
    setPlaying(true);
    await playWordAudio({ itemId, text, fallbackSpokenText, preferredPersona });
    setPlaying(false);
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={playing}
      aria-label="Nog een keer afspelen"
      className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-muted
        transition-colors hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
        disabled:opacity-50 ${className}`}
    >
      <span aria-hidden="true">{playing ? "…" : "🔊"}</span>
    </button>
  );
}
