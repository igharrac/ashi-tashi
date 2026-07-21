"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useAppStore } from "@/lib/store";
import { DEMO_BADGES, DIEREN_THEME } from "@/lib/demoData";
import { ImageAndWord } from "@/components/exercises/ImageAndWord";
import { ListenAndChoose } from "@/components/exercises/ListenAndChoose";
import { RepeatAfterMe } from "@/components/exercises/RepeatAfterMe";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import type { ExerciseView } from "@/types/domain";

/**
 * Lesscherm: sequentiële oefeningen, één taak per scherm (hfst. 7.3, 55).
 * Moeilijke woorden (2x fout) worden aan het eind van de les herhaald
 * (hfst. 13.13 herhaalles, vereenvoudigd voor de MVP).
 */
export default function LessonPage() {
  const params = useParams<{ childId: string; lessonId: string }>();
  const { getChild, recordExerciseAttempt, completeLesson, ready } = useAppStore();

  const lesson = DIEREN_THEME.lessons.find((l) => l.id === params.lessonId);
  const allItems = useMemo(() => DIEREN_THEME.lessons.flatMap((l) => l.exercises.map((e) => e.vocabularyItem)), []);

  const [queue, setQueue] = useState<ExerciseView[]>(() => lesson?.exercises ?? []);
  const [index, setIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [retryQueue, setRetryQueue] = useState<ExerciseView[]>([]);
  const [wrongCounts, setWrongCounts] = useState<Record<string, number>>({});
  const [finished, setFinished] = useState<{ points: number; newBadges: string[] } | null>(null);

  if (!ready) return <p className="text-center text-gray-500">Even laden…</p>;
  const child = getChild(params.childId);
  if (!child || !lesson) return notFound();

  const currentExercise = queue[index];

  function handleAnswer(exercise: ExerciseView, isCorrect: boolean) {
    recordExerciseAttempt(child!.id, {
      vocabularyItemId: exercise.vocabularyItem.id,
      isCorrect,
      attemptNumber: 1,
      isSpoken: exercise.type === "NAZEGGEN",
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
    <main className="flex flex-col gap-8">
      <ProgressBar current={index} total={queue.length} />

      {currentExercise.vocabularyItem.itemKind === "zin" && (
        <p className="text-center text-xs font-bold uppercase tracking-wide text-clay-500">
          🎉 Bijna klaar — nu in een hele zin!
        </p>
      )}

      {currentExercise.type === "AFBEELDING_EN_WOORD" && (
        <ImageAndWord item={currentExercise.vocabularyItem} onDone={() => handleAnswer(currentExercise, true)} />
      )}

      {currentExercise.type === "LUISTEREN_EN_HERKENNEN" && (
        <ListenAndChoose
          item={currentExercise.vocabularyItem}
          distractors={allItems.filter((i) => i.id !== currentExercise.vocabularyItem.id)}
          onAnswer={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
        />
      )}

      {currentExercise.type === "NAZEGGEN" && (
        <RepeatAfterMe
          item={currentExercise.vocabularyItem}
          microphoneOptIn={child.microphoneOptIn}
          onDone={(isCorrect) => handleAnswer(currentExercise, isCorrect)}
        />
      )}
    </main>
  );
}
