"use client";

import { useState } from "react";
import { mockTtsProvider } from "@/providers/tts/mockTtsProvider";
import { isBrowserSpeechAvailable, speakDutchFallback } from "@/providers/tts/browserSpeechFallback";
import { getReferenceAudioForItem } from "@/lib/referenceAudio";
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
export function AudioButton({ text, itemId, fallbackSpokenText, label, slow = false, onPlayed }: AudioButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "played">("idle");
  const speechUnavailable = !isBrowserSpeechAvailable();

  async function handlePlay() {
    setStatus("loading");

    if (itemId) {
      const reference = await getReferenceAudioForItem(itemId);
      if (reference) {
        const audio = new Audio(reference.url);
        audio.playbackRate = slow ? 0.7 : 1.0;
        try {
          await audio.play();
        } catch {
          // Afspelen kan mislukken (bv. autoplay-restricties) — geen harde fout, gewoon negeren.
        }
        setStatus("played");
        onPlayed?.();
        window.setTimeout(() => setStatus("idle"), 600);
        return;
      }
    }

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
