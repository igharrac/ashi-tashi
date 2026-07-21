"use client";

import { useCallback, useState } from "react";
import { isSpeechRecognitionAvailable, listenAndTranscribe } from "@/providers/pronunciation/browserSpeechRecognition";
import { isSpeechMatch } from "@/domain/speechMatch";

const CORRECT_MESSAGES = ["Dat was duidelijk te verstaan!", "Heel goed gedaan!", "Precies goed!"];
const RETRY_MESSAGES = [
  "Bijna! Probeer het nog eens.",
  "Goed geprobeerd — nog een keertje?",
  "Luister nog eens en probeer opnieuw.",
];

function pick(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)] ?? messages[0]!;
}

export type SpeechCheckStatus = "idle" | "listening" | "correct" | "retry";

interface UseSpeechCheckResult {
  status: SpeechCheckStatus;
  feedbackMessage: string | null;
  attempts: number;
  isAvailable: boolean;
  attempt: () => Promise<void>;
}

/**
 * Neemt daadwerkelijk op wat het kind zegt (via de browser Web Speech API)
 * en vergelijkt dat met de verwachte tekst — in plaats van een knop die
 * blindelings "goed" aanneemt. Bij een mismatch: vriendelijke "probeer nog
 * eens"-feedback, geen harde afkeuring (hfst. 22).
 *
 * Gebruik `isAvailable` om te bepalen of deze echte validatie mogelijk is
 * in de huidige browser; zo niet, val terug op een simpelere bevestiging.
 */
export function useSpeechCheck(expectedText: string): UseSpeechCheckResult {
  const [status, setStatus] = useState<SpeechCheckStatus>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const attempt = useCallback(async () => {
    setStatus("listening");
    const { transcript } = await listenAndTranscribe("nl-NL");
    setAttempts((a) => a + 1);

    if (transcript && isSpeechMatch(transcript, expectedText)) {
      setFeedbackMessage(pick(CORRECT_MESSAGES));
      setStatus("correct");
    } else {
      setFeedbackMessage(pick(RETRY_MESSAGES));
      setStatus("retry");
    }
  }, [expectedText]);

  return { status, feedbackMessage, attempts, isAvailable: isSpeechRecognitionAvailable(), attempt };
}
