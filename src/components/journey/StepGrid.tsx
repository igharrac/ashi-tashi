"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/contentCatalog";
import {
  DAILY_SENTENCES_LESSON_ID,
  getCategoryUnlockStatuses,
  getPracticeCategoryStatuses,
  MIN_RECORDED_SENTENCES_FOR_LESSON,
} from "@/lib/lessonCatalog";
import { getDailySentenceContent, type DailySentenceContent } from "@/lib/dailySentenceContentClient";
import { getPracticeContent, type PracticeContent } from "@/lib/practiceContentClient";
import { getItemIdsWithRecordings } from "@/lib/referenceAudio";
import type { ChildProfileData } from "@/types/domain";
import { StepTile } from "./StepTile";

interface StepGridProps {
  childId: string;
  child: ChildProfileData;
}

/**
 * Reispad als responsive grid (hfst. 10). Elke categorie met genoeg
 * ingesproken woorden (MIN_RECORDED_WORDS_FOR_LESSON, lessonCatalog.ts)
 * krijgt een eigen les — niet meer alleen "dieren" (zie ARCHITECTUUR-
 * OPNAMESTUDIO.md en lessonCatalog.ts). Op verzoek streng opeenvolgend:
 * een categorie ontgrendelt pas als de vorige categorie in de vaste
 * volgorde (CATEGORIES) écht is afgerond — geen los-van-elkaar-open grid.
 */
export function StepGrid({ childId, child }: StepGridProps) {
  const [recordedIds, setRecordedIds] = useState<Set<string> | null>(null);
  const [practiceContent, setPracticeContent] = useState<PracticeContent | null>(null);
  const [dailySentenceContent, setDailySentenceContent] = useState<DailySentenceContent | null>(null);

  useEffect(() => {
    let cancelled = false;
    getItemIdsWithRecordings().then((ids) => {
      if (!cancelled) setRecordedIds(ids);
    });
    getPracticeContent().then((content) => {
      if (!cancelled) setPracticeContent(content);
    });
    getDailySentenceContent().then((content) => {
      if (!cancelled) setDailySentenceContent(content);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  if (recordedIds === null || practiceContent === null || dailySentenceContent === null) {
    return <p className="py-6 text-center text-ink-muted">Even laden…</p>;
  }

  // Streng-opeenvolgende ontgrendeling, gedeeld met Ontdekken/matchspel (zie
  // getCategoryUnlockStatuses in lessonCatalog.ts) zodat die schermen precies
  // dezelfde "welke categorie mag dit kind al zien"-regels gebruiken i.p.v.
  // een eigen kopie.
  const unlockStatuses = getCategoryUnlockStatuses(child.completedLessonIds, recordedIds);

  // "Dagelijkse zinnen" staat bewust los van de keten hierboven (op verzoek:
  // niet gekoppeld aan een woordcategorie, dus ook niet aan de streng-
  // opeenvolgende volgorde). Alleen zichtbaar zodra er genoeg zinnen echt
  // zijn ingesproken — anders leidt de tegel naar een lege les.
  const recordedSentenceCount = dailySentenceContent.sentences.filter((sentence) =>
    recordedIds.has(sentence.id),
  ).length;
  const showDailySentencesTile = recordedSentenceCount >= MIN_RECORDED_SENTENCES_FOR_LESSON;
  const dailySentencesCompleted = child.completedLessonIds.includes(DAILY_SENTENCES_LESSON_ID);

  // "Oefenen"-categorieën (practiceSentences.ts) — alleen zichtbaar voor
  // kinderen op niveau Oefenen of Spreken (child.level), los van de
  // woordcategorie-keten, net als Dagelijkse zinnen hierboven. Ontdekken-
  // niveau ziet deze tegels helemaal niet, ook al zou er content zijn.
  const showPracticeTiles = child.level !== "A_ONTDEKKEN";
  const practiceStatuses = showPracticeTiles
    ? getPracticeCategoryStatuses(child.completedLessonIds, recordedIds, practiceContent)
    : [];

  return (
    <div className="mx-auto grid max-w-3xl grid-cols-3 gap-x-3 gap-y-6 py-6 sm:grid-cols-4 sm:gap-x-4 md:grid-cols-5">
      {showDailySentencesTile && (
        <StepTile
          category={{ emoji: "💬", titleNl: "Dagelijkse zinnen", teaser: "Zinnen die je elke dag gebruikt — altijd beschikbaar" }}
          status={dailySentencesCompleted ? "completed" : "active"}
          href={`/kind/${childId}/les/${DAILY_SENTENCES_LESSON_ID}`}
        />
      )}
      {practiceStatuses.map(({ categorySlug, status, lessonId }) => {
        const category = practiceContent.categories.find((c) => c.slug === categorySlug);
        if (!category || status === "locked") return null;
        return (
          <StepTile
            key={categorySlug}
            category={{ emoji: category.emoji, titleNl: category.titleNl, teaser: `Oefenen: ${category.titleNl.toLowerCase()}` }}
            status={status}
            href={`/kind/${childId}/les/${lessonId}`}
          />
        );
      })}
      {unlockStatuses.map(({ categorySlug, status, lessonId }) => {
        const category = CATEGORIES.find((c) => c.slug === categorySlug);
        if (!category) return null;
        return (
          <StepTile
            key={categorySlug}
            category={category}
            status={status}
            href={status !== "locked" ? `/kind/${childId}/les/${lessonId}` : undefined}
          />
        );
      })}
    </div>
  );
}
