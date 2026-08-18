"use client";

import { useCallback, useState } from "react";
import { isSpeechRecognitionAvailable, listenAndTranscribe } from "@/providers/pronunciation/browserSpeechRecognition";
import { isSpeechMatch } from "@/domain/speechMatch";
import { leniencyDoneMessage, leniencyRetryMessage } from "@/domain/pronunciationLeniency";

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
 * De browser-tekstherkenning vergelijkt hier altijd met de Nederlandse
 * tekst, terwijl het kind het Tashelhit-woord zegt — een exacte match lukt
 * daardoor bijna nooit. `passAfterAttempts` (coulante modus, standaard aan
 * op kindniveau — zie src/domain/pronunciationLeniency.ts) telt daarom
 * gewoon het aantal pogingen: na dat aantal is de oefening altijd klaar,
 * ongeacht of de tekst matchte. Geen "fout"-oordeel per poging, alleen een
 * vriendelijke teller.
 *
 * Gebruik `isAvailable` om te bepalen of deze echte validatie mogelijk is
 * in de huidige browser; zo niet, val terug op een simpelere bevestiging.
 */
export function useSpeechCheck(expectedText: string, options?: { passAfterAttempts?: number }): UseSpeechCheckResult {
  const passAfterAttempts = options?.passAfterAttempts;
  const [status, setStatus] = useState<SpeechCheckStatus>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);

  const attempt = useCallback(async () => {
    setStatus("listening");
    const { transcript } = await listenAndTranscribe("nl-NL");
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (passAfterAttempts) {
      if (nextAttempts >= passAfterAttempts) {
        setFeedbackMessage(leniencyDoneMessage());
        setStatus("correct");
      } else {
        setFeedbackMessage(leniencyRetryMessage(nextAttempts, passAfterAttempts));
        setStatus("retry");
      }
      return;
    }

    if (transcript && isSpeechMatch(transcript, expectedText)) {
      setFeedbackMessage(pick(CORRECT_MESSAGES));
      setStatus("correct");
    } else {
      setFeedbackMessage(pick(RETRY_MESSAGES));
      setStatus("retry");
    }
  }, [attempts, expectedText, passAfterAttempts]);

  return { status, feedbackMessage, attempts, isAvailable: isSpeechRecognitionAvailable(), attempt };
}
