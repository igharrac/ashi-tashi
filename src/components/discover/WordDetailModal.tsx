"use client";

import { useEffect } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { ListenAndSpeak } from "@/components/exercises/ListenAndSpeak";
import type { RecordingPersona } from "@/lib/recordableItems";

interface WordDetailModalProps {
  /** Alle woorden van het grid, zodat er zonder sluiten doorheen gebladerd kan worden. */
  items: VocabularyItemView[];
  currentIndex: number;
  childId: string;
  microphoneOptIn: boolean;
  onNavigate: (index: number) => void;
  onClose: () => void;
  preferredPersona?: RecordingPersona | null;
  /** Standaard aan (kindinstelling): klaar na 3x inspreken, ongeacht of het matchte. Zie pronunciationLeniency.ts. */
  lenientPronunciationMode?: boolean;
  /** Kindinstelling child.autoplayAudio — doorgegeven aan ListenAndSpeak, geldt overal (ook hier in Ontdekken). */
  autoplayAudio: boolean;
  onToggleAutoplayAudio: (enabled: boolean) => void;
}

/**
 * Vrij oefenen op één woord vanuit het "Ontdekken"-grid (WordGrid.tsx) —
 * hergebruikt dezelfde luister/opnemen/vergelijk-flow als in de lessen
 * (ListenAndSpeak, inclusief de live microfoon-indicator en escape-knop),
 * maar los van lesvolgorde of score. Vorige/volgende-pijltjes laten je door
 * alle woorden bladeren zonder tussendoor te hoeven sluiten en opnieuw een
 * plaatje aan te tikken. `key={item.id}` op <ListenAndSpeak> zorgt dat de
 * opname-/feedbackstatus bij elke navigatie schoon begint (geen "bijna!"
 * van het vorige woord dat blijft hangen op het volgende).
 */
export function WordDetailModal({
  items,
  currentIndex,
  childId,
  microphoneOptIn,
  onNavigate,
  onClose,
  preferredPersona,
  lenientPronunciationMode,
  autoplayAudio,
  onToggleAutoplayAudio,
}: WordDetailModalProps) {
  const item = items[currentIndex];
  const hasPrevious = currentIndex > 0;
  const hasNext = currentIndex < items.length - 1;

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft" && hasPrevious) onNavigate(currentIndex - 1);
      if (event.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
    }
    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, [onClose, onNavigate, currentIndex, hasPrevious, hasNext]);

  if (!item) return null;

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

        {hasPrevious && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex - 1)}
            aria-label="Vorig woord"
            className="absolute left-0 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center
              rounded-full bg-white text-xl text-ink-muted shadow-sm hover:bg-cream
              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
          >
            <span aria-hidden="true">‹</span>
          </button>
        )}
        {hasNext && (
          <button
            type="button"
            onClick={() => onNavigate(currentIndex + 1)}
            aria-label="Volgend woord"
            className="absolute right-0 top-1/2 flex h-10 w-10 translate-x-1/2 -translate-y-1/2 items-center justify-center
              rounded-full bg-white text-xl text-ink-muted shadow-sm hover:bg-cream
              focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
          >
            <span aria-hidden="true">›</span>
          </button>
        )}

        <ListenAndSpeak
          key={item.id}
          item={item}
          childId={childId}
          microphoneOptIn={microphoneOptIn}
          onDone={onClose}
          preferredPersona={preferredPersona}
          lenientPronunciationMode={lenientPronunciationMode}
          autoplayAudio={autoplayAudio}
          onToggleAutoplayAudio={onToggleAutoplayAudio}
        />
      </div>
    </div>
  );
}
