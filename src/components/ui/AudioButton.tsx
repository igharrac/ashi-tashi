"use client";

import { useState } from "react";
import { mockTtsProvider } from "@/providers/tts/mockTtsProvider";
import { isBrowserSpeechAvailable, speakDutchFallback } from "@/providers/tts/browserSpeechFallback";
import { Button } from "./Button";

interface AudioButtonProps {
  /** Doeltekst voor de TTS-provider (in de MVP: de Tashelhit-placeholder). */
  text: string;
  /**
   * Nederlandse vertaling om hoorbaar te maken zolang er nog geen echte,
   * gereviewde Tashelhit-audio is (hfst. 21). Zonder deze prop blijft de
   * knop stil, net als voorheen.
   */
  fallbackSpokenText?: string;
  label?: string;
  slow?: boolean;
  onPlayed?: () => void;
}

/**
 * Speelt een woord af via de TextToSpeechProvider-interface (mock in de MVP).
 * Ondersteunt normale en vertraagde afspeelsnelheid (hfst. 9).
 *
 * De mock-provider genereert zelf geen geluid (nog geen echte Tashelhit-
 * audio beschikbaar). Als `fallbackSpokenText` is meegegeven, gebruikt de
 * knop de browser's eigen spraaksynthese om die Nederlandse vertaling
 * hoorbaar te maken, zodat de interactie ook echt te horen is tijdens het
 * testen. Dit is een tijdelijke stand-in, geen Tashelhit-uitspraak.
 */
export function AudioButton({ text, fallbackSpokenText, label, slow = false, onPlayed }: AudioButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "played">("idle");
  const speechUnavailable = !isBrowserSpeechAvailable();

  async function handlePlay() {
    setStatus("loading");
    await mockTtsProvider.generateSpeech({
      text,
      languageCode: "tzm",
      voiceId: "demo-voice",
      speakingRate: slow ? 0.7 : 1.0,
    });

    if (fallbackSpokenText) {
      speakDutchFallback(fallbackSpokenText, slow ? 0.7 : 1.0);
    }

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
