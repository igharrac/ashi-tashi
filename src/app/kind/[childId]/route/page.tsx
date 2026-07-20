"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { DIEREN_THEME } from "@/lib/demoData";
import { Card } from "@/components/ui/Card";

/** Leerroute-overzicht: hier alleen het thema Dieren (hfst. 10, 55 stap 5-6). */
export default function LearningRoutePage() {
  const params = useParams<{ childId: string }>();
  const { getChild, ready } = useAppStore();

  if (!ready) return <p className="text-center text-gray-500">Even laden…</p>;

  const child = getChild(params.childId);
  if (!child) return notFound();

  const lesson = DIEREN_THEME.lessons[0];
  const isCompleted = lesson ? child.completedLessonIds.includes(lesson.id) : false;

  return (
    <main className="flex flex-col gap-8">
      <header className="flex items-center gap-3">
        <span className="text-4xl" aria-hidden="true">
          {child.avatarId}
        </span>
        <div>
          <h1 className="text-xl font-bold text-primary-600">Hoi {child.displayName}!</h1>
          <p className="text-sm text-gray-500">{child.points} punten</p>
        </div>
      </header>

      <section aria-labelledby="theme-title">
        <h2 id="theme-title" className="mb-3 text-lg font-semibold text-gray-700">
          Jouw leerroute
        </h2>
        <Card className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-4xl" aria-hidden="true">
              🐾
            </span>
            <div>
              <p className="font-bold">{DIEREN_THEME.titleNl}</p>
              <p className="text-sm text-gray-500">
                {isCompleted ? "Voltooid ✅" : `${lesson?.exercises.length ?? 0} oefeningen`}
              </p>
            </div>
          </div>
          {lesson && (
            <Link
              href={`/kind/${child.id}/les/${lesson.id}`}
              className="rounded-xl2 bg-primary-500 px-5 py-3 font-semibold text-white hover:bg-primary-600
                focus-visible:outline focus-visible:outline-4 focus-visible:outline-info-500"
            >
              {isCompleted ? "Opnieuw oefenen" : "Start"}
            </Link>
          )}
        </Card>
      </section>

      {child.earnedBadgeSlugs.length > 0 && (
        <section aria-labelledby="badges-title">
          <h2 id="badges-title" className="mb-3 text-lg font-semibold text-gray-700">
            Jouw badges
          </h2>
          <p className="text-3xl" aria-hidden="true">
            {child.earnedBadgeSlugs.length} 🏅
          </p>
        </section>
      )}

      <Link href="/" className="text-sm font-medium text-primary-600 underline underline-offset-2">
        Ander kind kiezen
      </Link>
    </main>
  );
}
