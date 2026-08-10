"use client";

import { useEffect, useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { playWordAudio } from "@/lib/playWordAudio";
import { shuffleArray } from "@/domain/matchGame";
import { Button } from "@/components/ui/Button";

interface MatchGameProps {
  /** Items voor dit ene rondje (al gekozen door de aanroepende pagina, zie ontdekken/spel/page.tsx). */
  items: VocabularyItemView[];
  onPlayAgain: () => void;
}

interface SelectionState {
  pictureId: string | null;
  soundId: string | null;
}

/**
 * "Match het geluid" (hfst. 10) — bewust GEEN klassiek geheugenspel met
 * omgedraaide kaartjes: op uitdrukkelijk verzoek staat alles meteen
 * zichtbaar. Het kind tikt in willekeurige volgorde een plaatje én een
 * geluidsknopje aan (beide mogen als eerste) en probeert ze te matchen.
 * Geen score, geen tijdsdruk, geen teller van foute pogingen (hfst. 22) —
 * bij een mismatch hoor je het geluid nog eens en probeer je gewoon opnieuw.
 */
export function MatchGame({ items, onPlayAgain }: MatchGameProps) {
  const [soundOrder] = useState(() => shuffleArray(items));
  const [selection, setSelection] = useState<SelectionState>({ pictureId: null, soundId: null });
  const [matchedIds, setMatchedIds] = useState<Set<string>>(new Set());
  const [isMismatchPending, setIsMismatchPending] = useState(false);

  const isComplete = items.length > 0 && matchedIds.size === items.length;

  useEffect(() => {
    if (!selection.pictureId || !selection.soundId) return;

    if (selection.pictureId === selection.soundId) {
      const matchedId = selection.pictureId;
      setMatchedIds((prev) => new Set(prev).add(matchedId));
      setSelection({ pictureId: null, soundId: null });
      return;
    }

    setIsMismatchPending(true);
    const timeout = window.setTimeout(() => {
      setIsMismatchPending(false);
      setSelection({ pictureId: null, soundId: null });
    }, 700);
    return () => window.clearTimeout(timeout);
  }, [selection]);

  function handlePictureTap(item: VocabularyItemView) {
    if (matchedIds.has(item.id) || isMismatchPending) return;
    setSelection((prev) => ({ ...prev, pictureId: item.id }));
  }

  function handleSoundTap(item: VocabularyItemView) {
    if (matchedIds.has(item.id) || isMismatchPending) return;
    void playWordAudio({ itemId: item.id, text: item.latinSpelling, fallbackSpokenText: item.translationNl });
    setSelection((prev) => ({ ...prev, soundId: item.id }));
  }

  if (isComplete) {
    return (
      <div className="flex flex-col items-center gap-4 py-10 text-center">
        <p className="text-5xl" aria-hidden="true">
          🎉
        </p>
        <p className="text-xl font-bold text-forest-500">Alle woorden gevonden!</p>
        <Button onClick={onPlayAgain}>Nog een rondje</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <section>
        <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-ink-muted">Plaatjes</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {items.map((item) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selection.pictureId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePictureTap(item)}
                disabled={isMatched}
                aria-label={item.translationNl}
                aria-pressed={isSelected}
                className={`flex h-20 w-20 items-center justify-center rounded-full text-4xl transition-all
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500 sm:h-24 sm:w-24 sm:text-5xl
                  ${
                    isMatched
                      ? "bg-mint-100/40 opacity-30"
                      : isSelected
                        ? "bg-forest-100 ring-4 ring-forest-500"
                        : "bg-mint-100 hover:scale-105"
                  }`}
              >
                <span aria-hidden="true">{isMatched ? "✅" : item.imageEmoji}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-3 text-center text-sm font-bold uppercase tracking-wide text-ink-muted">Geluiden</h2>
        <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
          {soundOrder.map((item, i) => {
            const isMatched = matchedIds.has(item.id);
            const isSelected = selection.soundId === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSoundTap(item)}
                disabled={isMatched}
                aria-label={`Geluid ${i + 1}, tik om af te spelen`}
                aria-pressed={isSelected}
                className={`flex h-20 w-20 flex-col items-center justify-center gap-0.5 rounded-full text-2xl transition-all
                  focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500 sm:h-24 sm:w-24
                  ${
                    isMatched
                      ? "bg-peach-100/40 opacity-30"
                      : isSelected
                        ? "bg-clay-400 text-white ring-4 ring-clay-500"
                        : "bg-peach-100 hover:scale-105"
                  }`}
              >
                <span aria-hidden="true">{isMatched ? "✅" : "🔊"}</span>
                {!isMatched && <span className="text-xs font-bold">{i + 1}</span>}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
}
