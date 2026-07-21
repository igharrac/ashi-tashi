"use client";

import { useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { mockPronunciationProvider } from "@/providers/pronunciation/mockPronunciationProvider";

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
 */
export function RepeatAfterMe({ item, microphoneOptIn, onDone }: RepeatAfterMeProps) {
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
      <p className="text-lg font-medium text-gray-700">
        {item.itemKind === "zin" ? "Zeg de zin na:" : "Zeg het woord na:"}
      </p>
      <p className="text-2xl font-bold text-primary-600">{item.translationNl}</p>
      <AudioButton text={item.latinSpelling} fallbackSpokenText={item.translationNl} label="Luister nog eens" />

      {status === "idle" &&
        (microphoneOptIn ? (
          <Button onClick={handleRecord} className="flex items-center gap-2">
            <span aria-hidden="true">🎙️</span> Neem op
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-sm text-gray-500">
              Microfoon staat uit. Je kunt het woord toch hardop zeggen en dan verdergaan.
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
          <Button onClick={handleContinue}>Verder</Button>
        </div>
      )}
    </div>
  );
}
