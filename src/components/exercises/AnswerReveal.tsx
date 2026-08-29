"use client";

import { useEffect, useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AutoplayToggle } from "@/components/ui/AutoplayToggle";
import { Button } from "@/components/ui/Button";
import { playWordAudio } from "@/lib/playWordAudio";
import { useWordSpelling } from "@/hooks/useWordSpelling";
import type { RecordingPersona } from "@/lib/recordableItems";

interface AnswerRevealProps {
  item: VocabularyItemView;
  onContinue: () => void;
  preferredPersona?: RecordingPersona | null;
  /** Kindinstelling child.autoplayAudio — bediend via het luidsprekertje (AutoplayToggle.tsx), geldt overal. */
  autoplayAudio: boolean;
  onToggleAutoplayAudio: (enabled: boolean) => void;
}

/**
 * Escape-knop voor spraakoefeningen die niet lukken (hfst. 22: een kind mag
 * nooit vastlopen). Toont het antwoord — fonetische spelling (of Nederlands
 * zolang die er nog niet is) + de audio — en laat het kind gewoon door.
 * Telt mee als "nog niet gelukt" (komt aan het eind van de les terug,
 * hfst. 13.13) i.p.v. stiekem als "goed".
 */
export function AnswerReveal({ item, onContinue, preferredPersona, autoplayAudio, onToggleAutoplayAudio }: AnswerRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const spelling = useWordSpelling(item.id);

  // Zodra het antwoord onthuld wordt, telt dat als "nieuwe audio die
  // verschijnt" (net als een nieuwe vraag/plaatje) — dus ook hier geldt de
  // autoplay-instelling (AutoplayToggle.tsx, op verzoek: "overal").
  useEffect(() => {
    if (revealed && autoplayAudio) {
      void playWordAudio({
        itemId: item.id,
        text: item.latinSpelling,
        fallbackSpokenText: item.translationNl,
        preferredPersona,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  if (!revealed) {
    return (
      <Button variant="ghost" size="sm" onClick={() => setRevealed(true)}>
        Ik weet het niet — laat het antwoord zien
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 bg-mint-100/40 p-4">
      <p className="text-sm text-ink-muted">Het antwoord:</p>
      <p className="text-xl font-bold text-forest-600">{spelling ?? item.translationNl}</p>
      {spelling && <p className="text-sm text-ink-muted">{item.translationNl}</p>}
      <AutoplayToggle
        text={item.latinSpelling}
        itemId={item.id}
        fallbackSpokenText={item.translationNl}
        preferredPersona={preferredPersona}
        enabled={autoplayAudio}
        onToggle={onToggleAutoplayAudio}
      />
      <Button onClick={onContinue}>Verder</Button>
    </div>
  );
}
