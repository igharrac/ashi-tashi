"use client";

import type { ReactNode } from "react";

interface NavFlankedRowProps {
  onPrevious?: () => void;
  previousDisabled?: boolean;
  onNext?: () => void;
  children: ReactNode;
}

/**
 * Plaatst de vorige/volgende-navigatie direct naast het belangrijkste
 * beeldelement van een oefening (meestal de foto; bij een los woord in
 * Nazeggen de woordtekst, want daar is geen foto) — zodat de knoppen altijd
 * verticaal gecentreerd blijven op dát element, in plaats van op de hele
 * (wisselend hoge) kolom met feedback/knoppen eronder. Zo blijven ze op hun
 * plek staan ongeacht hoeveel tekst/knoppen er verderop verschijnen (op
 * verzoek, na eerdere versie waarbij de knoppen leken te "verspringen").
 * Rendert kaal (geen extra opmaak) wanneer geen van beide callbacks is
 * meegegeven, bv. in WordDetailModal waar geen navigatie nodig is.
 */
export function NavFlankedRow({ onPrevious, previousDisabled, onNext, children }: NavFlankedRowProps) {
  if (!onPrevious && !onNext) return <>{children}</>;

  const navButtonClass =
    "flex h-12 w-10 shrink-0 items-center justify-center rounded-full text-3xl text-ink-muted transition-colors hover:bg-cream hover:text-clay-500 focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500 disabled:cursor-not-allowed disabled:opacity-30";

  return (
    <div className="flex items-center justify-center gap-1">
      {onPrevious ? (
        <button
          type="button"
          onClick={onPrevious}
          disabled={previousDisabled}
          aria-label="Vorige oefening"
          className={navButtonClass}
        >
          <span aria-hidden="true">‹</span>
        </button>
      ) : (
        <span className="w-10 shrink-0" aria-hidden="true" />
      )}
      {children}
      {onNext ? (
        <button type="button" onClick={onNext} aria-label="Deze oefening overslaan" className={navButtonClass}>
          <span aria-hidden="true">›</span>
        </button>
      ) : (
        <span className="w-10 shrink-0" aria-hidden="true" />
      )}
    </div>
  );
}
