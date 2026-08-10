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
          className="flex flex-col items-center gap-2 rounded-xl2 border border-border-subtle bg-white p-4 text-center
            shadow-sm transition-transform hover:scale-105 focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span className="text-5xl" aria-hidden="true">
            {item.imageEmoji}
          </span>
          <span className="text-sm font-semibold text-ink">{item.translationNl}</span>
        </button>
      ))}
    </div>
  );
}
