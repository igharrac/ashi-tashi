"use client";

import { useEffect, useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
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

interface RepeatAfterMeProps {
  item: VocabularyItemView;
  microphoneOptIn: boolean;
  onDone: (isCorrect: boolean) => void;
  preferredPersona?: RecordingPersona | null;
  /** Standaard aan (kindinstelling): klaar na 3x inspreken, ongeacht of het matchte. Zie pronunciationLeniency.ts. */
  lenientPronunciationMode?: boolean;
}

/**
 * Oefentype "Nazeggen" (hfst. 13.6). Microfoon is optioneel (hfst. 23, 30):
 * als de ouder geen microfoontoestemming heeft gegeven, kan het kind de
 * les toch afronden zonder blokkade — met een simpele "ik heb het gezegd"
 * bevestiging in plaats van opname.
 *
 * Wanneer microfoon wél aanstaat én de browser het ondersteunt, wordt echt
 * geluisterd en vergeleken (useSpeechCheck) i.p.v. blindelings "goed"
 * aan te nemen: bij een mismatch krijgt het kind vriendelijke
 * "probeer nog eens"-feedback, nooit een harde afkeuring (hfst. 22).
 */
export function RepeatAfterMe({
  item,
  microphoneOptIn,
  onDone,
  preferredPersona,
  lenientPronunciationMode = true,
}: RepeatAfterMeProps) {
  const speech = useSpeechCheck(
    item.translationNl,
    lenientPronunciationMode ? { passAfterAttempts: LENIENT_PRONUNCIATION_ATTEMPTS } : undefined,
  );
  const spelling = useWordSpelling(item.id);
  const [fallbackStatus, setFallbackStatus] = useState<"idle" | "recording" | "feedback">("idle");
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const useRealValidation = microphoneOptIn && speech.isAvailable;

  // Vrolijk geluidje zodra de oefening klaar is — precies één keer per
  // afronding, niet bij elke re-render (hfst. 22: duidelijk positief
  // signaal i.p.v. een getal).
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

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      {item.itemKind === "zin" &&
        (item.pictogramUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- extern ARASAAC-plaatje (CC BY-NC-SA), geen lokale kopie, dus geen next/image-optimalisatie mogelijk
          <img
            src={item.pictogramUrl}
            alt={item.imageAlt}
            className="h-32 w-32 rounded-xl2 bg-primary-50 object-contain p-2"
            onError={(event) => {
              // Als het externe plaatje ooit niet laadt, valt het kind
              // meteen terug op de emoji i.p.v. een kapot plaatje te zien —
              // mag nergens vastlopen.
              event.currentTarget.style.display = "none";
              const fallback = event.currentTarget.nextElementSibling as HTMLElement | null;
              if (fallback) fallback.style.display = "flex";
            }}
          />
        ) : null)}
      {item.itemKind === "zin" && (
        <div
          role="img"
          aria-label={item.imageAlt}
          className="flex h-32 w-32 items-center justify-center rounded-xl2 bg-primary-50 text-6xl"
          style={item.pictogramUrl ? { display: "none" } : undefined}
        >
          {item.imageEmoji}
        </div>
      )}
      <p className="text-lg font-medium text-gray-700">
        {item.contextNl ?? (item.itemKind === "zin" ? "Zeg de zin na:" : "Zeg het woord na:")}
      </p>
      <p className="text-2xl font-bold text-primary-600">{spelling ?? item.translationNl}</p>
      {spelling && <p className="text-sm text-ink-muted">{item.translationNl}</p>}

      {useRealValidation ? (
        <>
          {(speech.status === "idle" || speech.status === "retry") && (
            <div className="flex flex-col items-center gap-4">
              {/* Twee gelijkwaardige, altijd beschikbare keuzes i.p.v. één
                  primaire "Neem op"-knop — afspelen mag zo vaak als nodig,
                  ook vóór poging 2 en 3. */}
              <div className="flex flex-row items-center justify-center gap-4">
                <AudioButton
                  text={item.latinSpelling}
                  itemId={item.id}
                  fallbackSpokenText={item.translationNl}
                  preferredPersona={preferredPersona}
                  label="Afspelen"
                  iconOnly
                />
                <Button onClick={speech.attempt} className="flex items-center gap-2">
                  <span aria-hidden="true">🎙️</span> Zeg het woord
                </Button>
              </div>
              {lenientPronunciationMode && speech.attempts > 0 && (
                <AttemptStars attempts={speech.attempts} total={LENIENT_PRONUNCIATION_ATTEMPTS} />
              )}
              {speech.status === "retry" && (
                <>
                  <p
                    aria-live="polite"
                    className={`text-lg font-medium ${lenientPronunciationMode ? "text-forest-600" : "text-clay-500"}`}
                  >
                    {speech.feedbackMessage}
                  </p>
                  <AnswerReveal item={item} onContinue={() => onDone(false)} preferredPersona={preferredPersona} />
                </>
              )}
            </div>
          )}
          {speech.status === "listening" && (
            <div className="flex flex-col items-center gap-2">
              <p aria-live="polite">Ik luister… zeg het maar!</p>
              <MicLevelIndicator active />
            </div>
          )}
          {speech.status === "correct" && (
            <div className="flex flex-col items-center gap-4">
              {lenientPronunciationMode && (
                <AttemptStars attempts={LENIENT_PRONUNCIATION_ATTEMPTS} total={LENIENT_PRONUNCIATION_ATTEMPTS} />
              )}
              <p aria-hidden="true" className="text-4xl">
                🎉
              </p>
              <p aria-live="polite" className="text-lg font-medium text-success-500">
                {speech.feedbackMessage}
              </p>
              <Button onClick={() => onDone(true)}>Verder</Button>
            </div>
          )}
        </>
      ) : (
        <>
          {fallbackStatus === "idle" &&
            (microphoneOptIn ? (
              <Button onClick={handleFallbackRecord} className="flex items-center gap-2">
                <span aria-hidden="true">🎙️</span> Neem op
              </Button>
            ) : (
              <div className="flex flex-col items-center gap-3">
                <p className="max-w-xs text-sm text-gray-500">
                  Microfoon staat uit. Je kunt het woord toch hardop zeggen en dan verdergaan.
                </p>
                <Button onClick={handleFallbackRecord}>Ik heb het gezegd</Button>
              </div>
            ))}
          {fallbackStatus === "recording" && <p aria-live="polite">Even luisteren…</p>}
          {fallbackStatus === "feedback" && (
            <div className="flex flex-col items-center gap-4">
              <p aria-live="polite" className="text-lg font-medium text-success-500">
                {fallbackMessage}
              </p>
              <Button onClick={() => onDone(true)}>Verder</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
