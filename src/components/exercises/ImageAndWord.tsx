"use client";

import { useEffect } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { AutoplayToggle } from "@/components/ui/AutoplayToggle";
import { Button } from "@/components/ui/Button";
import { ReviewNotice } from "@/components/ui/ReviewNotice";
import { playWordAudio } from "@/lib/playWordAudio";
import { useWordSpelling } from "@/hooks/useWordSpelling";
import type { RecordingPersona } from "@/lib/recordableItems";

interface ImageAndWordProps {
  item: VocabularyItemView;
  onDone: () => void;
  preferredPersona?: RecordingPersona | null;
  /** Kindinstelling child.autoplayAudio — bediend via het luidsprekertje (AutoplayToggle.tsx), geldt overal. */
  autoplayAudio: boolean;
  onToggleAutoplayAudio: (enabled: boolean) => void;
}

/**
 * Oefentype "Afbeelding en woord" (hfst. 13.2): toon een afbeelding en
 * speel het bijbehorende woord af. Eén primaire taak (hfst. 7.3): luisteren
 * en doorgaan.
 *
 * Het afspelen zelf is niet langer een verplichte stap vóór "Verder" (dat
 * was de oude hasPlayed-gate) — met autoplay aan klinkt het woord toch al
 * vanzelf zodra deze vraag verschijnt, en met autoplay uit mag een kind
 * gewoon doorgaan zonder alsnog gedwongen te worden een knop in te drukken
 * (hfst. 22: nooit blokkeren).
 */
export function ImageAndWord({ item, onDone, preferredPersona, autoplayAudio, onToggleAutoplayAudio }: ImageAndWordProps) {
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
    // Alleen bij het verschijnen van dit woord (mount, dankzij key={item.id}
    // bij de aanroeper) — niet opnieuw bij elke re-render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div
        role="img"
        aria-label={item.imageAlt}
        className="flex h-40 w-40 items-center justify-center rounded-xl2 bg-primary-50 text-7xl"
      >
        {item.imageEmoji}
      </div>
      <p className="text-2xl font-bold text-primary-600" lang={spelling ? undefined : "nl"}>
        {spelling ?? item.translationNl}
      </p>
      {spelling && (
        <p className="text-sm text-ink-muted" lang="nl">
          {item.translationNl}
        </p>
      )}
      <ReviewNotice note={item.reviewNote ?? "Review vereist"} />
      <div className="flex gap-3">
        <AutoplayToggle
          text={item.latinSpelling}
          itemId={item.id}
          fallbackSpokenText={item.translationNl}
          preferredPersona={preferredPersona}
          enabled={autoplayAudio}
          onToggle={onToggleAutoplayAudio}
        />
        <AudioButton
          text={item.latinSpelling}
          itemId={item.id}
          fallbackSpokenText={item.translationNl}
          preferredPersona={preferredPersona}
          slow
        />
      </div>
      <Button onClick={onDone}>Verder</Button>
    </div>
  );
}
