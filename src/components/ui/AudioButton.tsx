"use client";

import { useState } from "react";
import { isBrowserSpeechAvailable } from "@/providers/tts/browserSpeechFallback";
import { playWordAudio } from "@/lib/playWordAudio";
import type { RecordingPersona } from "@/lib/recordableItems";
import { Button } from "./Button";

/** Replay-icoon (aangeleverd als SVG) — bewust anders dan het 🔊-schakelicoon van AutoplayIndicator, zodat "opnieuw afspelen" niet met de aan/uit-instelling verward wordt. */
function ReplayIcon({ className = "h-[1em] w-[1em]" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M0.703125 5.625C0.292969 5.625 0 5.33203 0 4.92188V0.703125C0 0.322266 0.292969 0 0.703125 0C1.08398 0 1.40625 0.322266 1.40625 0.703125V3.07617L1.99219 2.37305C3.19336 0.9375 4.98047 0 7.03125 0C10.6348 0 13.5938 2.95898 13.5938 6.5625C13.5938 10.1953 10.6348 13.125 7.03125 13.125C5.53711 13.125 4.18945 12.6562 3.07617 11.8359C2.7832 11.6016 2.69531 11.1621 2.92969 10.8398C3.16406 10.5176 3.60352 10.459 3.92578 10.6934C4.77539 11.3379 5.85938 11.7188 7.03125 11.7188C9.87305 11.7188 12.1875 9.43359 12.1875 6.5625C12.1875 3.7207 9.87305 1.40625 7.03125 1.40625C5.41992 1.40625 4.01367 2.13867 3.04688 3.28125L2.25586 4.21875H4.92188C5.30273 4.21875 5.625 4.54102 5.625 4.92188C5.625 5.33203 5.30273 5.625 4.92188 5.625H0.703125Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
  /** Toon alleen het luidsprekericoon (ronde knop, geen tekstlabel) — voor krappe of erg symmetrische lay-outs; de aria-label blijft wel het volledige label. */
  iconOnly?: boolean;
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
  iconOnly = false,
}: AudioButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "played">("idle");
  const speechUnavailable = !isBrowserSpeechAvailable();
  const accessibleLabel = label ?? (slow ? "Speel vertraagd af" : "Speel geluid af");

  async function handlePlay() {
    setStatus("loading");
    await playWordAudio({ itemId, text, fallbackSpokenText, slow, preferredPersona });
    setStatus("played");
    onPlayed?.();
    window.setTimeout(() => setStatus("idle"), 600);
  }

  if (iconOnly) {
    return (
      <Button
        variant={slow ? "secondary" : "outline"}
        size="icon"
        onClick={handlePlay}
        aria-label={accessibleLabel}
      >
        <span aria-hidden="true">{status === "loading" ? "…" : slow ? "🐢" : <ReplayIcon />}</span>
        {speechUnavailable && fallbackSpokenText && (
          <span className="sr-only"> (geluid niet ondersteund in deze browser)</span>
        )}
      </Button>
    );
  }

  return (
    <Button variant={slow ? "secondary" : "primary"} onClick={handlePlay} aria-label={accessibleLabel} className="flex items-center gap-2">
      <span aria-hidden="true">{slow ? "🐢" : <ReplayIcon />}</span>
      {status === "loading" ? "…" : label ?? (slow ? "Langzaam" : "Luister")}
      {speechUnavailable && fallbackSpokenText && (
        <span className="sr-only"> (geluid niet ondersteund in deze browser)</span>
      )}
    </Button>
  );
}
