"use client";

import { useEffect, useState } from "react";
import { CATEGORIES, getCatalogItems } from "@/lib/contentCatalog";
import { lessonIdForCategory, MIN_RECORDED_WORDS_FOR_LESSON } from "@/lib/lessonCatalog";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import type { ChildProfileData } from "@/types/domain";
import { StepTile, type StepStatus } from "./StepTile";

interface StepGridProps {
  childId: string;
  child: ChildProfileData;
  /** Dieren behoudt zijn eigen, handmatig samengestelde les-id (met zinnetjes-afsluiting) i.p.v. het generieke "lesson-<categorySlug>"-schema — zie lessonCatalog.ts. */
  dierenLessonId: string;
}

/**
 * Reispad als responsive grid (hfst. 10). Elke categorie met genoeg
 * ingesproken woorden (MIN_RECORDED_WORDS_FOR_LESSON, lessonCatalog.ts)
 * krijgt een eigen les — niet meer alleen "dieren" (zie ARCHITECTUUR-
 * OPNAMESTUDIO.md en lessonCatalog.ts). Op verzoek streng opeenvolgend:
 * een categorie ontgrendelt pas als de vorige categorie in de vaste
 * volgorde (CATEGORIES) écht is afgerond — geen los-van-elkaar-open grid.
 */
export function StepGrid({ childId, child, dierenLessonId }: StepGridProps) {
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

  if (recordedIds === null) {
    return <p className="py-6 text-center text-ink-muted">Even laden…</p>;
  }

  // Wordt op de eerste niet-afgeronde categorie definitief true, en blokkeert
  // dan alle daaropvolgende categorieën — bewust géén "later inhalen":
  // streng op volgorde, zoals gekozen.
  let chainBroken = false;

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-x-3 gap-y-6 py-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5">
      {CATEGORIES.map((category) => {
        const isDieren = category.slug === "dieren";
        const lessonId = isDieren ? dierenLessonId : lessonIdForCategory(category.slug);
        const isCompleted = child.completedLessonIds.includes(lessonId);

        const recordedCount = getCatalogItems().filter(
          (item) => item.categorySlug === category.slug && recordedIds.has(item.id),
        ).length;
        const hasEnoughContent = recordedCount >= MIN_RECORDED_WORDS_FOR_LESSON;

        const canPlay = !chainBroken && hasEnoughContent;
        if (!isCompleted) chainBroken = true; // volgende categorie blokkeren tenzij deze al klaar was

        const status: StepStatus = isCompleted ? "completed" : canPlay ? "active" : "locked";

        return (
          <StepTile
            key={category.slug}
            category={category}
            status={status}
            href={status !== "locked" ? `/kind/${childId}/les/${lessonId}` : undefined}
          />
        );
      })}
    </div>
  );
}
