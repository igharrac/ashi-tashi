"use client";

import { useEffect } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { ReviewNotice } from "@/components/ui/ReviewNotice";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { playWordAudio } from "@/lib/playWordAudio";
import { useWordSpelling } from "@/hooks/useWordSpelling";
import type { RecordingPersona } from "@/lib/recordableItems";

interface ImageAndWordProps {
  item: VocabularyItemView;
  onDone: () => void;
  preferredPersona?: RecordingPersona | null;
  /** Kindinstelling child.autoplayAudio (zie SettingsPanelContent.tsx), geldt overal. */
  autoplayAudio: boolean;
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
export function ImageAndWord({ item, onDone, preferredPersona, autoplayAudio }: ImageAndWordProps) {
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
      <ZoomableImage pictogramUrl={item.pictogramUrl} emoji={item.imageEmoji} alt={item.imageAlt} sizeClassName="h-40 w-40 text-7xl" />
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
        <AudioButton
          text={item.latinSpelling}
          itemId={item.id}
          fallbackSpokenText={item.translationNl}
          preferredPersona={preferredPersona}
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
