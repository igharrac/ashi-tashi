"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAppStore } from "@/lib/store";
import { DEMO_BADGES, DIEREN_THEME } from "@/lib/demoData";
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

  const [queue, setQueue] = useState<ExerciseView[]>(() => {
    const base = lesson?.exercises ?? [];
    return childForInit?.speakFirstMode ? applySpeakFirstMode(base) : base;
  });
  // Bij een tussentijds afgesloten les: hervat waar het kind gebleven was
  // i.p.v. steeds bij het begin te beginnen (zie setLessonProgress).
  const [index, setIndex] = useState(() => {
    const saved = childForInit?.lessonProgress;
    if (saved && saved.lessonId === lesson?.id) {
      return Math.min(Math.max(saved.index, 0), Math.max((lesson?.exercises.length ?? 1) - 1, 0));
    }
    return 0;
  });
  const [correctCount, setCorrectCount] = useState(0);
  const [retryQueue, setRetryQueue] = useState<ExerciseView[]>([]);
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState<{ points: number; newBadges: string[] } | null>(null);

  useEffect(() => {
    if (!childForInit || !lesson || finished) return;
    setLessonProgress(childForInit.id, { lessonId: lesson.id, index });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, lesson?.id, childForInit?.id, finished]);

  if (!ready) return <p className="text-center text-gray-500">Even laden…</p>;
  const child = getChild(params.childId);
  if (!child || !lesson) return notFound();

  const currentExercise = queue[index];

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
    if (index + 1 < queue.length) {
      setIndex((i) => i + 1);
      return;
    }
    if (retryQueue.length > 0) {
      setQueue(retryQueue);
      setRetryQueue([]);
      setIndex(0);
      return;
    }
    const totalExercises = (lesson?.exercises.length ?? 0);
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
    return <p className="text-center text-gray-500">Geen oefeningen gevonden.</p>;
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
          <ProgressBar current={index} total={queue.length} />
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
        <ImageAndWord item={currentExercise.vocabularyItem} onDone={() => handleAnswer(currentExercise, true)} />
      )}

      {currentExercise.type === "LUISTEREN_EN_HERKENNEN" && (
        <ListenAndSpeak
          item={currentExercise.vocabularyItem}
          childId={child.id}
          microphoneOptIn={child.microphoneOptIn}
          onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
        />
      )}

      {currentExercise.type === "NAZEGGEN" && (
        <RepeatAfterMe
          item={currentExercise.vocabularyItem}
          microphoneOptIn={child.microphoneOptIn}
          onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
        />
      )}

      {currentExercise.type === "ZELFSTANDIG_SPREKEN" && (
        <SpeakFromPicture
          item={currentExercise.vocabularyItem}
          microphoneOptIn={child.microphoneOptIn}
          onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
        />
      )}
    </main>
  );
}
