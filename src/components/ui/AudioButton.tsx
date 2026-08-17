"use client";

import { useState } from "react";
import { isBrowserSpeechAvailable } from "@/providers/tts/browserSpeechFallback";
import { playWordAudio } from "@/lib/playWordAudio";
import type { RecordingPersona } from "@/lib/recordableItems";
import { Button } from "./Button";

interface AudioButtonProps {
  /** Doeltekst voor de TTS-provider (in de MVP: de Tashelhit-placeholder). */
  text: string;
  /**
   * Als dit item een goedgekeurde opname heeft in de opnamestudio, speelt de
   * knop die écht af in plaats van de NL-fallback. Zonder deze prop (of
   * zonder gevonden opname) valt de knop terug op het oude gedrag.
   */
  itemId?: string;
  /**
   * Nederlandse vertaling om hoorbaar te maken zolang er nog geen echte,
   * gereviewde Tashelhit-audio is (hfst. 21). Zonder deze prop blijft de
   * knop stil, net als voorheen.
   */
  fallbackSpokenText?: string;
  /** Door de gebruiker gekozen stem (child.preferredVoicePersona) — zie getReferenceAudioForItem voor het terugvalgedrag. */
  preferredPersona?: RecordingPersona | null;
  label?: string;
  slow?: boolean;
  onPlayed?: () => void;
}

/**
 * Speelt een woord af. Volgorde: (1) een goedgekeurde opname uit de
 * opnamestudio, indien beschikbaar voor `itemId` — dan hoor je écht
 * Tashelhit; anders (2) de TextToSpeechProvider-interface (mock in de MVP,
 * genereert zelf geen geluid) met (3) een Nederlandse browser-spraaksynthese
 * als hoorbare tijdelijke stand-in. Ondersteunt normale en vertraagde
 * afspeelsnelheid (hfst. 9).
 */
export function AudioButton({
  text,
  itemId,
  fallbackSpokenText,
  preferredPersona,
  label,
  slow = false,
  onPlayed,
}: AudioButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "played">("idle");
  const speechUnavailable = !isBrowserSpeechAvailable();

  async function handlePlay() {
    setStatus("loading");
    await playWordAudio({ itemId, text, fallbackSpokenText, slow, preferredPersona });
    setStatus("played");
    onPlayed?.();
    window.setTimeout(() => setStatus("idle"), 600);
  }

  return (
    <Button
      variant={slow ? "secondary" : "primary"}
      onClick={handlePlay}
      aria-label={label ?? (slow ? "Speel vertraagd af" : "Speel geluid af")}
      className="flex items-center gap-2"
    >
      <span aria-hidden="true">{slow ? "🐢" : "🔊"}</span>
      {status === "loading" ? "…" : label ?? (slow ? "Langzaam" : "Luister")}
      {speechUnavailable && fallbackSpokenText && (
        <span className="sr-only"> (geluid niet ondersteund in deze browser)</span>
      )}
    </Button>
  );
}
