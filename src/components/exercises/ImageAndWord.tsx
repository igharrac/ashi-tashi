"use client";

import { useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { ReviewNotice } from "@/components/ui/ReviewNotice";
import { useWordSpelling } from "@/hooks/useWordSpelling";

interface ImageAndWordProps {
  item: VocabularyItemView;
  onDone: () => void;
}

/**
 * Oefentype "Afbeelding en woord" (hfst. 13.2): toon een afbeelding en
 * speel het bijbehorende woord af. Eén primaire taak (hfst. 7.3): luisteren
 * en doorgaan.
 */
export function ImageAndWord({ item, onDone }: ImageAndWordProps) {
  const [hasPlayed, setHasPlayed] = useState(false);
  const spelling = useWordSpelling(item.id);

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
        <AudioButton
          text={item.latinSpelling}
          itemId={item.id}
          fallbackSpokenText={item.translationNl}
          onPlayed={() => setHasPlayed(true)}
        />
        <AudioButton
          text={item.latinSpelling}
          itemId={item.id}
          fallbackSpokenText={item.translationNl}
          slow
          onPlayed={() => setHasPlayed(true)}
        />
      </div>
      <Button onClick={onDone} disabled={!hasPlayed}>
        Verder
      </Button>
    </div>
  );
}
