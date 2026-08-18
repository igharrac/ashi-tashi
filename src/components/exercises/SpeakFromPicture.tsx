"use client";

import { useEffect, useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { Button } from "@/components/ui/Button";
import { MicLevelIndicator } from "@/components/ui/MicLevelIndicator";
import { mockPronunciationProvider } from "@/providers/pronunciation/mockPronunciationProvider";
import { useSpeechCheck } from "@/hooks/useSpeechCheck";
import { useWordSpelling } from "@/hooks/useWordSpelling";
import type { RecordingPersona } from "@/lib/recordableItems";
import { LENIENT_PRONUNCIATION_ATTEMPTS } from "@/domain/pronunciationLeniency";
import { playSuccessChime } from "@/lib/playSuccessChime";
import { AttemptStars } from "./AttemptStars";
import { AnswerReveal } from "./AnswerReveal";

interface SpeakFromPictureProps {
  item: VocabularyItemView;
  microphoneOptIn: boolean;
  onDone: (isCorrect: boolean) => void;
  preferredPersona?: RecordingPersona | null;
  /** Standaard aan (kindinstelling): klaar na 3x inspreken, ongeacht of het matchte. Zie pronunciationLeniency.ts. */
  lenientPronunciationMode?: boolean;
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
export function SpeakFromPicture({
  item,
  microphoneOptIn,
  onDone,
  preferredPersona,
  lenientPronunciationMode = true,
}: SpeakFromPictureProps) {
  const speech = useSpeechCheck(
    item.translationNl,
    lenientPronunciationMode ? { passAfterAttempts: LENIENT_PRONUNCIATION_ATTEMPTS } : undefined,
  );
  const spelling = useWordSpelling(item.id);
  const [fallbackStatus, setFallbackStatus] = useState<"idle" | "recording" | "feedback">("idle");
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const useRealValidation = microphoneOptIn && speech.isAvailable;

  // Vrolijk geluidje zodra de oefening klaar is — precies één keer per
  // afronding (hfst. 22: duidelijk positief signaal i.p.v. een getal).
  useEffect(() => {
    if (speech.status === "correct") playSuccessChime();
  }, [speech.status]);
  useEffect(() => {
    if (fallbackStatus === "feedback") playSuccessChime();
  }, [fallbackStatus]);

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
          {speech.status === "listening" && (
            <div className="flex flex-col items-center gap-2">
              <p aria-live="polite">Ik luister… zeg het maar!</p>
              <MicLevelIndicator active />
            </div>
          )}
          {lenientPronunciationMode && speech.attempts > 0 && speech.status !== "listening" && (
            <AttemptStars attempts={speech.attempts} total={LENIENT_PRONUNCIATION_ATTEMPTS} />
          )}
          {speech.status === "retry" && (
            <div className="flex flex-col items-center gap-4">
              <p
                aria-live="polite"
                className={`text-lg font-medium ${lenientPronunciationMode ? "text-forest-600" : "text-clay-500"}`}
              >
                {speech.feedbackMessage}
              </p>
              <Button onClick={speech.attempt}>{lenientPronunciationMode ? "Nog een keer" : "Probeer opnieuw"}</Button>
              <AnswerReveal item={item} onContinue={() => onDone(false)} preferredPersona={preferredPersona} />
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
          {speech.status === "correct" && lenientPronunciationMode && (
            <AttemptStars attempts={LENIENT_PRONUNCIATION_ATTEMPTS} total={LENIENT_PRONUNCIATION_ATTEMPTS} />
          )}
          <p aria-hidden="true" className="text-4xl">
            🎉
          </p>
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
