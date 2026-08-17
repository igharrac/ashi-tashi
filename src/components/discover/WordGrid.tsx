"use client";

import type { VocabularyItemView } from "@/types/domain";

interface WordGridProps {
  items: VocabularyItemView[];
  /** Index binnen `items` van het aangetikte woord, i.p.v. alleen het item zelf — zo kan de aanroeper vorige/volgende bepalen. */
  onSelect: (index: number) => void;
}

/**
 * Responsief overzicht van alle woorden ("Ontdekken", hfst. 10) om vrij te
 * browsen los van de gestructureerde lessen. Tikken op een plaatje speelt
 * bewust GEEN geluid af — dat gebeurt pas via de expliciete knop in het
 * oefenscherm dat opent (WordDetailModal/ListenAndSpeak), zodat het kind
 * zelf de regie heeft over wanneer het geluid komt.
 */
export function WordGrid({ items, onSelect }: WordGridProps) {
  if (items.length === 0) {
    return <p className="text-center text-ink-muted">Hier komen binnenkort woorden te staan.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onSelect(index)}
          aria-label={`${item.translationNl} — oefenen`}
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
