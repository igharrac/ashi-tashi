"use client";

import type { VocabularyItemView } from "@/types/domain";
import { playWordAudio } from "@/lib/playWordAudio";

interface WordGridProps {
  items: VocabularyItemView[];
  onSelect: (item: VocabularyItemView) => void;
}

/**
 * Responsief overzicht van alle woorden ("Ontdekken", hfst. 10) om vrij te
 * browsen los van de gestructureerde lessen. Eén tik op een plaatje speelt
 * meteen het woord af én opent een klein oefenscherm om het zelf na te
 * zeggen (zie WordDetailModal) — bewust één simpel gebaar per plaatje in
 * plaats van aparte "luister"- en "neem op"-knopjes die een kind eerst zou
 * moeten leren onderscheiden.
 */
export function WordGrid({ items, onSelect }: WordGridProps) {
  function handleSelect(item: VocabularyItemView) {
    void playWordAudio({ itemId: item.id, text: item.latinSpelling, fallbackSpokenText: item.translationNl });
    onSelect(item);
  }

  if (items.length === 0) {
    return <p className="text-center text-ink-muted">Hier komen binnenkort woorden te staan.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => handleSelect(item)}
          aria-label={`${item.translationNl} — luister en zeg na`}
          className="group flex flex-col items-center gap-1.5 rounded-xl2 p-1 text-center transition-transform
            hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          {/* Het plaatje zelf is het volledige, enige klikdoel — de mic-badge
              staat er altijd (niet pas bij hover) overheen, want op een
              tablet/telefoon bestaat geen hover-status voor een kind om te
              zien. Bij hover/focus (muis) wordt 'm iets nadrukkelijker. */}
          <span className="relative flex h-20 w-20 items-center justify-center rounded-full bg-mint-100 text-4xl sm:h-24 sm:w-24 sm:text-5xl">
            <span aria-hidden="true">{item.imageEmoji}</span>
            <span
              aria-hidden="true"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full
                bg-clay-500 text-sm text-white shadow-sm transition-transform group-hover:scale-110 group-focus-visible:scale-110"
            >
              🎤
            </span>
          </span>
          <span className="text-sm font-semibold text-ink">{item.translationNl}</span>
        </button>
      ))}
    </div>
  );
}
