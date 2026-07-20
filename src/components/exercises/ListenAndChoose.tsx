"use client";

import { useMemo, useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";

interface ListenAndChooseProps {
  item: VocabularyItemView;
  distractors: VocabularyItemView[];
  onAnswer: (isCorrect: boolean) => void;
}

function shuffle<T>(items: T[]): T[] {
  return [...items].sort(() => Math.random() - 0.5);
}

/**
 * Oefentype "Luisteren en herkennen" (hfst. 13.1): speel een woord af,
 * laat het kind de juiste afbeelding kiezen tussen enkele opties.
 * Eén keuze tegelijk, grote tapbare kaarten (hfst. 9).
 */
export function ListenAndChoose({ item, distractors, onAnswer }: ListenAndChooseProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const options = useMemo(() => shuffle([item, ...distractors.slice(0, 2)]), [item, distractors]);

  function handleChoose(optionId: string) {
    if (selectedId) return; // voorkom dubbel antwoorden
    setSelectedId(optionId);
    const isCorrect = optionId === item.id;
    window.setTimeout(() => onAnswer(isCorrect), 700);
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-lg font-medium text-gray-700">Welk plaatje hoort bij dit woord?</p>
      <AudioButton text={item.latinSpelling} label="Speel het woord af" />
      <div className="grid grid-cols-3 gap-4" role="group" aria-label="Kies de juiste afbeelding">
        {options.map((option) => {
          const isSelected = selectedId === option.id;
          const isCorrectOption = option.id === item.id;
          const showFeedback = selectedId !== null && (isSelected || isCorrectOption);
          return (
            <button
              key={option.id}
              type="button"
              onClick={() => handleChoose(option.id)}
              aria-label={option.imageAlt}
              disabled={selectedId !== null}
              className={`flex h-28 w-28 items-center justify-center rounded-xl2 border-4 text-5xl transition-colors
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500
                ${
                  showFeedback
                    ? isCorrectOption
                      ? "border-success-500 bg-green-50"
                      : "border-red-300 bg-red-50"
                    : "border-primary-100 bg-white hover:border-primary-400"
                }`}
            >
              {option.imageEmoji}
            </button>
          );
        })}
      </div>
    </div>
  );
}
