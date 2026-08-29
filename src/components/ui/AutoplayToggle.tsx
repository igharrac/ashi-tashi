"use client";

import { playWordAudio } from "@/lib/playWordAudio";
import type { RecordingPersona } from "@/lib/recordableItems";
import { Button } from "./Button";

interface AutoplayToggleProps {
  /** Doeltekst voor de TTS-fallback, zie AudioButton. */
  text: string;
  itemId?: string;
  fallbackSpokenText?: string;
  preferredPersona?: RecordingPersona | null;
  /** Huidige stand van de kindinstelling (child.autoplayAudio). */
  enabled: boolean;
  /** Persisteer de nieuwe stand (store.setAutoplayAudio). */
  onToggle: (enabled: boolean) => void;
  /** Toon alleen het icoon (ronde knop, geen tekstlabel) — zie AudioButton. */
  iconOnly?: boolean;
}

/**
 * Het luidsprekertje bij elke oefening — géén "speel af"-knop meer, maar
 * een schakelaar voor de kindinstelling child.autoplayAudio: aan (normaal
 * 🔊) betekent dat de opname vanzelf klinkt zodra een nieuwe vraag/plaatje
 * verschijnt (zie de losse autoplay-effecten in de oefencomponenten); uit
 * (rood doorgestreept) betekent geen automatisch afspelen meer. Geldt voor
 * het hele profiel, overal waar dit icoon staat (op verzoek).
 *
 * Uitzetten (aan → uit) speelt bewust niets af — dat is precies het punt.
 * Aanzetten (uit → aan) speelt de huidige opname wél meteen eenmalig af,
 * zodat een kind ook met autoplay uit nooit zonder enige audio-referentie
 * zit: gewoon nog eens op het doorgestreepte icoon tikken volstaat.
 */
export function AutoplayToggle({
  text,
  itemId,
  fallbackSpokenText,
  preferredPersona,
  enabled,
  onToggle,
  iconOnly = false,
}: AutoplayToggleProps) {
  function handleClick() {
    if (enabled) {
      onToggle(false);
      return;
    }
    onToggle(true);
    void playWordAudio({ itemId, text, fallbackSpokenText, preferredPersona });
  }

  const accessibleLabel = enabled
    ? "Automatisch afspelen staat aan. Tik om uit te zetten."
    : "Automatisch afspelen staat uit. Tik om aan te zetten en nu te luisteren.";

  // Eén en hetzelfde luidsprekericoon; bij "uit" ligt er een rode,
  // schuine streep overheen (net als een doorgestreept verkeersbord) i.p.v.
  // te wisselen naar een ander emoji — dat blijft op elk lettertype/besturingssysteem consistent zichtbaar.
  const icon = (
    <span className="relative inline-flex h-[1em] w-[1em] items-center justify-center" aria-hidden="true">
      <span>🔊</span>
      {!enabled && <span className="absolute h-[2px] w-[140%] -rotate-45 rounded-full bg-red-600" />}
    </span>
  );

  if (iconOnly) {
    return (
      <Button
        variant={enabled ? "primary" : "secondary"}
        size="icon"
        onClick={handleClick}
        aria-label={accessibleLabel}
        aria-pressed={!enabled}
      >
        {icon}
      </Button>
    );
  }

  return (
    <Button
      variant={enabled ? "primary" : "secondary"}
      onClick={handleClick}
      aria-label={accessibleLabel}
      aria-pressed={!enabled}
      className="flex items-center gap-2"
    >
      {icon}
      {enabled ? "Speelt automatisch af" : "Automatisch afspelen uit"}
    </Button>
  );
}
