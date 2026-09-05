"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { conversationLessonId } from "@/lib/lessonCatalog";
import { getConversationsContent, type ConversationsContent } from "@/lib/conversationsClient";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import { playWordAudio } from "@/lib/playWordAudio";
import { playSuccessChime } from "@/lib/playSuccessChime";
import { mockPronunciationProvider } from "@/providers/pronunciation/mockPronunciationProvider";
import { useSpeechCheck } from "@/hooks/useSpeechCheck";
import { useWordSpelling } from "@/hooks/useWordSpelling";
import { AudioButton } from "@/components/ui/AudioButton";
import { Button } from "@/components/ui/Button";
import { MicLevelIndicator } from "@/components/ui/MicLevelIndicator";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { AutoplayIndicator } from "@/components/ui/AutoplayIndicator";
import { RewardAnimation } from "@/components/rewards/RewardAnimation";
import { CategoryCompleteScreen } from "@/components/rewards/CategoryCompleteScreen";
import type { ConversationLine } from "@/lib/conversations";

interface TranscriptEntry {
  who: "app" | "kind";
  itemId: string;
  translationNl: string;
}

/**
 * Kind-facing "Gesprekken"-scherm: een doorlopende chatflow i.p.v. één
 * oefening per scherm (zoals les/[lessonId]) — past niet in het generieke
 * ExerciseView/LessonView-model, zie lessonCatalog.ts. App-regels spelen
 * automatisch af; bij een keuzemoment kan elke optie eerst los beluisterd
 * worden vóór het kiezen (op verzoek), en na het kiezen spreekt het kind de
 * gekozen zin na (hergebruikt dezelfde coulante beoordeling als
 * RepeatAfterMe.tsx).
 */
export default function ConversationPage() {
  const params = useParams<{ childId: string; conversationId: string }>();
  const { getChild, recordExerciseAttempt, completeLesson, setLessonProgress, setAutoplayAudio, ready } = useAppStore();

  const [conversationsContent, setConversationsContent] = useState<ConversationsContent | null>(null);
  const [recordedIds, setRecordedIds] = useState<Set<string> | null>(null);
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [transcript, setTranscript] = useState<TranscriptEntry[]>([]);
  const [pickedLine, setPickedLine] = useState<ConversationLine | null>(null);
  const [finished, setFinished] = useState<{ points: number } | null>(null);

  useEffect(() => {
    let cancelled = false;
    getConversationsContent().then((content) => {
      if (!cancelled) setConversationsContent(content);
    });
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (!ready || conversationsContent === null || recordedIds === null) {
    return <p className="py-12 text-center text-ink-muted">Even laden…</p>;
  }

  const child = getChild(params.childId);
  const conversation = conversationsContent.conversations.find((c) => c.id === params.conversationId);
  if (!child || !conversation) return notFound();

  const lessonId = conversationLessonId(conversation.id);

  // Nooit een kind laten vastlopen op een niet (helemaal) ingesproken
  // gesprek — zie getConversationStatuses in lessonCatalog.ts, dat al
  // voorkomt dat zo'n tegel zichtbaar is, maar directe URL-toegang moet ook
  // netjes afgevangen worden.
  const allItemIds = conversation.steps.flatMap((step) =>
    step.type === "app" ? [step.line.itemId] : step.options.map((o) => o.itemId),
  );
  const isComplete = allItemIds.length > 0 && allItemIds.every((id) => recordedIds.has(id));
  if (!isComplete) {
    return (
      <main className="flex flex-col items-center gap-4 pt-12 text-center">
        <p className="text-4xl" aria-hidden="true">
          🎤
        </p>
        <p className="text-gray-500">Dit gesprek is nog niet helemaal ingesproken.</p>
        <Link href={`/kind/${child.id}/route`}>
          <Button>Naar leerroute</Button>
        </Link>
      </main>
    );
  }

  // Init: begin bij een eerder hervatpunt binnen ditzelfde gesprek, anders bij stap 0.
  if (stepIndex === null) {
    const saved = child.lessonProgress;
    const startIndex = saved && saved.lessonId === lessonId ? Math.min(Math.max(saved.index, 0), conversation.steps.length - 1) : 0;
    setStepIndex(startIndex);
    return <p className="py-12 text-center text-ink-muted">Even laden…</p>;
  }

  function goToStep(nextIndex: number) {
    setPickedLine(null);
    if (nextIndex >= conversation!.steps.length) {
      const totalExercises = conversation!.steps.length;
      completeLesson(child!.id, lessonId, { totalExercises, correctExercises: totalExercises, awardThemeBadge: false });
      setLessonProgress(child!.id, null);
      setFinished({ points: totalExercises });
      return;
    }
    setLessonProgress(child!.id, { lessonId, index: nextIndex });
    setStepIndex(nextIndex);
  }

  if (finished) {
    return (
      <CategoryCompleteScreen title="Gesprek voltooid!" subtitle={`Goed gedaan, ${child.displayName}!`}>
        <Link href={`/kind/${child.id}/route`}>
          <Button variant="secondary">Naar leerroute</Button>
        </Link>
      </CategoryCompleteScreen>
    );
  }

  const currentStep = conversation.steps[stepIndex]!;

  return (
    <main className="mx-auto flex max-w-lg flex-col gap-4 overflow-x-hidden px-4 py-6">
      {/* Statusbalk: terug, voortgang, en een schakelaar voor automatisch
          afspelen (rode streep = uit) — geen afspeelknop zelf, zie de
          "Opnieuw"/"Afspelen"-knoppen bij de regel/keuze hieronder. */}
      <div className="flex items-center gap-1">
        <Link
          href={`/kind/${child.id}/route`}
          aria-label="Terug naar de leerroute (je voortgang wordt bewaard)"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-muted
            hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span aria-hidden="true">←</span>
        </Link>

        <div className="flex-1">
          <ProgressBar current={stepIndex} total={conversation.steps.length} />
        </div>

        <AutoplayIndicator
          enabled={child.autoplayAudio}
          onToggle={(enabled) => setAutoplayAudio(child.id, enabled)}
        />
      </div>

      <div className="flex items-center gap-2 text-lg font-bold text-forest-700">
        <span aria-hidden="true">{conversation.emoji}</span>
        {conversation.titleNl}
      </div>

      <div className="flex flex-col gap-3">
        {transcript.map((entry, i) => (
          <div
            key={i}
            className={`max-w-[85%] rounded-xl2 px-4 py-2.5 text-base ${
              entry.who === "app"
                ? "self-start border-2 border-primary-100 bg-white text-ink-primary"
                : "self-end bg-forest-500 text-white"
            }`}
          >
            {entry.translationNl}
          </div>
        ))}
      </div>

      <div className="mt-2">
        {currentStep.type === "app" ? (
          <AppLineStep
            key={stepIndex}
            line={currentStep.line}
            preferredPersona={child.preferredVoicePersona}
            onDone={() => {
              setTranscript((prev) => [...prev, { who: "app", ...currentStep.line }]);
              goToStep(stepIndex + 1);
            }}
          />
        ) : pickedLine === null ? (
          <ChoiceStep
            key={stepIndex}
            options={currentStep.options}
            preferredPersona={child.preferredVoicePersona}
            onPick={(line) => {
              setTranscript((prev) => [...prev, { who: "kind", ...line }]);
              setPickedLine(line);
            }}
          />
        ) : (
          <ChoiceAttempt
            key={`${stepIndex}-attempt`}
            line={pickedLine}
            microphoneOptIn={child.microphoneOptIn}
            preferredPersona={child.preferredVoicePersona}
            onDone={() => {
              recordExerciseAttempt(child!.id, {
                vocabularyItemId: pickedLine.itemId,
                isCorrect: true,
                attemptNumber: 1,
                isSpoken: true,
              });
              goToStep(stepIndex + 1);
            }}
          />
        )}
      </div>
    </main>
  );
}

interface AppLineStepProps {
  line: ConversationLine;
  preferredPersona: ReturnType<typeof useAppStore>["state"]["children"][number]["preferredVoicePersona"];
  onDone: () => void;
}

/** App-regel: speelt automatisch af zodra de stap verschijnt, met een handmatige "opnieuw"-knop en "Verder" om door te gaan. */
function AppLineStep({ line, preferredPersona, onDone }: AppLineStepProps) {
  const spelling = useWordSpelling(line.itemId);

  useEffect(() => {
    playWordAudio({ itemId: line.itemId, text: spelling ?? line.translationNl, fallbackSpokenText: line.translationNl, preferredPersona });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [line.itemId]);

  return (
    <div className="flex flex-col items-center gap-3 rounded-xl2 border-2 border-primary-100 bg-white p-4">
      <p className="text-xl font-bold text-primary-600">{spelling ?? line.translationNl}</p>
      {spelling && <p className="text-sm text-ink-muted">{line.translationNl}</p>}
      <div className="flex items-center gap-3">
        <AudioButton
          text={spelling ?? line.translationNl}
          itemId={line.itemId}
          fallbackSpokenText={line.translationNl}
          preferredPersona={preferredPersona}
          label="Opnieuw"
          iconOnly
        />
        <Button onClick={onDone}>Verder →</Button>
      </div>
    </div>
  );
}

interface ChoiceStepProps {
  options: ConversationLine[];
  preferredPersona: ReturnType<typeof useAppStore>["state"]["children"][number]["preferredVoicePersona"];
  onPick: (line: ConversationLine) => void;
}

/** Keuzemoment: elke optie heeft een eigen luisterknop (los van kiezen), zodat het kind eerst kan beluisteren voordat hij kiest. */
function ChoiceStep({ options, preferredPersona, onPick }: ChoiceStepProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl2 border-2 border-primary-100 bg-white p-4">
      <p className="text-sm font-medium text-gray-500">Beluister en kies wat je zegt:</p>
      <div className="flex flex-col gap-2">
        {options.map((option) => (
          <div key={option.itemId} className="flex items-center gap-2">
            <AudioButton
              text={option.translationNl}
              itemId={option.itemId}
              fallbackSpokenText={option.translationNl}
              preferredPersona={preferredPersona}
              label="Beluister"
              iconOnly
            />
            <Button onClick={() => onPick(option)} className="flex-1 text-left">
              {option.translationNl}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}

interface ChoiceAttemptProps {
  line: ConversationLine;
  microphoneOptIn: boolean;
  preferredPersona: ReturnType<typeof useAppStore>["state"]["children"][number]["preferredVoicePersona"];
  onDone: () => void;
}

/**
 * Navertellen van de gekozen zin — zelfde speech-check als RepeatAfterMe.tsx,
 * maar op verzoek zonder de "3x inspreken"-drempel: hier telt elke poging
 * meteen als klaar (passAfterAttempts: 1), ongeacht de coulante-modus-
 * instelling van het kind elders in de app.
 */
function ChoiceAttempt({ line, microphoneOptIn, preferredPersona, onDone }: ChoiceAttemptProps) {
  const speech = useSpeechCheck(line.translationNl, { passAfterAttempts: 1 });
  const spelling = useWordSpelling(line.itemId);
  const [fallbackStatus, setFallbackStatus] = useState<"idle" | "recording" | "feedback">("idle");
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const useRealValidation = microphoneOptIn && speech.isAvailable;

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
      expectedText: line.translationNl,
      languageCode: "tzm",
    });
    setFallbackMessage(result.feedbackMessageNl);
    setFallbackStatus("feedback");
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl2 border-2 border-forest-100 bg-white p-4 text-center">
      <p className="text-lg font-bold text-primary-600">{spelling ?? line.translationNl}</p>
      {spelling && <p className="text-sm text-ink-muted">{line.translationNl}</p>}

      {useRealValidation ? (
        <>
          {(speech.status === "idle" || speech.status === "retry") && (
            <div className="flex flex-col items-center gap-4">
              <div className="flex flex-row items-center justify-center gap-4">
                <AudioButton
                  text={spelling ?? line.translationNl}
                  itemId={line.itemId}
                  fallbackSpokenText={line.translationNl}
                  preferredPersona={preferredPersona}
                  label="Afspelen"
                  iconOnly
                />
                <Button onClick={speech.attempt} className="flex items-center gap-2">
                  <span aria-hidden="true">🎙️</span> Zeg het na
                </Button>
              </div>
              {speech.status === "retry" && (
                <p aria-live="polite" className="text-lg font-medium text-forest-600">
                  {speech.feedbackMessage}
                </p>
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
              <RewardAnimation type="WORD_SUCCESS" sizeClassName="h-16 w-16" />
              <p aria-live="polite" className="text-lg font-medium text-success-500">
                {speech.feedbackMessage}
              </p>
              <Button onClick={onDone}>Verder →</Button>
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
                <p className="max-w-xs text-sm text-gray-500">Microfoon staat uit. Je kunt het toch hardop zeggen en dan verdergaan.</p>
                <Button onClick={handleFallbackRecord}>Ik heb het gezegd</Button>
              </div>
            ))}
          {fallbackStatus === "recording" && <p aria-live="polite">Even luisteren…</p>}
          {fallbackStatus === "feedback" && (
            <div className="flex flex-col items-center gap-4">
              <p aria-live="polite" className="text-lg font-medium text-success-500">
                {fallbackMessage}
              </p>
              <Button onClick={onDone}>Verder →</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
