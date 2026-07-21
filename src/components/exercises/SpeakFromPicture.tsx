"use client";

import { useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { mockPronunciationProvider } from "@/providers/pronunciation/mockPronunciationProvider";

interface SpeakFromPictureProps {
  item: VocabularyItemView;
  microphoneOptIn: boolean;
  onDone: (isCorrect: boolean) => void;
}

/**
 * Oefentype "Zelfstandig spreken" (hfst. 13.11): laat een plaatje zien en
 * vraag het kind het woord zelf in te spreken, zonder het eerst te horen
 * (in tegenstelling tot <RepeatAfterMe>, waar het woord wordt voorgezegd).
 * Dit is de laatste, actiefste stap van de opbouw uit hoofdstuk 14.
 *
 * Bewust geen tekst met de vertaling zichtbaar — dat zou het "zelf
 * herinneren" ondermijnen. Net als bij nazeggen is de microfoon optioneel
 * (hfst. 23, 30) en blokkeert een geweigerde microfoon de les niet.
 */
export function SpeakFromPicture({ item, microphoneOptIn, onDone }: SpeakFromPictureProps) {
  const [status, setStatus] = useState<"idle" | "recording" | "feedback">("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  async function handleRecord() {
    setStatus("recording");
    const result = await mockPronunciationProvider.assess({
      learnerAudio: new Blob(),
      expectedText: item.latinSpelling,
      languageCode: "tzm",
    });
    setFeedbackMessage(result.feedbackMessageNl);
    setStatus("feedback");
  }

  function handleContinue() {
    onDone(true); // mock-feedback is altijd positief; zie hfst. 22 — geen harde beoordeling
  }

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <div
        role="img"
        aria-label={item.imageAlt}
        className="flex h-40 w-40 items-center justify-center rounded-xl2 bg-primary-50 text-7xl"
      >
        {item.imageEmoji}
      </div>
      <p className="text-lg font-medium text-gray-700">Wat zie je? Zeg het hardop!</p>

      {status === "idle" &&
        (microphoneOptIn ? (
          <Button onClick={handleRecord} className="flex items-center gap-2">
            <span aria-hidden="true">🎙️</span> Neem op
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-sm text-gray-500">
              Microfoon staat uit. Zeg het woord toch hardop en ga dan verder.
            </p>
            <Button onClick={handleRecord}>Ik heb het gezegd</Button>
          </div>
        ))}

      {status === "recording" && <p aria-live="polite">Even luisteren…</p>}

      {status === "feedback" && (
        <div className="flex flex-col items-center gap-4">
          <p aria-live="polite" className="text-lg font-medium text-success-500">
            {feedbackMessage}
          </p>
          <p className="text-sm text-ink-muted">
            Het was: <span className="font-bold text-forest-600">{item.translationNl}</span>
          </p>
          <Button onClick={handleContinue}>Verder</Button>
        </div>
      )}
    </div>
  );
}
