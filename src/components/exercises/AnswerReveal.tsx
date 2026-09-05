"use client";

import { useEffect } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { playWordAudio } from "@/lib/playWordAudio";
import { useWordSpelling } from "@/hooks/useWordSpelling";
import type { RecordingPersona } from "@/lib/recordableItems";

interface AnswerRevealProps {
  item: VocabularyItemView;
  onContinue: () => void;
  preferredPersona?: RecordingPersona | null;
  /** Kindinstelling child.autoplayAudio (zie SettingsPanelContent.tsx) — bepaalt of het antwoord vanzelf klinkt zodra dit verschijnt; handmatig nog eens horen kan via de knop hieronder. */
  autoplayAudio: boolean;
}

/**
 * Compacte antwoord-weergave voor spraakoefeningen die niet lukken (hfst.
 * 22: een kind mag nooit vastlopen) — toont het woord + vertaling meteen
 * (op verzoek geen aparte "ik weet het niet"-knop meer, dat voelde als een
 * onnodige extra stap) en laat het kind gewoon door. Telt mee als "nog niet
 * gelukt" (komt aan het eind van de les terug, hfst. 13.13) i.p.v.
 * stiekem als "goed".
 */
export function AnswerReveal({ item, onContinue, preferredPersona, autoplayAudio }: AnswerRevealProps) {
  const spelling = useWordSpelling(item.id);

  useEffect(() => {
    if (autoplayAudio) {
      void playWordAudio({
        itemId: item.id,
        text: item.latinSpelling,
        fallbackSpokenText: item.translationNl,
        preferredPersona,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <p className="text-base font-semibold text-forest-600">{spelling ?? item.translationNl}</p>
        {spelling && <p className="text-sm text-ink-muted">({item.translationNl})</p>}
        <AudioButton
          text={item.latinSpelling}
          itemId={item.id}
          fallbackSpokenText={item.translationNl}
          preferredPersona={preferredPersona}
          iconOnly
        />
      </div>
      <Button onClick={onContinue}>Verder</Button>
    </div>
  );
}
