"use client";

import { useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { mockPronunciationProvider } from "@/providers/pronunciation/mockPronunciationProvider";
import { useSpeechCheck } from "@/hooks/useSpeechCheck";

interface RepeatAfterMeProps {
  item: VocabularyItemView;
  microphoneOptIn: boolean;
  onDone: (isCorrect: boolean) => void;
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
export function RepeatAfterMe({ item, microphoneOptIn, onDone }: RepeatAfterMeProps) {
  const speech = useSpeechCheck(item.translationNl);
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

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-lg font-medium text-gray-700">
        {item.itemKind === "zin" ? "Zeg de zin na:" : "Zeg het woord na:"}
      </p>
      <p className="text-2xl font-bold text-primary-600">{item.translationNl}</p>
      <AudioButton text={item.latinSpelling} fallbackSpokenText={item.translationNl} label="Luister nog eens" />

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
          {speech.status === "correct" && (
            <div className="flex flex-col items-center gap-4">
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
