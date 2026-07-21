"use client";

import { useEffect, useRef, useState } from "react";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { getReferenceAudioForItem } from "@/lib/referenceAudio";
import { audioSimilarityProvider } from "@/providers/pronunciation/audioSimilarityProvider";

interface ListenAndSpeakProps {
  item: VocabularyItemView;
  childId: string;
  microphoneOptIn: boolean;
  onDone: (isCorrect: boolean) => void;
}

type Status = "idle" | "requesting" | "recording" | "assessing" | "correct" | "retry" | "saved-for-review";

const RECORD_DURATION_MS = 4000;

/**
 * Oefentype "Luisteren en herkennen" (hfst. 13.1) — herzien op verzoek: één
 * plaatje (geen keuze meer tussen meerdere afbeeldingen), het kind luistert
 * en spreekt het woord zelf na. Validatie:
 * - Is er een goedgekeurde referentie-opname in de opnamestudio? Dan
 *   vergelijkt audioSimilarityProvider de opname van het kind daar écht
 *   akoestisch mee (MFCC + DTW — geen omweg via het Nederlands).
 * - Zo niet, dan wordt de opname bewaard voor latere menselijke beoordeling
 *   (src/lib/childAttempts.ts) en gaat het kind gewoon door — geen nep-
 *   "goed" en geen blokkade (hfst. 21, 22).
 */
export function ListenAndSpeak({ item, childId, microphoneOptIn, onDone }: ListenAndSpeakProps) {
  const [status, setStatus] = useState<Status>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  // undefined = nog aan het laden, null = geen referentie-opname beschikbaar
  const [referenceUrl, setReferenceUrl] = useState<string | null | undefined>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReferenceAudioForItem(item.id).then((reference) => {
      if (!cancelled) setReferenceUrl(reference?.url ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const isSupported =
    typeof window !== "undefined" &&
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices?.getUserMedia &&
    typeof MediaRecorder !== "undefined";
  const useRealCapture = microphoneOptIn && isSupported;

  async function saveAttempt(blob: Blob, hadReference: boolean) {
    try {
      const formData = new FormData();
      formData.set("childId", childId);
      formData.set("itemId", item.id);
      formData.set("hadReference", String(hadReference));
      const extension = blob.type.includes("mp4") ? "mp4" : "webm";
      formData.set("audio", blob, `poging.${extension}`);
      await fetch("/api/attempts", { method: "POST", body: formData });
    } catch {
      // Best effort — mag de les nooit blokkeren (zie childAttempts.ts).
    }
  }

  async function handleRecordingFinished(blob: Blob) {
    setAttempts((a) => a + 1);
    void saveAttempt(blob, referenceUrl != null);

    if (!referenceUrl) {
      setStatus("saved-for-review");
      setFeedbackMessage("Goed ingesproken! Dit woord wordt binnenkort nagekeken.");
      return;
    }

    setStatus("assessing");
    const result = await audioSimilarityProvider.assess({
      learnerAudio: blob,
      expectedText: item.latinSpelling,
      referenceAudioUrl: referenceUrl,
      languageCode: "tzm",
    });

    setFeedbackMessage(result.feedbackMessageNl);
    setStatus(result.shouldOfferRetry ? "retry" : "correct");
  }

  async function handleRecord() {
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        void handleRecordingFinished(blob);
      };

      mediaRecorderRef.current = recorder;
      recorder.start();
      setStatus("recording");
      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      }, RECORD_DURATION_MS);
    } catch {
      setFeedbackMessage("Kon microfoon niet gebruiken. Check de browserpermissie.");
      setStatus("retry");
    }
  }

  const showAnswer = status === "correct" || status === "saved-for-review";

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-lg font-medium text-gray-700">Luister en zeg het woord na.</p>

      <div
        role="img"
        aria-label={item.imageAlt}
        className="flex h-40 w-40 items-center justify-center rounded-xl2 bg-primary-50 text-7xl"
      >
        {item.imageEmoji}
      </div>

      <AudioButton
        text={item.latinSpelling}
        itemId={item.id}
        fallbackSpokenText={item.translationNl}
        label="Speel het woord af"
      />

      {status === "idle" &&
        (useRealCapture ? (
          <Button onClick={handleRecord} className="flex items-center gap-2">
            <span aria-hidden="true">🎙️</span> Neem op
          </Button>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <p className="max-w-xs text-sm text-gray-500">
              {microphoneOptIn
                ? "Opnemen lukt niet in deze browser — zeg het woord toch hardop en ga dan verder."
                : "Microfoon staat uit. Zeg het woord toch hardop en ga dan verder."}
            </p>
            <Button onClick={() => onDone(true)}>Ik heb het gezegd</Button>
          </div>
        ))}

      {status === "requesting" && <p aria-live="polite">Microfoon aanvragen…</p>}

      {status === "recording" && (
        <p aria-live="polite" className="flex items-center gap-2 text-lg font-medium text-clay-500">
          <span className="h-2 w-2 animate-pulse rounded-full bg-clay-500" aria-hidden="true" /> Ik luister… zeg het
          maar!
        </p>
      )}

      {status === "assessing" && <p aria-live="polite">Even luisteren…</p>}

      {showAnswer && (
        <div className="flex flex-col items-center gap-4">
          <p aria-live="polite" className="text-lg font-medium text-success-500">
            {feedbackMessage}
          </p>
          <Button onClick={() => onDone(true)}>Verder</Button>
        </div>
      )}

      {status === "retry" && (
        <div className="flex flex-col items-center gap-4">
          <p aria-live="polite" className="text-lg font-medium text-clay-500">
            {feedbackMessage}
          </p>
          <div className="flex gap-3">
            <Button onClick={handleRecord}>Probeer opnieuw</Button>
            {attempts >= 2 && (
              <Button variant="ghost" onClick={() => onDone(false)}>
                Later nog eens
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
