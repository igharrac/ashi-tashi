"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { DEMO_BADGES, DIEREN_THEME } from "@/lib/demoData";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import { ImageAndWord } from "@/components/exercises/ImageAndWord";
import { ListenAndSpeak } from "@/components/exercises/ListenAndSpeak";
import { RepeatAfterMe } from "@/components/exercises/RepeatAfterMe";
import { SpeakFromPicture } from "@/components/exercises/SpeakFromPicture";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { applySpeakFirstMode } from "@/domain/lessonMode";
import type { ExerciseView } from "@/types/domain";

/**
 * Lesscherm: sequentiële oefeningen, één taak per scherm (hfst. 7.3, 55).
 * Moeilijke woorden (2x fout) worden aan het eind van de les herhaald
 * (hfst. 13.13 herhaalles, vereenvoudigd voor de MVP).
 */
export default function LessonPage() {
  const params = useParams<{ childId: string; lessonId: string }>();
  const { getChild, recordExerciseAttempt, completeLesson, setLessonProgress, ready } = useAppStore();

  const lesson = DIEREN_THEME.lessons.find((l) => l.id === params.lessonId);
  // Child alvast ophalen (kan nog undefined zijn vóór "ready") zodat de
  // gekozen oefenvorm (hfst. 13.11) direct bij de start van de les geldt.
  const childForInit = getChild(params.childId);

  const [recordedIds, setRecordedIds] = useState<Set<string> | null>(null);
  useEffect(() => {
    let cancelled = false;
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Alleen oefeningen met een écht ingesproken opname horen thuis in de les
  // — anders zou het kind bij een woord of zin gewoon Nederlandse TTS te
  // horen krijgen (zelfde regel als Ontdekken/het matchspel, zie
  // getItemIdsWithRecordings).
  const lessonExercises = useMemo(() => {
    if (!lesson || !recordedIds) return null;
    return lesson.exercises.filter((exercise) => recordedIds.has(exercise.vocabularyItem.id));
  }, [lesson, recordedIds]);

  const [queue, setQueue] = useState<ExerciseView[] | null>(null);
  const [index, setIndex] = useState(0);

  // Queue/index pas invullen zodra de opnamen bekend zijn (recordedIds) —
  // niet meteen bij mount, anders zit de ongefilterde lijst er al in vóór
  // het filter kan draaien.
  useEffect(() => {
    if (queue !== null || !lessonExercises) return;
    const base = childForInit?.speakFirstMode ? applySpeakFirstMode(lessonExercises) : lessonExercises;
    setQueue(base);
    // Bij een tussentijds afgesloten les: hervat waar het kind gebleven was
    // i.p.v. steeds bij het begin te beginnen (zie setLessonProgress).
    const saved = childForInit?.lessonProgress;
    if (saved && lesson && saved.lessonId === lesson.id) {
      setIndex(Math.min(Math.max(saved.index, 0), Math.max(base.length - 1, 0)));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queue, lessonExercises]);

  const [correctCount, setCorrectCount] = useState(0);
  const [retryQueue, setRetryQueue] = useState<ExerciseView[]>([]);
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState<{ points: number; newBadges: string[] } | null>(null);

  useEffect(() => {
    if (!childForInit || !lesson || finished || queue === null) return;
    setLessonProgress(childForInit.id, { lessonId: lesson.id, index });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, lesson?.id, childForInit?.id, finished, queue]);

  if (!ready) return <p className="text-center text-gray-500">Even laden…</p>;
  const child = getChild(params.childId);
  if (!child || !lesson) return notFound();
  if (!recordedIds || queue === null) return <p className="text-center text-gray-500">Even laden…</p>;

  // Losse, expliciet niet-nullable naam zodat TypeScript de null-check ook
  // binnen de onderstaande geneste functies (goToNext e.d.) kan volgen.
  const currentQueue: ExerciseView[] = queue;
  const currentExercise = currentQueue[index];

  function handleAnswer(exercise: ExerciseView, isCorrect: boolean) {
    recordExerciseAttempt(child!.id, {
      vocabularyItemId: exercise.vocabularyItem.id,
      isCorrect,
      attemptNumber: 1,
      isSpoken:
        exercise.type === "NAZEGGEN" ||
        exercise.type === "ZELFSTANDIG_SPREKEN" ||
        exercise.type === "LUISTEREN_EN_HERKENNEN",
    });

    if (isCorrect) {
      setCorrectCount((c) => c + 1);
    } else {
      setWrongCounts((prev) => {
        const next = { ...prev, [exercise.vocabularyItem.id]: (prev[exercise.vocabularyItem.id] ?? 0) + 1 };
        return next;
      });
      // Woorden die 2x fout gaan komen aan het eind terug (hfst. 13.13)
      setRetryQueue((prev) => [...prev, exercise]);
    }
    goToNext();
  }

  /** Woord overslaan zonder te scoren — telt niet als goed of fout (hfst. 22: nooit dwingen). */
  function handleSkip() {
    goToNext();
  }

  function goToPrevious() {
    if (index > 0) setIndex((i) => i - 1);
  }

  function goToNext() {
    if (index + 1 < currentQueue.length) {
      setIndex((i) => i + 1);
      return;
    }
    if (retryQueue.length > 0) {
      setQueue(retryQueue);
      setRetryQueue([]);
      setIndex(0);
      return;
    }
    const totalExercises = lessonExercises?.length ?? 0;
    const points = totalExercises; // grove indicatie; exacte score via computeLessonPoints in store
    const newBadges = completeLesson(child!.id, lesson!.id, {
      totalExercises,
      correctExercises: correctCount + 1,
    });
    setFinished({ points, newBadges });
  }

  if (finished) {
    return (
      <main className="flex flex-col items-center gap-6 pt-8 text-center">
        <p className="text-6xl" aria-hidden="true">
          🎉
        </p>
        <h1 className="text-2xl font-bold text-primary-600">Les voltooid!</h1>
        <p className="text-gray-600">Goed gedaan, {child.displayName}!</p>

        {finished.newBadges.length > 0 && (
          <div className="flex flex-wrap justify-center gap-4">
            {finished.newBadges.map((slug) => {
              const badge = DEMO_BADGES[slug];
              if (!badge) return null;
              return (
                <Card key={slug} className="flex w-32 flex-col items-center gap-1">
                  <span className="text-4xl" aria-hidden="true">
                    {badge.emoji}
                  </span>
                  <span className="text-sm font-semibold">{badge.titleNl}</span>
                </Card>
              );
            })}
          </div>
        )}

        <Link href={`/kind/${child.id}/route`}>
          <Button>Naar leerroute</Button>
        </Link>
      </main>
    );
  }

  if (!currentExercise) {
    // Kan gebeuren als er (nog) geen enkel woord in deze les een ingesproken
    // opname heeft — het kind mag hier nooit vast komen te zitten (hfst. 22).
    return (
      <main className="flex flex-col items-center gap-4 pt-12 text-center">
        <p className="text-4xl" aria-hidden="true">
          🎤
        </p>
        <p className="text-gray-500">Deze les heeft nog geen ingesproken woorden.</p>
        <Link href={`/kind/${child.id}/route`}>
          <Button>Naar leerroute</Button>
        </Link>
      </main>
    );
  }

  return (
    <main className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Link
          href={`/kind/${child.id}/route`}
          aria-label="Terug naar de leerroute (je voortgang wordt bewaard)"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-muted
            hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          <span aria-hidden="true">←</span>
        </Link>

        <div className="flex-1">
          <ProgressBar current={index} total={currentQueue.length} />
        </div>

        <button
          type="button"
          onClick={goToPrevious}
          disabled={index === 0}
          aria-label="Vorig woord"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-lg text-ink-muted
            hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500 disabled:opacity-30"
        >
          <span aria-hidden="true">↩</span>
        </button>
        <button
          type="button"
          onClick={handleSkip}
          aria-label="Dit woord overslaan"
          className="flex h-9 items-center gap-1 rounded-full px-3 text-sm font-semibold text-ink-muted
            hover:bg-cream focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
        >
          Overslaan <span aria-hidden="true">→</span>
        </button>
      </div>

      {currentExercise.vocabularyItem.itemKind === "zin" && (
        <p className="text-center text-xs font-bold uppercase tracking-wide text-clay-500">
          🎉 Bijna klaar — nu in een hele zin!
        </p>
      )}

      {currentExercise.type === "AFBEELDING_EN_WOORD" && (
        <ImageAndWord
          item={currentExercise.vocabularyItem}
          onDone={() => handleAnswer(currentExercise, true)}
          preferredPersona={child.preferredVoicePersona}
        />
      )}

      {currentExercise.type === "LUISTEREN_EN_HERKENNEN" && (
        <ListenAndSpeak
          item={currentExercise.vocabularyItem}
          childId={child.id}
          microphoneOptIn={child.microphoneOptIn}
          onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
          preferredPersona={child.preferredVoicePersona}
        />
      )}

      {currentExercise.type === "NAZEGGEN" && (
        <RepeatAfterMe
          item={currentExercise.vocabularyItem}
          microphoneOptIn={child.microphoneOptIn}
          onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
          preferredPersona={child.preferredVoicePersona}
        />
      )}

      {currentExercise.type === "ZELFSTANDIG_SPREKEN" && (
        <SpeakFromPicture
          item={currentExercise.vocabularyItem}
          microphoneOptIn={child.microphoneOptIn}
          onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
          preferredPersona={child.preferredVoicePersona}
        />
      )}
    </main>
  );
}
