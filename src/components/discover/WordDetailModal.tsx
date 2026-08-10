"use client";

import { useEffect } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { ListenAndSpeak } from "@/components/exercises/ListenAndSpeak";

interface WordDetailModalProps {
  item: VocabularyItemView;
  childId: string;
  microphoneOptIn: boolean;
  onClose: () => void;
}

/**
 * Vrij oefenen op één woord vanuit het "Ontdekken"-grid (WordGrid.tsx) —
 * hergebruikt dezelfde luister/opnemen/vergelijk-flow als in de lessen
 * (ListenAndSpeak, inclusief de live microfoon-indicator en escape-knop),
 * maar los van lesvolgorde of score: een woord uitkiezen, oefenen, en
 * sluiten wanneer je wilt.
 */
export function WordDetailModal({ item, childId, microphoneOptIn, onClose }: WordDetailModalProps) {
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-ink/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`Oefen het woord ${item.translationNl}`}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-sm rounded-xl2 bg-white p-6 shadow-soft"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Sluiten"
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full text-xl text-ink-muted
            hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span aria-hidden="true">×</span>
        </button>
        <ListenAndSpeak item={item} childId={childId} microphoneOptIn={microphoneOptIn} onDone={onClose} />
      </div>
    </div>
  );
}
