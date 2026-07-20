"use client";

import Link from "next/link";
import { useAppStore } from "@/lib/store";
import { DIEREN_THEME } from "@/lib/demoData";
import { computeMastery, type ExerciseAttemptRecord } from "@/domain/progress";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

/**
 * Ouderoverzicht (hfst. 11.5, 30): begrijpelijk, geen technisch
 * tabellendashboard. Toont per kind welke woorden goed gaan, welke extra
 * oefening nodig hebben, en globale voortgang.
 */
export default function ParentOverviewPage() {
  const { state, ready } = useAppStore();

  if (!ready) return <p className="text-center text-gray-500">Even laden…</p>;

  return (
    <main className="mx-auto flex max-w-2xl flex-col gap-8 px-4 py-8">
      <h1 className="text-2xl font-bold text-forest-500">Ouderoverzicht</h1>

      {state.children.length === 0 && (
        <p className="text-gray-500">Nog geen kinderprofielen aangemaakt.</p>
      )}

      {state.children.map((child) => {
        const attempts: ExerciseAttemptRecord[] = Object.entries(child.itemStats).flatMap(([vocabularyItemId, s]) => [
          ...Array(s.correct).fill({ vocabularyItemId, isCorrect: true, attemptNumber: 1 }),
          ...Array(s.incorrect).fill({ vocabularyItemId, isCorrect: false, attemptNumber: 1 }),
        ]);
        const mastery = computeMastery(attempts);
        const goingWell = mastery.filter((m) => !m.isDifficult && m.timesCorrect > 0);
        const needsPractice = mastery.filter((m) => m.isDifficult);
        const lessonCount = DIEREN_THEME.lessons.length;
        const completedCount = child.completedLessonIds.length;

        function labelFor(vocabularyItemId: string) {
          const item = DIEREN_THEME.lessons.flatMap((l) => l.exercises).find((e) => e.vocabularyItem.id === vocabularyItemId)
            ?.vocabularyItem;
          return item?.translationNl ?? vocabularyItemId;
        }

        return (
          <Card key={child.id} className="flex flex-col gap-4">
            <header className="flex items-center gap-3">
              <span className="text-3xl" aria-hidden="true">
                {child.avatarId}
              </span>
              <div>
                <p className="font-bold">{child.displayName}</p>
                <p className="text-sm text-gray-500">
                  {completedCount} van {lessonCount} lessen gevolgd &middot; {child.points} punten
                </p>
              </div>
            </header>

            <div>
              <p className="mb-1 text-sm font-semibold text-gray-700">Deze woorden gaan goed</p>
              {goingWell.length === 0 ? (
                <p className="text-sm text-gray-400">Nog geen woorden geoefend.</p>
              ) : (
                <p className="text-sm text-gray-600">{goingWell.map((m) => labelFor(m.vocabularyItemId)).join(", ")}</p>
              )}
            </div>

            <div>
              <p className="mb-1 text-sm font-semibold text-gray-700">Deze woorden vragen extra oefening</p>
              {needsPractice.length === 0 ? (
                <p className="text-sm text-gray-400">Geen moeilijke woorden op dit moment.</p>
              ) : (
                <p className="text-sm text-gray-600">{needsPractice.map((m) => labelFor(m.vocabularyItemId)).join(", ")}</p>
              )}
            </div>

            {child.earnedBadgeSlugs.length > 0 && (
              <p className="text-sm text-gray-600">
                {child.displayName} heeft {child.earnedBadgeSlugs.length} badge(s) verdiend 🏅
              </p>
            )}
          </Card>
        );
      })}

      <Link href="/">
        <Button variant="secondary">Terug</Button>
      </Link>
    </main>
  );
}
