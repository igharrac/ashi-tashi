"use client";

import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { VocabularyItemView } from "@/types/domain";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { MicLevelIndicator } from "@/components/ui/MicLevelIndicator";
import { NavFlankedRow } from "@/components/ui/NavFlankedRow";
import { ZoomableImage } from "@/components/ui/ZoomableImage";
import { getReferenceAudioForItem } from "@/lib/referenceAudio";
import { playWordAudio } from "@/lib/playWordAudio";
import { useWordSpelling } from "@/hooks/useWordSpelling";
import type { RecordingPersona } from "@/lib/recordableItems";
import { audioSimilarityProvider } from "@/providers/pronunciation/audioSimilarityProvider";
import { LENIENT_PRONUNCIATION_ATTEMPTS, leniencyDoneMessage, leniencyRetryMessage } from "@/domain/pronunciationLeniency";
import { playSuccessChime } from "@/lib/playSuccessChime";
import { AttemptStars } from "./AttemptStars";

interface ListenAndSpeakProps {
  item: VocabularyItemView;
  childId: string;
  microphoneOptIn: boolean;
  onDone: (isCorrect: boolean) => void;
  preferredPersona?: RecordingPersona | null;
  /** Standaard aan (kindinstelling): klaar na 3x inspreken, ongeacht of het matchte. Zie pronunciationLeniency.ts. */
  lenientPronunciationMode?: boolean;
  /** Kindinstelling child.autoplayAudio (zie SettingsPanelContent.tsx), geldt overal. */
  autoplayAudio: boolean;
  /** Vorige/volgende-navigatie, geflankeerd om de foto (zie NavFlankedRow) — optioneel, bv. niet nodig in WordDetailModal. */
  onPrevious?: () => void;
  previousDisabled?: boolean;
  onNext?: () => void;
}

type Status = "idle" | "requesting" | "recording" | "assessing" | "correct" | "retry" | "saved-for-review";

// Vaste opnameduur (geen stilte-detectie/auto-stop) — voor een los woord is
// 4s onnodig lang wachten voordat er iets gebeurt; voor een hele zin is meer
// ruimte nodig. Dit is de belangrijkste resterende wachttijd nu de
// akoestische validatie zelf wordt overgeslagen in coulante modus.
const RECORD_DURATION_MS_WORD = 2500;
const RECORD_DURATION_MS_SENTENCE = 4000;

/**
 * Oefentype "Luisteren en herkennen" (hfst. 13.1) — herzien op verzoek: één
 * plaatje (geen keuze meer tussen meerdere afbeeldingen), het kind luistert
 * en spreekt het woord zelf na. Validatie:
 * - In coulante modus (standaard aan, zie pronunciationLeniency.ts) wordt de
 *   akoestische vergelijking helemaal overgeslagen — die kost merkbare tijd
 *   (referentie-opname ophalen + MFCC/DTW) en het resultaat werd toch
 *   genegeerd, dus alleen wachten maken zonder nut. Gewoon 3x inspreken telt.
 * - Uit coulante modus, mét een goedgekeurde referentie-opname in de
 *   opnamestudio: audioSimilarityProvider vergelijkt de opname van het kind
 *   daar écht akoestisch mee (MFCC + DTW — geen omweg via het Nederlands).
 * - Geen referentie-opname: de opname wordt bewaard voor latere menselijke
 *   beoordeling (src/lib/childAttempts.ts) en het kind gaat gewoon door —
 *   geen nep-"goed" en geen blokkade (hfst. 21, 22).
 */
export function ListenAndSpeak({
  item,
  childId,
  microphoneOptIn,
  onDone,
  preferredPersona,
  lenientPronunciationMode = true,
  autoplayAudio,
  onPrevious,
  previousDisabled,
  onNext,
}: ListenAndSpeakProps) {
  const spelling = useWordSpelling(item.id);
  const [status, setStatus] = useState<Status>("idle");
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [attempts, setAttempts] = useState(0);
  // Alleen voor kalibratie tijdens ontwikkeling (?debug=1 in de URL) — nooit
  // aan een kind tonen, zie PronunciationAssessmentResult.debugInfo.
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const isDebugMode = searchParams.get("debug") === "1";
  // undefined = nog aan het laden, null = geen referentie-opname beschikbaar
  const [referenceUrl, setReferenceUrl] = useState<string | null | undefined>(undefined);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    let cancelled = false;
    getReferenceAudioForItem(item.id, preferredPersona).then((reference) => {
      if (!cancelled) setReferenceUrl(reference?.url ?? null);
    });
    return () => {
      cancelled = true;
    };
  }, [item.id, preferredPersona]);

  // Autoplay bij het verschijnen van dit woord (mount, dankzij key={item.id}
  // bij de aanroeper) — mits de kindinstelling aan staat (SettingsPanelContent.tsx).
  useEffect(() => {
    if (autoplayAudio) {
      void playWordAudio({
        itemId: item.id,
        text: item.latinSpelling,
        fallbackSpokenText: item.translationNl,
        preferredPersona,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Vrolijk geluidje zodra de oefening klaar is — precies één keer per
  // afronding (hfst. 22: duidelijk positief signaal i.p.v. een getal).
  useEffect(() => {
    if (status === "correct" || status === "saved-for-review") playSuccessChime();
  }, [status]);

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
    void saveAttempt(blob, referenceUrl != null);
    const nextAttempts = attempts + 1;
    setAttempts(nextAttempts);

    if (!referenceUrl) {
      setStatus("saved-for-review");
      setFeedbackMessage("Goed ingesproken! Dit woord wordt binnenkort nagekeken.");
      return;
    }

    if (lenientPronunciationMode) {
      // Coulante modus (standaard aan, zie pronunciationLeniency.ts): het
      // akoestische oordeel wordt toch genegeerd, dus audioSimilarityProvider
      // hoeft hier niet aangeroepen te worden — scheelt merkbare wachttijd
      // (referentie-opname ophalen + MFCC/DTW-verwerking).
      if (nextAttempts >= LENIENT_PRONUNCIATION_ATTEMPTS) {
        setFeedbackMessage(leniencyDoneMessage());
        setStatus("correct");
      } else {
        setFeedbackMessage(leniencyRetryMessage(nextAttempts, LENIENT_PRONUNCIATION_ATTEMPTS));
        setStatus("retry");
      }
      return;
    }

    setStatus("assessing");
    const result = await audioSimilarityProvider.assess({
      learnerAudio: blob,
      expectedText: item.latinSpelling,
      referenceAudioUrl: referenceUrl,
      languageCode: "tzm",
    });
    setDebugInfo(result.debugInfo ?? null);
    setFeedbackMessage(result.feedbackMessageNl);
    setStatus(result.shouldOfferRetry ? "retry" : "correct");
  }

  // Fallback wanneer echte opname niet ondersteund wordt (geen
  // getUserMedia/MediaRecorder in deze browser) maar de ouder wél
  // microfoon-toestemming heeft gegeven: zelfde patroon als
  // RepeatAfterMe/SpeakFromPicture — het micknopje blijft dan gewoon
  // zichtbaar (i.p.v. stilletjes te verdwijnen) en simuleert kort
  // "luisteren" voordat het kind gewoon verdergaat.
  async function handleFallbackRecord() {
    setStatus("recording");
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setAttempts((prev) => prev + 1);
    setFeedbackMessage("Goed gezegd!");
    setStatus("correct");
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
      const duration = item.itemKind === "zin" ? RECORD_DURATION_MS_SENTENCE : RECORD_DURATION_MS_WORD;
      window.setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") mediaRecorderRef.current.stop();
      }, duration);
    } catch {
      setFeedbackMessage("Kon microfoon niet gebruiken. Check de browserpermissie.");
      setStatus("retry");
    }
  }

  const showAnswer = status === "correct" || status === "saved-for-review";

  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-lg font-medium text-gray-700">Luister en zeg het woord na.</p>

      <NavFlankedRow onPrevious={onPrevious} previousDisabled={previousDisabled} onNext={onNext}>
        <ZoomableImage pictogramUrl={item.pictogramUrl} emoji={item.imageEmoji} alt={item.imageAlt} sizeClassName="h-40 w-40 text-7xl" />
      </NavFlankedRow>

      {(status === "idle" || status === "retry") && microphoneOptIn && (
        <div className="flex flex-row items-center justify-center gap-4">
          <AudioButton
            text={item.latinSpelling}
            itemId={item.id}
            fallbackSpokenText={item.translationNl}
            preferredPersona={preferredPersona}
            iconOnly
          />
          <Button
            onClick={useRealCapture ? handleRecord : handleFallbackRecord}
            className="flex items-center gap-2 whitespace-nowrap !px-5"
          >
            <span aria-hidden="true">🎙️</span> Zeg het woord
          </Button>
        </div>
      )}

      {status === "idle" && !microphoneOptIn && (
        <div className="flex flex-col items-center gap-3">
          <AudioButton
            text={item.latinSpelling}
            itemId={item.id}
            fallbackSpokenText={item.translationNl}
            preferredPersona={preferredPersona}
          />
          <p className="max-w-xs text-sm text-gray-500">Microfoon staat uit. Zeg het woord toch hardop en ga dan verder.</p>
          <Button onClick={() => onDone(true)}>Ik heb het gezegd</Button>
        </div>
      )}

      {lenientPronunciationMode && attempts > 0 && (status === "idle" || status === "retry") && (
        <AttemptStars attempts={attempts} total={LENIENT_PRONUNCIATION_ATTEMPTS} />
      )}

      {status === "requesting" && <p aria-live="polite">Microfoon aanvragen…</p>}

      {status === "recording" && (
        <div className="flex flex-col items-center gap-2">
          <p aria-live="polite" className="flex items-center gap-2 text-lg font-medium text-clay-500">
            <span className="h-2 w-2 animate-pulse rounded-full bg-clay-500" aria-hidden="true" /> Ik luister… zeg het
            maar!
          </p>
          <MicLevelIndicator active stream={streamRef.current} />
        </div>
      )}

      {status === "assessing" && <p aria-live="polite">Even luisteren…</p>}

      {showAnswer && (
        <div className="flex flex-col items-center gap-4">
          {status === "correct" && lenientPronunciationMode && (
            <AttemptStars attempts={LENIENT_PRONUNCIATION_ATTEMPTS} total={LENIENT_PRONUNCIATION_ATTEMPTS} />
          )}
          <p aria-hidden="true" className="text-4xl">
            🎉
          </p>
          <p aria-live="polite" className="text-lg font-medium text-success-500">
            {feedbackMessage}
          </p>
          <p className="text-sm text-ink-muted">
            Het was: <span className="font-bold text-forest-600">{spelling ?? item.translationNl}</span>
            {spelling && <span className="ml-1">({item.translationNl})</span>}
          </p>
          {isDebugMode && debugInfo && (
            <p className="max-w-xs break-words rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500">
              debug: {debugInfo}
            </p>
          )}
          <Button onClick={() => onDone(true)}>Verder</Button>
        </div>
      )}

      {status === "retry" && (
        <div className="flex flex-col items-center gap-4">
          <p
            aria-live="polite"
            className={`text-lg font-medium ${lenientPronunciationMode ? "text-forest-600" : "text-clay-500"}`}
          >
            {feedbackMessage}
          </p>
          {isDebugMode && debugInfo && (
            <p className="max-w-xs break-words rounded bg-gray-100 px-2 py-1 font-mono text-xs text-gray-500">
              debug: {debugInfo}
            </p>
          )}
          {!useRealCapture && <Button onClick={handleRecord}>Probeer opnieuw</Button>}
          <p className="text-sm text-ink-muted">
            Het was: <span className="font-bold text-forest-600">{spelling ?? item.translationNl}</span>
            {spelling && <span className="ml-1">({item.translationNl})</span>}
          </p>
        </div>
      )}
    </div>
  );
}
