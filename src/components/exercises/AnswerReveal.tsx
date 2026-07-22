"use client";

import { useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { useWordSpelling } from "@/hooks/useWordSpelling";

interface AnswerRevealProps {
  item: VocabularyItemView;
  onContinue: () => void;
}

/**
 * Escape-knop voor spraakoefeningen die niet lukken (hfst. 22: een kind mag
 * nooit vastlopen). Toont het antwoord — fonetische spelling (of Nederlands
 * zolang die er nog niet is) + de audio — en laat het kind gewoon door.
 * Telt mee als "nog niet gelukt" (komt aan het eind van de les terug,
 * hfst. 13.13) i.p.v. stiekem als "goed".
 */
export function AnswerReveal({ item, onContinue }: AnswerRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const spelling = useWordSpelling(item.id);

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
      <AudioButton
        text={item.latinSpelling}
        itemId={item.id}
        fallbackSpokenText={item.translationNl}
        label="Beluister het antwoord"
      />
      <Button onClick={onContinue}>Verder</Button>
    </div>
  );
}
