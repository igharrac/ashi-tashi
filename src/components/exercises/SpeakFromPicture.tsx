"use client";

import { useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { mockPronunciationProvider } from "@/providers/pronunciation/mockPronunciationProvider";
import { useSpeechCheck } from "@/hooks/useSpeechCheck";
import { useWordSpelling } from "@/hooks/useWordSpelling";

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
 * Wanneer microfoon aanstaat én de browser het ondersteunt, wordt echt
 * geluisterd en vergeleken (useSpeechCheck) i.p.v. blindelings "goed" aan
 * te nemen — zie RepeatAfterMe voor dezelfde aanpak en de beperkingen
 * daarvan (Nederlandse validatie, nog geen Tashelhit-spraakherkenning).
 */
export function SpeakFromPicture({ item, microphoneOptIn, onDone }: SpeakFromPictureProps) {
  const speech = useSpeechCheck(item.translationNl);
  const spelling = useWordSpelling(item.id);
  const [fallbackStatus, setFallbackStatus] = useState<"idle" | "recording" | "feedback">("idle");
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const useRealValidation = microphoneOptIn && speech.isAvailable;

  async function handleFallbackRecord() {
    setFallbackStatus("recording");
    const result = await mockPronunciationProvider.assess({
      learnerAudio: new Blob(),
      expectedText: item.latinSpelling,
      languageCode: "tzm",
    });
    setFallbackMessage(result.feedbackMessageNl);
    setFallbackStatus("feedback");
  }

  const showAnswer = speech.status === "correct" || fallbackStatus === "feedback";

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

      {useRealValidation ? (
        <>
          {speech.status === "idle" && (
            <Button onClick={speech.attempt} className="flex items-center gap-2">
              <span aria-hidden="true">🎙️</span> Neem op
            </Button>
          )}
          {speech.status === "listening" && <p aria-live="polite">Ik luister… zeg het maar!</p>}
          {speech.status === "retry" && (
            <div className="flex flex-col items-center gap-4">
              <p aria-live="polite" className="text-lg font-medium text-clay-500">
                {speech.feedbackMessage}
              </p>
              <div className="flex gap-3">
                <Button onClick={speech.attempt}>Probeer opnieuw</Button>
                {speech.attempts >= 2 && (
                  <Button variant="ghost" onClick={() => onDone(false)}>
                    Later nog eens
                  </Button>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        fallbackStatus === "idle" &&
        (microphoneOptIn ? (
          <Button onClick={handleFallbackRecord} className="flex items-center gap-2">
            <span aria-hidden="true">🎙️</span> Neem op
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-sm text-gray-500">
              Microfoon staat uit. Zeg het woord toch hardop en ga dan verder.
            </p>
            <Button onClick={handleFallbackRecord}>Ik heb het gezegd</Button>
          </div>
        ))
      )}

      {!useRealValidation && fallbackStatus === "recording" && <p aria-live="polite">Even luisteren…</p>}

      {showAnswer && (
        <div className="flex flex-col items-center gap-4">
          <p aria-live="polite" className="text-lg font-medium text-success-500">
            {speech.status === "correct" ? speech.feedbackMessage : fallbackMessage}
          </p>
          <p className="text-sm text-ink-muted">
            Het was: <span className="font-bold text-forest-600">{spelling ?? item.translationNl}</span>
            {spelling && <span className="ml-1">({item.translationNl})</span>}
          </p>
          <Button onClick={() => onDone(true)}>Verder</Button>
        </div>
      )}
    </div>
  );
}
