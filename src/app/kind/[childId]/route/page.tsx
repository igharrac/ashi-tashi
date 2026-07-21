"use client";

import { notFound, useParams } from "next/navigation";
import { useAppStore } from "@/lib/store";
import { DIEREN_THEME } from "@/lib/demoData";
import { AppShell } from "@/components/layout/AppShell";
import { JourneyPath } from "@/components/journey/JourneyPath";
import { Toggle } from "@/components/ui/Toggle";

/** Leerroute-overzicht: het reispad met thema-eilanden (hfst. 10, 55 stap 5-6). */
export default function LearningRoutePage() {
  const params = useParams<{ childId: string }>();
  const { getChild, setSpeakFirstMode, ready } = useAppStore();

  if (!ready) return <p className="pt-12 text-center text-ink-muted">Even laden…</p>;

  const child = getChild(params.childId);
  if (!child) return notFound();

  const lesson = DIEREN_THEME.lessons[0];
  const isCompleted = lesson ? child.completedLessonIds.includes(lesson.id) : false;

  return (
    <AppShell child={child}>
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-2xl font-bold text-forest-500">Jouw Reis</h1>
        <p className="mt-1 text-ink-muted">{child.points} punten verdiend</p>
      </div>

      <div className="mx-auto max-w-md">
        <Toggle
          checked={child.speakFirstMode}
          onChange={(enabled) => setSpeakFirstMode(child.id, enabled)}
          label="Zelfstandig spreken"
          description={
            child.speakFirstMode
              ? "Aan: plaatje zien en zelf inspreken, zonder het woord eerst te horen."
              : "Uit: eerst het woord horen, dan nazeggen. Geldt vanaf de volgende les."
          }
        />
      </div>

      <JourneyPath childId={child.id} firstLevelCompleted={isCompleted} />
    </AppShell>
  );
}
