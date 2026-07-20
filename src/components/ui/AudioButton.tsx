"use client";

import { useState } from "react";
import { mockTtsProvider } from "@/providers/tts/mockTtsProvider";
import { Button } from "./Button";

interface AudioButtonProps {
  text: string;
  label?: string;
  slow?: boolean;
  onPlayed?: () => void;
}

/**
 * Speelt een woord af via de TextToSpeechProvider-interface (mock in de MVP).
 * Ondersteunt normale en vertraagde afspeelsnelheid (hfst. 9).
 * Er wordt geen echt geluid afgespeeld in deze demo (geen audiobestanden
 * aanwezig) — de knop toont wel duidelijk de laad- en afspeelstatus, zodat
 * de interactie zelf getest kan worden.
 */
export function AudioButton({ text, label, slow = false, onPlayed }: AudioButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "played">("idle");

  async function handlePlay() {
    setStatus("loading");
    await mockTtsProvider.generateSpeech({
      text,
      languageCode: "tzm",
      voiceId: "demo-voice",
      speakingRate: slow ? 0.7 : 1.0,
    });
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
    </Button>
  );
}
